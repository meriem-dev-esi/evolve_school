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
    return jsonResponse({ error: "Revenue service is not configured" }, 500);
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

  const { count: pendingEnrollments, error: pendingError } = await adminClient
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("payment_status", "pending");
  if (pendingError) {
    console.error("Pending enrollment query failed:", pendingError.message);
    return jsonResponse({ error: "Unable to load pending checkouts" }, 500);
  }

  let totalMinorUnits = 0;
  let paidEnrollments = 0;
  let enrollmentsWithoutAmount = 0;
  let offset = 0;
  const pageSize = 1000;
  const enrollmentCourses = new Map<string, string>();
  const courseRevenue = new Map<
    string,
    {
      courseTitle: string;
      currentPrice: number | null;
      totalMinorUnits: number;
      refundsMinorUnits: number;
      paidEnrollments: number;
      enrollmentsWithoutAmount: number;
    }
  >();

  while (true) {
    const { data: courses, error: coursesError } = await adminClient
      .from("courses")
      .select("id, title, price")
      .order("id")
      .range(offset, offset + pageSize - 1);
    if (coursesError) {
      console.error("Course revenue lookup failed:", coursesError.message);
      return jsonResponse({ error: "Unable to load courses" }, 500);
    }

    for (const course of courses) {
      const currentPrice = course.price === null ? null : Number(course.price);
      if (
        currentPrice !== null &&
        (!Number.isFinite(currentPrice) || currentPrice < 0)
      ) {
        console.error("Invalid current course price.");
        return jsonResponse({ error: "Invalid course price" }, 500);
      }
      courseRevenue.set(course.id, {
        courseTitle: course.title || "Untitled course",
        currentPrice,
        totalMinorUnits: 0,
        refundsMinorUnits: 0,
        paidEnrollments: 0,
        enrollmentsWithoutAmount: 0,
      });
    }
    if (courses.length < pageSize) break;
    offset += pageSize;
  }

  offset = 0;
  while (true) {
    const { data: rows, error: enrollmentsError } = await adminClient
      .from("enrollments")
      .select("id, course_id, payment_amount")
      .eq("payment_status", "paid")
      .order("enrolled_at")
      .order("id")
      .range(offset, offset + pageSize - 1);
    if (enrollmentsError) {
      console.error(
        "Revenue enrollment query failed:",
        enrollmentsError.message,
      );
      return jsonResponse({ error: "Unable to load paid enrollments" }, 500);
    }

    paidEnrollments += rows.length;
    for (const row of rows) {
      const courseId = row.course_id ?? "unavailable";
      enrollmentCourses.set(row.id, courseId);
      let course = courseRevenue.get(courseId);
      if (!course) {
        course = {
          courseTitle: "Course unavailable",
          currentPrice: null,
          totalMinorUnits: 0,
          refundsMinorUnits: 0,
          paidEnrollments: 0,
          enrollmentsWithoutAmount: 0,
        };
        courseRevenue.set(courseId, course);
      }
      course.paidEnrollments++;

      if (row.payment_amount === null) {
        enrollmentsWithoutAmount++;
        course.enrollmentsWithoutAmount++;
        continue;
      }

      const amount = Number(row.payment_amount);
      if (!Number.isFinite(amount) || amount < 0) {
        console.error("Invalid stored payment amount in paid enrollment.");
        return jsonResponse({ error: "Invalid stored payment amount" }, 500);
      }
      if (amount === 0 && course.currentPrice !== 0) {
        enrollmentsWithoutAmount++;
        course.enrollmentsWithoutAmount++;
        continue;
      }
      const amountMinorUnits = Math.round(amount * 100);
      if (!Number.isSafeInteger(amountMinorUnits)) {
        console.error("Stored payment amount exceeds safe precision.");
        return jsonResponse({ error: "Invalid stored payment amount" }, 500);
      }
      totalMinorUnits += amountMinorUnits;
      course.totalMinorUnits += amountMinorUnits;
      if (!Number.isSafeInteger(totalMinorUnits)) {
        console.error("Revenue total exceeds safe precision.");
        return jsonResponse(
          { error: "Revenue total exceeds safe precision" },
          500,
        );
      }
      if (!Number.isSafeInteger(course.totalMinorUnits)) {
        console.error("Course revenue total exceeds safe precision.");
        return jsonResponse(
          { error: "Course revenue total exceeds safe precision" },
          500,
        );
      }
    }

    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  let refundsMinorUnits = 0;
  let expensesMinorUnits = 0;
  offset = 0;
  while (true) {
    const { data: entries, error: entriesError } = await adminClient
      .from("admin_financial_entries")
      .select("entry_type, amount_minor_units, enrollment_id")
      .order("id")
      .range(offset, offset + pageSize - 1);
    if (entriesError) {
      console.error("Financial deductions query failed:", entriesError.message);
      return jsonResponse(
        { error: "Unable to load financial deductions" },
        500,
      );
    }
    for (const entry of entries) {
      const amount = Number(entry.amount_minor_units);
      if (!Number.isSafeInteger(amount) || amount <= 0) {
        console.error("Invalid amount in financial entry.");
        return jsonResponse({ error: "Invalid financial entry amount" }, 500);
      }
      if (entry.entry_type === "expense") {
        expensesMinorUnits += amount;
        if (!Number.isSafeInteger(expensesMinorUnits)) {
          console.error("Expenses total exceeds safe precision.");
          return jsonResponse(
            { error: "Expenses total exceeds safe precision" },
            500,
          );
        }
        continue;
      }
      if (
        entry.entry_type !== "refund" ||
        typeof entry.enrollment_id !== "string"
      ) {
        console.error("Invalid refund entry.");
        return jsonResponse({ error: "Invalid financial entry" }, 500);
      }
      refundsMinorUnits += amount;
      if (!Number.isSafeInteger(refundsMinorUnits)) {
        console.error("Refunds total exceeds safe precision.");
        return jsonResponse(
          { error: "Refunds total exceeds safe precision" },
          500,
        );
      }
      const courseId = enrollmentCourses.get(entry.enrollment_id);
      if (!courseId) {
        console.error("Refund references an enrollment outside paid records.");
        return jsonResponse(
          { error: "Invalid refund enrollment reference" },
          500,
        );
      }
      const course = courseRevenue.get(courseId);
      if (!course) {
        console.error("Refund course is missing from the revenue breakdown.");
        return jsonResponse({ error: "Unable to allocate course refund" }, 500);
      }
      course.refundsMinorUnits += amount;
      if (!Number.isSafeInteger(course.refundsMinorUnits)) {
        console.error("Course refund total exceeds safe precision.");
        return jsonResponse(
          { error: "Course refund total exceeds safe precision" },
          500,
        );
      }
    }
    if (entries.length < pageSize) break;
    offset += pageSize;
  }

  const netMinorUnits =
    totalMinorUnits - refundsMinorUnits - expensesMinorUnits;
  if (!Number.isSafeInteger(netMinorUnits)) {
    console.error("Net revenue exceeds safe precision.");
    return jsonResponse({ error: "Net revenue exceeds safe precision" }, 500);
  }
  for (const course of courseRevenue.values()) {
    if (course.refundsMinorUnits > course.totalMinorUnits) {
      console.error("Course refunds exceed recorded course revenue.");
      return jsonResponse(
        { error: "Course refunds exceed recorded course revenue" },
        500,
      );
    }
  }

  return jsonResponse({
    total_minor_units: totalMinorUnits,
    gross_revenue_minor_units: totalMinorUnits,
    refunds_minor_units: refundsMinorUnits,
    expenses_minor_units: expensesMinorUnits,
    net_minor_units: netMinorUnits,
    paid_enrollments: paidEnrollments,
    pending_enrollments: pendingEnrollments ?? 0,
    enrollments_without_amount: enrollmentsWithoutAmount,
    course_revenues: [...courseRevenue.entries()]
      .map(([courseId, revenue]) => ({
        course_id: courseId,
        course_title: revenue.courseTitle,
        total_minor_units: revenue.totalMinorUnits,
        refunds_minor_units: revenue.refundsMinorUnits,
        net_minor_units: revenue.totalMinorUnits - revenue.refundsMinorUnits,
        paid_enrollments: revenue.paidEnrollments,
        enrollments_without_amount: revenue.enrollmentsWithoutAmount,
      }))
      .sort((a, b) => b.total_minor_units - a.total_minor_units),
  });
});
