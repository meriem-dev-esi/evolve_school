import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const pageSize = 1000;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isMonth(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
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
    return jsonResponse({ error: "Financial service is not configured" }, 500);
  }

  const token = authorization.slice("Bearer ".length).trim();
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

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return jsonResponse({ error: "Invalid financial request" }, 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: "Invalid financial request" }, 400);
  }

  if (body.action === "list") {
    if (!isMonth(body.month)) {
      return jsonResponse({ error: "Month must use YYYY-MM format" }, 400);
    }
    const start = new Date(`${body.month}-01T00:00:00.000Z`);
    const end = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1),
    );
    const { data, error } = await adminClient
      .from("admin_financial_entries")
      .select(
        "id, entry_type, amount_minor_units, category, note, occurred_at, enrollment_id",
      )
      .gte("occurred_at", start.toISOString())
      .lt("occurred_at", end.toISOString())
      .order("occurred_at", { ascending: false });
    if (error) {
      console.error("Financial entries query failed:", error.message);
      return jsonResponse({ error: "Unable to load financial entries" }, 500);
    }
    return jsonResponse({ entries: data });
  }

  if (body.action === "paid-enrollments") {
    const enrollments: Record<string, unknown>[] = [];
    let offset = 0;
    while (true) {
      const { data, error } = await adminClient
        .from("enrollments")
        .select("id, course_id, payment_amount, paid_at")
        .eq("payment_status", "paid")
        .not("payment_amount", "is", null)
        .gt("payment_amount", 0)
        .order("id")
        .range(offset, offset + pageSize - 1);
      if (error) {
        console.error("Paid enrollment query failed:", error.message);
        return jsonResponse({ error: "Unable to load paid enrollments" }, 500);
      }
      enrollments.push(...data);
      if (data.length < pageSize) break;
      offset += pageSize;
    }

    const courseIds = [...new Set(enrollments.map((row) => row.course_id))];
    const courseTitles = new Map<string, string>();
    for (let index = 0; index < courseIds.length; index += pageSize) {
      const ids = courseIds.slice(index, index + pageSize);
      const { data, error } = await adminClient
        .from("courses")
        .select("id, title")
        .in("id", ids);
      if (error) {
        console.error("Refund course lookup failed:", error.message);
        return jsonResponse({ error: "Unable to load course names" }, 500);
      }
      for (const course of data) {
        courseTitles.set(course.id, course.title || "Untitled course");
      }
    }
    return jsonResponse({
      enrollments: enrollments.map((row) => ({
        id: row.id,
        course_id: row.course_id,
        course_title: courseTitles.get(row.course_id) ?? "Course unavailable",
        payment_amount: row.payment_amount,
        paid_at: row.paid_at,
      })),
    });
  }

  if (body.action !== "create") {
    return jsonResponse({ error: "Unsupported financial action" }, 400);
  }
  const entryType = body.entry_type;
  const amountMinorUnits = body.amount_minor_units;
  const category = body.category;
  const note = body.note;
  const occurredAt = body.occurred_at;
  if (
    (entryType !== "expense" && entryType !== "refund") ||
    typeof amountMinorUnits !== "number" ||
    !Number.isSafeInteger(amountMinorUnits) ||
    amountMinorUnits <= 0 ||
    typeof category !== "string" ||
    category.trim().length < 1 ||
    category.trim().length > 80 ||
    typeof note !== "string" ||
    note.trim().length < 1 ||
    note.trim().length > 500 ||
    !isDate(occurredAt)
  ) {
    return jsonResponse({ error: "Invalid financial entry" }, 400);
  }

  if (
    (entryType === "expense" &&
      body.enrollment_id !== undefined &&
      body.enrollment_id !== null) ||
    (entryType === "refund" && typeof body.enrollment_id !== "string")
  ) {
    return jsonResponse({ error: "Invalid enrollment reference" }, 400);
  }

  const { data: entry, error: insertError } = await adminClient.rpc(
    "create_admin_financial_entry",
    {
      p_entry_type: entryType,
      p_amount_minor_units: amountMinorUnits,
      p_category: category.trim(),
      p_note: note.trim(),
      p_occurred_at: new Date(`${occurredAt}T12:00:00.000Z`).toISOString(),
      p_enrollment_id:
        typeof body.enrollment_id === "string" ? body.enrollment_id : null,
      p_recorded_by: authData.user.id,
    },
  );
  if (insertError?.code === "P0001") {
    return jsonResponse({ error: insertError.message }, 400);
  }
  if (insertError) {
    console.error("Financial entry insert failed:", insertError.message);
    return jsonResponse({ error: "Unable to save financial entry" }, 500);
  }

  return jsonResponse({ entry }, 201);
});
