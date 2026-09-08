import { getTranslations, setRequestLocale } from "next-intl/server";
import { getDisciplines } from "@/lib/data/categories";

/**
 * ─── THE TRACER ────────────────────────────────────────────────────────────
 *
 * The one page in this repository that is finished, and the pattern every other
 * data-backed page copies. It goes all the way through:
 *
 *   route  →  lib/data query  →  Supabase client as the caller  →  RLS in
 *   Postgres  →  rendered markup  →  three languages  →  right-to-left
 *
 * Nothing here is mocked. The rows come from the same database the Flutter
 * dashboard writes to, which means adding a category in the dashboard changes
 * this page. That round trip is the thing worth proving before four people
 * start building on top of it.
 *
 * Read this file, `lib/data/categories.ts` and the `categories_select_all`
 * policy in `evolve_academy_dashboard/supabase/migrations/0002_cms_schema.sql`
 * together. They are one mechanism written in three places.
 *
 * Note what is absent: no `useState`, no `useEffect`, no loading spinner, no
 * fetch in the browser. This is a Server Component. The data is already there
 * when the HTML is sent.
 * ───────────────────────────────────────────────────────────────────────────
 */

/**
 * Rendered per request, not at build time. This was `export const revalidate =
 * 3600` first, and the reason it changed is worth knowing before you copy this
 * file.
 *
 * With static generation, `next build` runs this query. CI has no database
 * credentials, so the query failed — and the build still reported success, and
 * still printed "(SSG) prerendered as static HTML" next to this route. Nothing
 * had been prerendered. The route was simply missing from the prerender
 * manifest, and the failure surfaced nowhere.
 *
 * A green build that silently produced no page is worse than a red one. So the
 * database is not on the build's critical path at all: the build compiles code,
 * CI's green means the code compiles, and the data is read when somebody asks
 * for the page.
 *
 * If this page ever gets enough traffic for the round trip to matter, the fix
 * is a cache around the query in `lib/data/`, not a return to build-time
 * rendering — that keeps the build independent of the database either way.
 */
export const dynamic = "force-dynamic";

export default async function DisciplinesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("disciplines");
  const disciplines = await getDisciplines();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-ink-muted">{t("intro")}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {t("countLabel", { count: disciplines.length })}
        </p>
      </header>

      {disciplines.length === 0 ? (
        // Reached when the table is genuinely empty. A failed query throws in
        // `getDisciplines` and lands on the error boundary instead, so this
        // message never has to stand in for a broken connection.
        <p className="text-ink-muted">{t("empty")}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {disciplines.map((discipline) => (
            <li
              key={discipline.id}
              className="rounded-card border border-border bg-surface-raised p-5"
            >
              <h2 className="font-medium">{discipline.title}</h2>
              {discipline.description && (
                <p className="mt-2 text-sm text-ink-muted">
                  {discipline.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
