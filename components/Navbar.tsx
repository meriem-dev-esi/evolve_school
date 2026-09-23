"use client";

import { Globe, LogOut, Menu, User, X } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
};

let cachedProfile: Profile | null = null;
let cachedProfileLoaded = false;

export default function Navbar() {
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(cachedProfile);

  const [loading, setLoading] = useState(!cachedProfileLoaded);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  /* =====================================================
     SCROLL
  ===================================================== */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {
    if (cachedProfileLoaded) {
      return;
    }

    const supabase = createClient();

    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          cachedProfileLoaded = true;
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        cachedProfile = data;
        cachedProfileLoaded = true;
        setProfile(data);
      } catch (err) {
        console.error("[Evolve] Navbar profile load error:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  /* =====================================================
     LOGOUT
  ===================================================== */

  async function handleLogout() {
    cachedProfile = null;
    cachedProfileLoaded = false;
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/sign-in");
  }

  const displayName = profile?.full_name?.trim() || tNav("profile");

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const navLinks = [
    {
      href: "/",
      label: tNav("home"),
    },
    {
      href: "/formations",
      label: tNav("formations"),
    },
    {
      href: "/ateliers",
      label: tNav("ateliers"),
    },
    {
      href: "/community",
      label: tNav("community"),
    },
    {
      href: "/messages",
      label: tNav("messages"),
    },
    {
      href: "/dashboard",
      label: tNav("dashboard"),
    },
  ];

  /* =====================================================
     ACTIVE LINK
  ===================================================== */

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "";
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ===================================================
          DESKTOP NAVBAR
      =================================================== */}

      <nav
        className="
          fixed
          left-1/2
          top-5
          z-50
          hidden
          w-[calc(100%-32px)]
          max-w-[1280px]
          -translate-x-1/2
          lg:block
          transition-all
          duration-300
        "
      >
        <div
          className={`
            flex
            h-[68px]
            items-center
            rounded-full
            border
            border-white/[0.10]
            bg-[#0b0b0b]/75
            px-3
            backdrop-blur-2xl
            transition-all
            duration-300

            ${
              scrolled
                ? `
                  bg-[#090909]/90
                  border-white/[0.14]
                  shadow-[0_12px_50px_rgba(0,0,0,0.45)]
                `
                : `
                  shadow-[0_8px_40px_rgba(0,0,0,0.25)]
                `
            }
          `}
        >
          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            href="/"
            prefetch={true}
            className="
              group
              flex
              shrink-0
              items-center
              rounded-full
              px-4
            "
          >
            <Image
              src="/logo.png"
              alt="Evolve"
              width={140}
              height={44}
              priority
              className="
                h-9
                w-auto
                object-contain
                transition-transform
                duration-300
                group-hover:scale-105
              "
            />
          </Link>

          {/* Vertical divider */}

          <div
            className="
              mx-1
              h-7
              w-px
              bg-white/[0.08]
            "
          />

          {/* =================================================
              CENTER NAVIGATION
          ================================================= */}

          <div
            className="
              flex
              min-w-0
              flex-1
              items-center
              justify-center
            "
          >
            <div
              className="
                flex
                items-center
                gap-0.5
              "
            >
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    className={`
                      relative
                      rounded-full
                      px-4
                      py-2.5
                      text-[12px]
                      font-medium
                      tracking-wide
                      transition-all
                      duration-200

                      ${
                        active
                          ? `
                            bg-lime-400/[0.10]
                            text-lime-400
                          `
                          : `
                            text-white/55
                            hover:bg-white/[0.06]
                            hover:text-white
                          `
                      }
                    `}
                  >
                    {link.label}

                    {active && (
                      <span
                        className="
                          absolute
                          bottom-1
                          left-1/2
                          h-1
                          w-1
                          -translate-x-1/2
                          rounded-full
                          bg-lime-400
                          shadow-[0_0_8px_rgba(163,230,53,0.8)]
                        "
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-1
            "
          >
            {/* ===============================================
                LANGUAGE
            =============================================== */}

            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="
                  flex
                  h-10
                  items-center
                  gap-1.5
                  rounded-full
                  px-3
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-white/55
                  transition
                  hover:bg-white/[0.06]
                  hover:text-white
                "
                aria-label={tNav("changeLanguage")}
              >
                <Globe
                  className="
                    h-3.5
                    w-3.5
                    text-lime-400
                  "
                />

                <span>{locale}</span>

                <span className="text-[8px] opacity-40">▼</span>
              </button>

              {/* Language dropdown */}

              {langDropdownOpen && (
                <div
                  className="
                    absolute
                    end-0
                    top-12
                    z-50
                    w-32
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#0b0b0b]/95
                    p-1.5
                    shadow-2xl
                    backdrop-blur-xl
                  "
                >
                  {(
                    [
                      ["fr", "Français"],
                      ["ar", "العربية"],
                      ["en", "English"],
                    ] as [string, string][]
                  ).map(([code, label]) => (
                    <Link
                      key={code}
                      href={pathname || "/"}
                      locale={code}
                      onClick={() => setLangDropdownOpen(false)}
                      className={`
                          flex
                          items-center
                          justify-between
                          rounded-xl
                          px-3
                          py-2.5
                          text-xs
                          transition

                          ${
                            locale === code
                              ? `
                                bg-lime-400/[0.10]
                                font-bold
                                text-lime-400
                              `
                              : `
                                text-white/55
                                hover:bg-white/[0.06]
                                hover:text-white
                              `
                          }
                        `}
                    >
                      <span>{label}</span>

                      {locale === code && (
                        <span
                          className="
                              h-1.5
                              w-1.5
                              rounded-full
                              bg-lime-400
                            "
                        />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* ===============================================
                LOGGED-IN USER
            =============================================== */}

            {!loading && profile && (
              <div
                className="
                    ms-1
                    flex
                    items-center
                    gap-1
                  "
              >
                <Link
                  href="/profile"
                  className="
                      group
                      flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-white/[0.08]
                      bg-white/[0.035]
                      p-1
                      pe-3
                      transition
                      hover:border-lime-400/30
                      hover:bg-lime-400/[0.07]
                    "
                >
                  <div className="relative">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="
                            h-7
                            w-7
                            rounded-full
                            border
                            border-white/10
                            object-cover
                          "
                      />
                    ) : (
                      <div
                        className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-full
                            bg-lime-400
                            text-xs
                            font-black
                            text-black
                          "
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <span
                      className="
                          absolute
                          bottom-0
                          end-0
                          h-2
                          w-2
                          rounded-full
                          border
                          border-[#0b0b0b]
                          bg-lime-400
                        "
                    />
                  </div>

                  <span
                    className="
                        hidden
                        max-w-24
                        truncate
                        text-[11px]
                        font-semibold
                        text-white/70
                        transition
                        group-hover:text-lime-400
                        xl:block
                      "
                  >
                    {displayName}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    void handleLogout();
                  }}
                  title={tNav("signOut")}
                  className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      text-white/40
                      transition
                      hover:bg-red-400/10
                      hover:text-red-400
                    "
                >
                  <LogOut
                    className="
                        h-3.5
                        w-3.5
                      "
                  />
                </button>
              </div>
            )}

            {/* ===============================================
                GUEST
            =============================================== */}

            {!profile && !loading && (
              <Link
                href="/sign-in"
                className="
                    ms-1
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-lime-400
                    px-5
                    py-2.5
                    text-[11px]
                    font-bold
                    text-black
                    transition-all
                    duration-200
                    hover:bg-lime-300
                    hover:scale-[1.03]
                    hover:shadow-[0_0_25px_rgba(163,230,53,0.20)]
                    active:scale-[0.98]
                  "
              >
                <User
                  className="
                      h-3.5
                      w-3.5
                    "
                />

                <span>{tNav("signIn")}</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* =====================================================
          MOBILE NAVBAR
      ===================================================== */}

      <nav
        className="
          fixed
          left-1/2
          top-4
          z-50
          w-[calc(100%-24px)]
          -translate-x-1/2
          lg:hidden
        "
      >
        <div
          className="
            flex
            h-[60px]
            items-center
            justify-between
            rounded-full
            border
            border-white/[0.10]
            bg-[#0b0b0b]/80
            px-3
            shadow-[0_10px_40px_rgba(0,0,0,0.35)]
            backdrop-blur-2xl
          "
        >
          {/* Mobile logo */}

          <Link href="/" className="px-3">
            <Image
              src="/logo.png"
              alt="Evolve"
              width={140}
              height={44}
              priority
              className="
                h-8
                w-auto
                object-contain
              "
            />
          </Link>

          {/* Mobile Language & Menu Buttons */}

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-[11px] font-semibold">
              {(
                [
                  ["fr", "FR"],
                  ["ar", "ع"],
                  ["en", "EN"],
                ] as [string, string][]
              ).map(([code, label]) => (
                <Link
                  key={code}
                  href={pathname || "/"}
                  locale={code}
                  className={`rounded-full px-2 py-0.5 transition ${
                    locale === code
                      ? "bg-lime-400 font-bold text-black"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-white/70
                transition
                hover:bg-white/[0.07]
                hover:text-lime-400
              "
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* ===================================================
            MOBILE MENU
        =================================================== */}

        {mobileMenuOpen && (
          <div
            className="
              mt-2
              overflow-hidden
              rounded-[28px]
              border
              border-white/10
              bg-[#0b0b0b]/95
              p-2
              shadow-2xl
              backdrop-blur-2xl
            "
          >
            <div className="flex flex-col">
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex
                      items-center
                      justify-between
                      rounded-2xl
                      px-4
                      py-3.5
                      text-sm
                      font-semibold
                      transition

                      ${
                        active
                          ? `
                            bg-lime-400/[0.10]
                            text-lime-400
                          `
                          : `
                            text-white/60
                            hover:bg-white/[0.06]
                            hover:text-white
                          `
                      }
                    `}
                  >
                    <span>{link.label}</span>

                    {active && (
                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-lime-400
                        "
                      />
                    )}
                  </Link>
                );
              })}

              {/* Mobile user */}

              {profile ? (
                <div
                  className="
                    mt-2
                    flex
                    items-center
                    justify-between
                    border-t
                    border-white/10
                    px-4
                    pt-4
                  "
                >
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="
                      flex
                      items-center
                      gap-3
                      text-sm
                      font-medium
                      text-white
                    "
                  >
                    <User
                      className="
                        h-4
                        w-4
                        text-lime-400
                      "
                    />

                    <span>{displayName}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);

                      void handleLogout();
                    }}
                    className="
                      flex
                      items-center
                      gap-1.5
                      text-xs
                      font-semibold
                      text-red-400
                    "
                  >
                    <LogOut
                      className="
                        h-3.5
                        w-3.5
                      "
                    />

                    <span>{tNav("signOut")}</span>
                  </button>
                </div>
              ) : (
                !loading && (
                  <div className="mt-2 border-t border-white/10 px-4 pt-3">
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 py-3 text-xs font-bold text-black"
                    >
                      <User className="h-4 w-4" />
                      <span>{tNav("signIn")}</span>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
