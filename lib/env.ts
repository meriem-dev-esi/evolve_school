/**
 * The only file in the app that reads `process.env`.
 *
 * `scripts/env_guard.sh` enforces that, and the reason is a failure mode rather
 * than a style preference: a `process.env.NEXT_PUBLIC_SUPABASE_URL` read inline
 * in a component is `undefined` at runtime when the variable is missing, and the
 * app renders an empty list instead of an error. The bug surfaces as "the
 * disciplines page is blank", three layers away from the missing variable.
 *
 * Reading them here means a missing variable throws on the first import, with
 * the name of the variable in the message.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local ` +
        "and fill it in — see the comments in that file for where the values " +
        "come from.",
    );
  }
  // A trailing slash on the Supabase URL produces `//rest/v1` and a 404 that
  // looks nothing like a configuration problem. Strip it here, once.
  return value.replace(/\/+$/, "");
}

export const env = {
  supabaseUrl: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabaseAnonKey: required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
} as const;
