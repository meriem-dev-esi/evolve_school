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
    return jsonResponse(
      { error: "Role-management service is not configured" },
      500,
    );
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON request body" }, 400);
  }
  if (typeof body !== "object" || body === null) {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const payload = body as Record<string, unknown>;
  const targetUserId =
    typeof payload.user_id === "string" ? payload.user_id.trim() : "";
  const role = payload.role;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      targetUserId,
    )
  ) {
    return jsonResponse({ error: "A valid user ID is required" }, 400);
  }
  if (role !== "student" && role !== "teacher" && role !== "admin") {
    return jsonResponse({ error: "Unsupported profile role" }, 400);
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
  const { data, error } = await adminClient.rpc("admin_update_profile_role", {
    p_actor_id: authData.user.id,
    p_target_user_id: targetUserId,
    p_new_role: role,
  });
  if (error) {
    if (error.code === "P0002") {
      return jsonResponse({ error: "User profile not found" }, 404);
    }
    if (error.code === "42501") {
      return jsonResponse({ error: error.message }, 403);
    }
    if (error.code === "22023") {
      return jsonResponse({ error: "Unsupported profile role" }, 400);
    }
    console.error("Admin role update failed:", error.message);
    return jsonResponse({ error: "Unable to update user role" }, 500);
  }

  const profile = Array.isArray(data) ? data[0] : null;
  if (!profile) {
    console.error("Admin role update completed without a returned profile.");
    return jsonResponse({ error: "Unable to confirm updated user role" }, 500);
  }

  return jsonResponse({
    user_id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    role: profile.role,
  });
});
