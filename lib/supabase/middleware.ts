import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

/**
 * Refreshes the Supabase auth session on every request.
 *
 * Access tokens are short-lived. Without this, a user who leaves a tab open is
 * signed out by the token expiring rather than by anything they did, and the
 * only symptom is that Server Components start seeing an anonymous caller.
 *
 * It takes the response that the i18n middleware already produced, rather than
 * creating its own. Two middlewares each building a response means one of them
 * wins and the other's cookies — or its locale redirect — are dropped. The
 * order is set in `middleware.ts` at the repository root.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  // 1. Skip Supabase auth calls on prefetch requests to make route prefetching instantaneous
  const isPrefetch =
    request.headers.get("next-router-prefetch") ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose") === "prefetch";

  if (isPrefetch) {
    return response;
  }

  // 2. If the user does not have any Supabase auth cookies, skip remote network validation.
  // This eliminates 200-500ms of latency on every page transition for guests and public routes.
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));

  if (!hasAuthCookie) {
    return response;
  }

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Must be `getUser()`, not `getSession()`. `getSession()` reads the cookie
  // and trusts it; `getUser()` revalidates the token with the auth server. A
  // forged cookie passes the first and fails the second.
  try {
    await supabase.auth.getUser();
  } catch (error) {
    console.error("[Evolve] Supabase auth refresh error:", error);
  }

  return response;
}
