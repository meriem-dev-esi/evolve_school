import Link from "next/link";
import Image from "next/image";

interface FooterProps {
  locale?: string;
}

export default function Footer({ locale = "fr" }: FooterProps) {
  const isArabic = locale === "ar";
  const isEnglish = locale === "en";

  const labels = isArabic
    ? {
        tagline: "منصة التكوين والورشات الإبداعية الرائدة في الجزائر.",
        navigation: "التنقل",
        home: "الرئيسية",
        formations: "التكوينات",
        workshops: "الورشات",
        community: "المجتمع",
        messages: "الرسائل",
        dashboard: "لوحة التحكم",
        contact: "اتصل بنا",
        rights: "جميع الحقوق محفوظة. أكاديمية إيفولف © 2026",
      }
    : isEnglish
    ? {
        tagline: "The leading creative & technology learning academy in Algeria.",
        navigation: "Navigation",
        home: "Home",
        formations: "Courses",
        workshops: "Workshops",
        community: "Community",
        messages: "Messages",
        dashboard: "Dashboard",
        contact: "Contact",
        rights: "All rights reserved. Evolve Academy © 2026",
      }
    : {
        tagline: "L'académie d'élite pour les métiers du numérique et du design en Algérie.",
        navigation: "Navigation",
        home: "Accueil",
        formations: "Formations",
        workshops: "Ateliers",
        community: "Communauté",
        messages: "Messagerie",
        dashboard: "Tableau de bord",
        contact: "Contact",
        rights: "Tous droits réservés. Evolve Academy © 2026",
      };

  return (
    <footer className="relative border-t border-gray-200 bg-gray-50 text-gray-600 overflow-hidden">
      {/* Subtle top accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-violet-300 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href={`/${locale}`} className="inline-block group">
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
              {labels.tagline}
            </p>

            {/* Live Status Pill */}
            <div className="pt-1 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold text-violet-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Plateforme Opérationnelle 24/7
              </span>
            </div>

            <div className="text-xs text-gray-400 pt-1">
              Alger, Algérie · contact@evolve-academy.dz
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              {labels.navigation}
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href={`/${locale}`} className="transition hover:text-violet-700">
                  {labels.home}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/formations`} className="transition hover:text-violet-700">
                  {labels.formations}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/ateliers`} className="transition hover:text-violet-700">
                  {labels.workshops}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/community`} className="transition hover:text-violet-700">
                  {labels.community}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/messages`} className="transition hover:text-violet-700">
                  {labels.messages}
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Account */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Espace Membre
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href={`/${locale}/dashboard`} className="transition hover:text-violet-700">
                  {labels.dashboard}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/profile`} className="transition hover:text-violet-700">
                  Mon profil
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/disciplines`} className="transition hover:text-violet-700">
                  Parcours Certifiants
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/sign-in`} className="transition hover:text-violet-700">
                  Connexion / Inscription
                </Link>
              </li>
            </ul>
          </div>

          {/* Specialities */}
          <div className="hidden lg:block">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Spécialités
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href={`/${locale}/formations?domain=UI%2FUX`} className="transition hover:text-violet-700">
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/formations?domain=Web`} className="transition hover:text-violet-700">
                  Développement Web
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/formations?domain=Mobile`} className="transition hover:text-violet-700">
                  Applications Mobiles
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/formations?domain=3D`} className="transition hover:text-violet-700">
                  3D &amp; Animation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p className="flex items-center gap-1.5">
            <span>{labels.rights}</span>
            <span>·</span>
            <span>Conçu avec passion à Alger 🇩🇿</span>
          </p>
          <div className="flex gap-6">
            <Link href={`/${locale}/formations`} className="hover:text-violet-700 transition">
              Catalogue
            </Link>
            <Link href={`/${locale}/community`} className="hover:text-violet-700 transition">
              Showcase
            </Link>
            <Link href={`/${locale}/messages`} className="hover:text-violet-700 transition">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
