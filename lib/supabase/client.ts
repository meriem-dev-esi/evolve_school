import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * A Supabase client for Client Components.
 *
 * Reach for this only when the browser genuinely needs to talk to Supabase
 * itself — sign-in, sign-out, a realtime subscription. Reading content belongs
 * in a Server Component via `lib/supabase/server.ts`: it keeps the query off
 * the client bundle and out of the network tab, and it renders with the data
 * already present instead of flashing a spinner.
 */
export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
