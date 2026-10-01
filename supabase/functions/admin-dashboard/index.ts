import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Supabase function environment is not configured.");
    return jsonResponse({ error: "Dashboard service is not configured" }, 500);
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } =
    await userClient.auth.getUser(token);
  if (authError || !authData.user) {
    return jsonResponse({ error: "Invalid authentication token" }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (profileError) {
    console.error("Admin authorization lookup failed:", profileError.message);
    return jsonResponse(
      { error: "Unable to verify administrator access" },
      500,
    );
  }
  if (profile?.role !== "admin") {
    return jsonResponse({ error: "Administrator access required" }, 403);
  }

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const [
    usersResult,
    newUsersResult,
    studentsResult,
    teachersResult,
    adminsResult,
    coursesResult,
    publishedCoursesResult,
    lessonsResult,
    formationsResult,
    pendingPaymentsResult,
    paidEnrollmentsResult,
    recentUsersResult,
    recentCoursesResult,
  ] = await Promise.all([
    adminClient.from("profiles").select("id", { count: "exact", head: true }),
    adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student"),
    adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "teacher"),
    adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin"),
    adminClient.from("courses").select("id", { count: "exact", head: true }),
    adminClient
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    adminClient.from("lessons").select("id", { count: "exact", head: true }),
    adminClient
      .from("course_series")
      .select("id", { count: "exact", head: true }),
    adminClient
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "pending"),
    adminClient
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "paid"),
    adminClient
      .from("profiles")
      .select("id, full_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    adminClient
      .from("courses")
      .select("id, title, domain, is_published, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const queryErrors = [
    usersResult.error,
    newUsersResult.error,
    studentsResult.error,
    teachersResult.error,
    adminsResult.error,
    coursesResult.error,
    publishedCoursesResult.error,
    lessonsResult.error,
    formationsResult.error,
    pendingPaymentsResult.error,
    paidEnrollmentsResult.error,
    recentUsersResult.error,
    recentCoursesResult.error,
  ].filter((error) => error !== null);
  if (queryErrors.length > 0) {
    console.error("Admin dashboard query failed:", queryErrors[0].message);
    return jsonResponse({ error: "Unable to load admin dashboard" }, 500);
  }

  return jsonResponse({
    total_users: usersResult.count ?? 0,
    new_users_7_days: newUsersResult.count ?? 0,
    students: studentsResult.count ?? 0,
    teachers: teachersResult.count ?? 0,
    administrators: adminsResult.count ?? 0,
    courses: coursesResult.count ?? 0,
    published_courses: publishedCoursesResult.count ?? 0,
    lessons: lessonsResult.count ?? 0,
    formations: formationsResult.count ?? 0,
    pending_payments: pendingPaymentsResult.count ?? 0,
    paid_enrollments: paidEnrollmentsResult.count ?? 0,
    recent_users: (recentUsersResult.data ?? []).map((user) => ({
      id: user.id,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at,
    })),
    recent_courses: (recentCoursesResult.data ?? []).map((course) => ({
      id: course.id,
      title: course.title,
      domain: course.domain,
      is_published: course.is_published,
      created_at: course.created_at,
    })),
  });
});
