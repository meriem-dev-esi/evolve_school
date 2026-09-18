
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
};

export default function Navbar() {
  const locale = useLocale();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(data);
      setLoading(false);
    }

    void loadProfile();
  }, []);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = `/${locale}/sign-in`;
  }

  const displayName =
    profile?.full_name?.trim() || "Profile";

  return (
    <nav className="absolute left-0 top-0 z-50 w-full">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link href={`/${locale}`} className="shrink-0">
          <Image
            src="/logo.png"
            alt="Evolve"
            width={150}
            height={50}
            priority
            className="h-auto w-16"
          />
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href={`/${locale}`}
            className="text-sm font-medium text-white transition-colors hover:text-brand"
          >
            Accueil
          </Link>

<Link 
  href={`/${locale}/formations`} 
  className="text-sm font-medium text-white transition-colors hover:text-brand" 
> 
  Formation 
</Link>

          <Link
            href={`/${locale}/dashboard`}
            className="text-sm font-medium text-white transition-colors hover:text-brand"
          >
            Dashboard
          </Link>

          <Link
            href={`/${locale}/profile`}
            className="text-sm font-medium text-white transition-colors hover:text-brand"
          >
            Profile
          </Link>

          <Link
            href={`/${locale}`}
            className="text-sm font-medium text-white transition-colors hover:text-brand"
          >
            Atelier
          </Link>

          <Link
            href={`/${locale}`}
            className="text-sm font-medium text-white transition-colors hover:text-brand"
          >
            Colab Formation
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-sm font-semibold text-white transition-colors hover:text-brand"
          >
            AR
          </button>

          {!loading && profile && (
            <Link
              href={`/${locale}/profile`}
              className="flex items-center gap-3"
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-10 w-10 rounded-full border border-white/20 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-bold text-black">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <span className="hidden max-w-32 truncate text-sm font-semibold text-white lg:block">
                {displayName}
              </span>
            </Link>
          )}

          {!profile && !loading && (
            <Link
              href={`/${locale}/sign-in`}
              className="rounded-pill border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:border-brand hover:bg-brand hover:text-brand-contrast"
            >
              Sign In
            </Link>
          )}

          {profile && (
            <button
              type="button"
              onClick={() => {
                void handleLogout();
              }}
              className="rounded-pill border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:border-red-400 hover:bg-red-400 hover:text-white"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

