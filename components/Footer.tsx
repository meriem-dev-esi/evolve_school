import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface FooterProps {
  locale?: string;
}

export default function Footer({ locale: _locale }: FooterProps = {}) {
  const tFooter = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tFormations = useTranslations("formations");

  return (
    <footer className="relative border-t border-gray-200 bg-gray-50 text-gray-600 overflow-hidden">
      {/* Subtle top accent */}
      <div className="absolute top-0 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-lime-400 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" prefetch={true} className="inline-block group">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Evolve Academy"
                  width={130}
                  height={42}
                  className="h-9 w-auto brightness-0 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>

            <p className="max-w-sm text-sm text-gray-500 leading-relaxed">
              {tFooter("tagline")}
            </p>

            {/* Live Status Pill */}
            <div className="pt-1 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-lime-200 bg-lime-50 px-3 py-1 text-[11px] font-semibold text-lime-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {tFooter("statusOperational")}
              </span>
            </div>

            <div className="text-xs text-gray-400 pt-1">
              {tFooter("location")}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              {tFooter("navigation")}
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link
                  href="/"
                  prefetch={true}
                  className="transition hover:text-lime-600"
                >
                  {tNav("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/formations"
                  prefetch={true}
                  className="transition hover:text-lime-600"
                >
                  {tNav("formations")}
                </Link>
              </li>
              <li>
                <Link
                  href="/ateliers"
                  prefetch={true}
                  className="transition hover:text-lime-600"
                >
                  {tNav("ateliers")}
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  prefetch={true}
                  className="transition hover:text-lime-600"
                >
                  {tNav("community")}
                </Link>
              </li>
              <li>
                <Link
                  href="/messages"
                  prefetch={true}
                  className="transition hover:text-lime-600"
                >
                  {tNav("messages")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Account */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              {tNav("dashboard")}
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link
                  href="/dashboard"
                  prefetch={true}
                  className="transition hover:text-lime-600"
                >
                  {tNav("dashboard")}
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  prefetch={true}
                  className="transition hover:text-lime-600"
                >
                  {tNav("profile")}
                </Link>
              </li>
              <li>
                <Link
                  href="/disciplines"
                  prefetch={true}
                  className="transition hover:text-lime-600"
                >
                  {tNav("disciplines")}
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  prefetch={true}
                  className="transition hover:text-lime-600"
                >
                  {tNav("signIn")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Specialities */}
          <div className="hidden lg:block">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              {tFormations("specialties")}
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link
                  href="/formations?domain=UI%2FUX"
                  prefetch={true}
                  className="transition hover:text-lime-600"
                >
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link
                  href="/formations?domain=Web"
                  prefetch={true}
                  className="transition hover:text-lime-600"
                >
                  Web Development
                </Link>
              </li>
              <li>
                <Link
                  href="/formations?domain=Mobile"
                  prefetch={true}
                  className="transition hover:text-lime-600"
                >
                  Mobile Development
                </Link>
              </li>
              <li>
                <Link
                  href="/formations?domain=Data%20%26%20AI"
                  prefetch={true}
                  className="transition hover:text-lime-600"
                >
                  Data &amp; AI
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p className="flex items-center gap-1.5">
            <span>{tFooter("rights")}</span>
          </p>
          <div className="flex gap-6">
            <Link
              href="/formations"
              prefetch={true}
              className="hover:text-lime-600 transition"
            >
              {tNav("formations")}
            </Link>
            <Link
              href="/community"
              prefetch={true}
              className="hover:text-lime-600 transition"
            >
              {tNav("community")}
            </Link>
            <Link
              href="/messages"
              prefetch={true}
              className="hover:text-lime-600 transition"
            >
              {tFooter("contact")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
