import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Resolves the locale for a request and loads its messages.
 *
 * An unknown locale falls back to the default rather than throwing. A URL like
 * `/de/disciplines` is a visitor guessing, not an attack, and a 500 is a worse
 * answer than the French page.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
