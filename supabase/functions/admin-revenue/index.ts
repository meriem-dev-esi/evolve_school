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

  var totalMinorUnits = 0;
  var paidEnrollments = 0;
  var enrollmentsWithoutAmount = 0;
  var offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data: rows, error: enrollmentsError } = await adminClient
      .from("enrollments")
      .select("payment_amount")
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
      if (row.payment_amount === null) {
        enrollmentsWithoutAmount++;
        continue;
      }

      const amount = Number(row.payment_amount);
      if (!Number.isFinite(amount) || amount < 0) {
        console.error("Invalid stored payment amount in paid enrollment.");
        return jsonResponse({ error: "Invalid stored payment amount" }, 500);
      }
      const amountMinorUnits = Math.round(amount * 100);
      if (!Number.isSafeInteger(amountMinorUnits)) {
        console.error("Stored payment amount exceeds safe precision.");
        return jsonResponse({ error: "Invalid stored payment amount" }, 500);
      }
      totalMinorUnits += amountMinorUnits;
      if (!Number.isSafeInteger(totalMinorUnits)) {
        console.error("Revenue total exceeds safe precision.");
        return jsonResponse(
          { error: "Revenue total exceeds safe precision" },
          500,
        );
      }
    }

    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  return jsonResponse({
    total_minor_units: totalMinorUnits,
    paid_enrollments: paidEnrollments,
    pending_enrollments: pendingEnrollments ?? 0,
    enrollments_without_amount: enrollmentsWithoutAmount,
  });
});
