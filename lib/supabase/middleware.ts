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
  await supabase.auth.getUser();

  return response;
}
