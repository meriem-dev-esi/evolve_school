import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { directionOf, routing } from "@/i18n/routing";
import "../globals.css";

/**
 * The locale shell.
 *
 * This file is deliberately thin. The visible chrome — header, navigation,
 * language switcher, footer — belongs to the layout-shell track and lands here
 * as components, not as markup written inline. See docs/week-4-foundations.md.
 */

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // An unknown locale is a 404, not a fallback. `i18n/request.ts` falls back
  // for message loading; the route itself should not pretend `/de` exists.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Without this, every page under this layout opts out of static rendering
  // and is server-rendered per request. It has to be called before any
  // `useTranslations` in the tree below.
  setRequestLocale(locale);

  return (
    <html lang={locale} dir={directionOf(locale)} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
