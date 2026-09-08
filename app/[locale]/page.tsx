import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Placeholder home page.
 *
 * OWNER: the public-pages track. This exists so the route resolves and the
 * language switcher has somewhere to land — it is not a design. Replacing it is
 * a sprint-1 task, not a week-4 one.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-lg text-ink-muted">{t("tagline")}</p>
      <Link
        href="/disciplines"
        className="w-fit rounded-pill bg-brand px-6 py-3 text-brand-contrast transition-opacity hover:opacity-90"
      >
        {t("browseDisciplines")}
      </Link>
    </main>
  );
}
