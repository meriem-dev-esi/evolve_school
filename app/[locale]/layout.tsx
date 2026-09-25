import "../globals.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import ZoomGridBackground from "@/components/ZoomGridBackground";
import { directionOf, routing } from "@/i18n/routing";
import { env } from "@/lib/env";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = env.siteUrl;

  const isArabic = locale === "ar";
  const isEnglish = locale === "en";

  const title = isArabic
    ? "أكاديمية إيفولف — منصة التكوين والورشات الإبداعية في الجزائر"
    : isEnglish
      ? "Evolve Academy — Creative & Tech Courses & Workshops in Algeria"
      : "Evolve Academy — Formations & Ateliers Créatifs en Algérie";

  const description = isArabic
    ? "اكتشف دورات احترافية، ورشات عمل حضورية، ومجتمع نشط من المصممين والمطورين في الجزائر. طور مهاراتك مع أفضل الخبراء."
    : isEnglish
      ? "Discover professional courses, hands-on workshops, and an active community of creators and developers in Algeria. Evolve your skills."
      : "Découvrez des formations professionnelles, des ateliers pratiques et une communauté créative de designers et développeurs en Algérie.";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: "%s | Evolve Academy",
    },
    description,
    keywords: [
      "formation Algérie",
      "formation Alger",
      "ateliers design",
      "développement web Alger",
      "cours en ligne Algérie",
      "UI UX design Alger",
      "Fullstack Next.js",
      "Evolve Academy",
      "تكوين في الجزائر",
      "دورات تصميم وبرمجة",
    ],
    authors: [{ name: "Evolve Academy" }],
    creator: "Evolve Academy",
    publisher: "Evolve Academy",
    applicationName: "Evolve Academy",
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        "fr-DZ": `${baseUrl}/fr`,
        "ar-DZ": `${baseUrl}/ar`,
        "en-US": `${baseUrl}/en`,
        "x-default": `${baseUrl}/fr`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Evolve Academy",
      locale: isArabic ? "ar_DZ" : isEnglish ? "en_US" : "fr_DZ",
      alternateLocale: isArabic ? ["fr_DZ", "en_US"] : ["ar_DZ", "en_US"],
      title,
      description,
      url: `${baseUrl}/${locale}`,
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: "Evolve Academy",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/logo.png",
      apple: "/logo.png",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} dir={directionOf(locale)} suppressHydrationWarning>
      <body
        className="relative min-h-dvh antialiased bg-[#0b0b0b] text-gray-200 selection:bg-white selection:text-black"
        suppressHydrationWarning
      >
        <NextIntlClientProvider>
          <ZoomGridBackground />
          <div className="relative z-10">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
