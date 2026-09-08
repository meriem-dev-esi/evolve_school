import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * A Supabase client for Server Components and Server Actions, running as the
 * caller.
 *
 * There is deliberately no service-role client anywhere in this app. Every read
 * runs under the signed-in user's identity — or under `anon` for a visitor —
 * so what comes back is exactly what the row-level security policies in
 * `evolve_academy_dashboard/supabase/migrations/` say that person may see.
 *
 * That is what makes it safe to call these queries straight from a Server
 * Component without an authorization check in the component. The check already
 * happened, in Postgres.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // middleware refreshes the session on every request, so the write
          // that failed here has already happened there. Swallowing it is
          // correct; swallowing it silently is not, hence this comment.
        }
      },
    },
  });
}
