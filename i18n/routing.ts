import { defineRouting } from "next-intl/routing";

/**
 * The three languages the academy operates in.
 *
 * French is the default because it is the language of instruction and of most
 * incoming traffic. Arabic is not an afterthought: it is right-to-left, and the
 * whole layout has to survive `dir="rtl"`. Check every UI change in Arabic
 * before opening the pull request — the pull request template asks for it.
 */
export const routing = defineRouting({
  locales: ["fr", "ar", "en"],
  defaultLocale: "fr",
});

export type Locale = (typeof routing.locales)[number];

/** Locales that render right-to-left. Used to set `dir` on `<html>`. */
const RTL_LOCALES = new Set<string>(["ar"]);

export function directionOf(locale: string): "ltr" | "rtl" {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}
