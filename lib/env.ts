export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export function optionalEnv(key: string, fallback = ""): string {
  return process.env[key] || fallback;
}

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  get nodeEnv(): string {
    return process.env.NODE_ENV || "development";
  },
  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },
  get supabaseUrl(): string {
    return required(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL",
    );
  },
  get supabaseAnonKey(): string {
    return required(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  },
  get supabaseServiceRoleKey(): string {
    return (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      ""
    );
  },
  get chargilyMode(): "test" | "live" {
    const mode = process.env.CHARGILY_MODE?.toLowerCase();
    return mode === "live" ? "live" : "test";
  },
  get chargilySecretKey(): string {
    return (
      process.env.CHARGILY_SECRET_KEY ||
      process.env.CHARGILY_API_KEY ||
      ""
    );
  },
  get chargilyApiKey(): string {
    return (
      process.env.CHARGILY_API_KEY ||
      process.env.CHARGILY_SECRET_KEY ||
      ""
    );
  },
  get chargilyApiUrl(): string {
    if (process.env.CHARGILY_API_URL) {
      return process.env.CHARGILY_API_URL;
    }
    return this.chargilyMode === "live"
      ? "https://pay.chargily.net/api/v2"
      : "https://pay.chargily.net/test/api/v2";
  },
  get siteUrl(): string {
    return (
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.APP_URL ||
      "https://evolve-academy.dz"
    );
  },
  get appUrl(): string {
    return (
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000"
    );
  },
};