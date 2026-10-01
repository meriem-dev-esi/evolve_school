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
    return jsonResponse({ error: "Invitation service is not configured" }, 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON request body" }, 400);
  }
  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String(body.email).trim().toLowerCase()
      : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: "A valid email address is required" }, 400);
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

  const { data: inviteData, error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: "Evolve Administrator", role: "admin" },
    });
  if (inviteError || !inviteData.user) {
    console.error("Administrator invitation failed:", inviteError?.message);
    return jsonResponse(
      { error: inviteError?.message ?? "Unable to create invitation" },
      400,
    );
  }

  const { error: roleError } = await adminClient.from("profiles").upsert(
    {
      id: inviteData.user.id,
      email,
      full_name: "Evolve Administrator",
      role: "admin",
    },
    { onConflict: "id" },
  );
  if (roleError) {
    const { error: rollbackError } = await adminClient.auth.admin.deleteUser(
      inviteData.user.id,
    );
    if (rollbackError) {
      console.error(
        "Failed to revoke incomplete admin invite:",
        rollbackError.message,
      );
    }
    console.error("Unable to assign admin role to invite:", roleError.message);
    return jsonResponse(
      { error: "Invitation could not be assigned administrator access" },
      500,
    );
  }

  return jsonResponse({ email, role: "admin", invited: true });
});
