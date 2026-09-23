"use client";

import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Layers3,
  Lock,
  Search,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";

type Course = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  duration: string | null;
  level: string | null;
  domain: string | null;
  progress: number;
  completed: boolean;
  nextLessonId: string | null;
};

type Formation = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  level: string | null;
  domain: string | null;
  courses: Course[];
};

type Props = {
  formations: Formation[];
  locale: string;
  completedFormationIds: string[];
};

const categories = [
  "Business & Product",
  "Cloud & DevOps",
  "Data & AI",
  "Digital Marketing",
  "Mobile Development",
  "Web Development",
  "Career Skills",
  "Cybersecurity",
  "Design",
];

export default function FormationsBrowser({
  formations,
  locale,
  completedFormationIds,
}: Props) {
  const t = useTranslations("formations");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Formations");

  const filteredFormations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return formations.filter((formation) => {
      const matchesCategory =
        category === "All Formations" || formation.domain === category;

      if (!matchesCategory) return false;

      if (!query) return true;

      const formationMatches =
        formation.title.toLowerCase().includes(query) ||
        (formation.description ?? "").toLowerCase().includes(query) ||
        (formation.domain ?? "").toLowerCase().includes(query) ||
        (formation.level ?? "").toLowerCase().includes(query);

      const courseMatches = formation.courses.some(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          (course.description ?? "").toLowerCase().includes(query) ||
          (course.domain ?? "").toLowerCase().includes(query) ||
          (course.level ?? "").toLowerCase().includes(query),
      );

      return formationMatches || courseMatches;
    });
  }, [formations, search, category]);

  function resetFilters() {
    setSearch("");
    setCategory("All Formations");
  }

  return (
    <>
      {/* SEARCH BAR */}
      <div className="mx-auto mt-10 max-w-2xl px-6 lg:px-10">
        <div className="relative glass-panel rounded-2xl p-1 shadow-lg transition-all focus-within:border-brand/40 focus-within:shadow-[0_0_25px_rgba(95,236,107,0.15)]">
          <Search
            size={18}
            className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-white/40"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-12 w-full rounded-xl bg-transparent ps-11 pe-11 text-sm text-white outline-none placeholder:text-white/30"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute end-3.5 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
              aria-label={t("clearSearch")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {search.trim() && (
          <p className="mt-3 text-xs text-white/40">
            {t("resultsFor")}{" "}
            <span className="font-semibold text-brand">"{search}"</span>
          </p>
        )}
      </div>

      {/* CONTENT */}
      <section className="mx-auto flex max-w-7xl gap-8 px-6 py-12 lg:px-10">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28 glass-panel rounded-3xl p-5 shadow-xl border border-white/10">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/40 px-2">
              {t("specialties")}
            </h2>

            <nav className="space-y-1">
              {["All Formations", ...categories].map((item) => {
                const active = category === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-start text-xs font-medium transition-all ${
                      active
                        ? "bg-brand/15 text-brand font-bold border border-brand/20 shadow-[0_0_12px_rgba(95,236,107,0.15)]"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>
                      {item === "All Formations" ? t("allFormations") : item}
                    </span>
                    {active && (
                      <ChevronRight
                        size={14}
                        className="text-brand rtl:rotate-180"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* MAIN LIST */}
        <div className="min-w-0 flex-1">
          {/* MOBILE CATEGORIES */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {["All Formations", ...categories].map((item) => {
              const active = category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                    active
                      ? "border-brand/40 bg-brand/15 text-brand font-bold"
                      : "border-white/10 bg-white/5 text-white/60"
                  }`}
                >
                  {item === "All Formations" ? t("allFormations") : item}
                </button>
              );
            })}
          </div>

          {/* HEADER */}
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                {category === "All Formations"
                  ? "Parcours Disponibles"
                  : category}
              </h2>

              <p className="mt-1 text-xs text-white/50">
                {filteredFormations.length}{" "}
                {filteredFormations.length === 1
                  ? "parcours certifiant"
                  : "parcours certifiants"}
              </p>
            </div>

            {(search.trim() || category !== "All Formations") && (
              <button
                type="button"
                onClick={resetFilters}
                className="shrink-0 text-xs font-semibold text-brand transition hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {/* NO RESULTS */}
          {filteredFormations.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-20 text-center backdrop-blur-md">
              <Search size={36} className="mx-auto text-white/20" />

              <h3 className="mt-4 text-lg font-bold text-white">
                Aucune formation trouvée
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/40">
                Nous n'avons trouvé aucun parcours correspondant à vos critères.
                Essayez un autre mot-clé ou catégorie.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-black transition hover:scale-105"
              >
                Voir toutes les formations
              </button>
            </div>
          ) : (
            /* FORMATIONS CARDS */
            <div className="space-y-8">
              {filteredFormations.map((formation) => {
                const formationProgress =
                  formation.courses.length > 0
                    ? Math.round(
                        formation.courses.reduce(
                          (total, course) => total + course.progress,
                          0,
                        ) / formation.courses.length,
                      )
                    : 0;

                const formationCompleted =
                  formation.courses.length > 0 &&
                  formation.courses.every((course) => course.completed);

                const isFormationCompleted =
                  completedFormationIds.includes(formation.id) ||
                  formationCompleted;

                const nextCourse =
                  formation.courses.find((course) => !course.completed) ?? null;

                return (
                  <article
                    key={formation.id}
                    className="glass-card overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-brand/30"
                  >
                    {/* FORMATION HEADER */}
                    <div className="grid md:grid-cols-[280px_1fr]">
                      {/* IMAGE */}
                      <div className="relative min-h-[220px] overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950">
                        {formation.image_url ? (
                          <img
                            src={formation.image_url}
                            alt={formation.title}
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full min-h-[220px] items-center justify-center">
                            <Layers3 size={54} className="text-brand/20" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 start-3 flex flex-wrap gap-1.5">
                          {formation.domain && (
                            <span className="rounded-full border border-white/15 bg-black/70 px-2.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-md">
                              {formation.domain}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* INFO */}
                      <div className="p-7 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            {formation.level && (
                              <span className="flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/80">
                                <Award size={12} className="text-brand" />
                                {formation.level}
                              </span>
                            )}

                            {isFormationCompleted && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 border border-brand/30 px-2.5 py-0.5 text-[10px] font-bold text-brand">
                                <CheckCircle2 size={12} />
                                {locale === "ar"
                                  ? "مكتمل 🎓"
                                  : locale === "en"
                                    ? "Completed 🎓"
                                    : "Complétée 🎓"}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 text-2xl font-extrabold text-white tracking-tight">
                            {formation.title}
                          </h3>

                          {formation.description && (
                            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/60">
                              {formation.description}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/50">
                            <span className="flex items-center gap-1.5">
                              <BookOpen size={14} className="text-brand" />
                              {formation.courses.length}{" "}
                              {locale === "ar"
                                ? "دورات"
                                : locale === "en"
                                  ? "courses"
                                  : "cours"}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <Clock3 size={14} className="text-sky-400" />
                              {locale === "ar"
                                ? "مسار كامل"
                                : locale === "en"
                                  ? "Full track"
                                  : "Parcours complet"}
                            </span>
                          </div>
                        </div>

                        {/* FORMATION PROGRESS & ACTION */}
                        <div className="mt-6 border-t border-white/10 pt-5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/60 font-medium">
                              {locale === "ar"
                                ? "تقدم المسار"
                                : locale === "en"
                                  ? "Track progress"
                                  : "Progression du parcours"}
                            </span>
                            <span className="font-extrabold text-brand">
                              {formationProgress}%
                            </span>
                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-brand to-emerald-400 shadow-[0_0_8px_rgba(95,236,107,0.5)] transition-all duration-500"
                              style={{ width: `${formationProgress}%` }}
                            />
                          </div>

                          {/* ACTION BUTTON */}
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-xs text-white/40">
                              {
                                formation.courses.filter((c) => c.completed)
                                  .length
                              }{" "}
                              / {formation.courses.length}{" "}
                              {locale === "ar"
                                ? "وحدات مكتملة"
                                : locale === "en"
                                  ? "completed modules"
                                  : "modules validés"}
                            </span>

                            {nextCourse && !isFormationCompleted && (
                              <Link
                                href={
                                  nextCourse.nextLessonId
                                    ? `/courses/${nextCourse.id}/lessons/${nextCourse.nextLessonId}`
                                    : `/courses/${nextCourse.id}`
                                }
                                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-xs font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(95,236,107,0.5)]"
                              >
                                <span>
                                  {nextCourse.progress > 0
                                    ? locale === "ar"
                                      ? "متابعة"
                                      : locale === "en"
                                        ? "Continue"
                                        : "Continuer"
                                    : locale === "ar"
                                      ? "بدء"
                                      : locale === "en"
                                        ? "Start"
                                        : "Commencer"}
                                </span>
                                <ArrowRight
                                  size={14}
                                  className="rtl:rotate-180"
                                />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LEARNING PLAYLIST */}
                    <div className="border-t border-white/10 bg-black/40">
                      <div className="px-7 py-4 flex items-center justify-between border-b border-white/5">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                            {locale === "ar"
                              ? "برنامج المسار"
                              : locale === "en"
                                ? "Track curriculum"
                                : "Programme du parcours"}
                          </h4>
                          <p className="text-[11px] text-white/40">
                            {locale === "ar"
                              ? "اتبع الدورات بالترتيب الموصى به للحصول على الشهادة"
                              : locale === "en"
                                ? "Follow the courses in recommended order to earn your certification"
                                : "Suivez les cours dans l'ordre recommandé pour valider votre certification"}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-white/50">
                          {formation.courses.length}{" "}
                          {locale === "ar"
                            ? "وحدات"
                            : locale === "en"
                              ? "Modules"
                              : "Modules"}
                        </span>
                      </div>

                      <div className="divide-y divide-white/5">
                        {formation.courses.map((course, index) => {
                          const locked =
                            index > 0 &&
                            !formation.courses[index - 1]?.completed;

                          return (
                            <div
                              key={course.id}
                              className={`flex items-center gap-4 px-7 py-4 transition ${
                                locked ? "opacity-40" : "hover:bg-white/[0.03]"
                              }`}
                            >
                              {/* STATUS BADGE / NUMBER */}
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                  course.completed
                                    ? "bg-brand/20 text-brand border border-brand/30"
                                    : locked
                                      ? "bg-white/5 text-white/30 border border-white/5"
                                      : "bg-white/10 text-white border border-white/15"
                                }`}
                              >
                                {course.completed ? (
                                  <CheckCircle2 size={16} />
                                ) : locked ? (
                                  <Lock size={13} />
                                ) : (
                                  index + 1
                                )}
                              </div>

                              {/* COURSE INFO */}
                              <div className="min-w-0 flex-1">
                                <h5 className="truncate text-sm font-bold text-white">
                                  {course.title}
                                </h5>

                                <p className="mt-0.5 truncate text-xs text-white/40">
                                  {course.description ||
                                    "Module d'apprentissage pratique."}
                                </p>

                                <div className="mt-2 flex items-center gap-3">
                                  <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
                                    <div
                                      className="h-full rounded-full bg-brand transition-all"
                                      style={{ width: `${course.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-white/40">
                                    {course.progress}%
                                  </span>
                                </div>
                              </div>

                              {/* ACTION */}
                              {locked ? (
                                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/30">
                                  <Lock size={12} />
                                  <span>
                                    {locale === "ar"
                                      ? "مغلق"
                                      : locale === "en"
                                        ? "Locked"
                                        : "Verrouillé"}
                                  </span>
                                </span>
                              ) : (
                                <Link
                                  href={
                                    course.nextLessonId
                                      ? `/courses/${course.id}/lessons/${course.nextLessonId}`
                                      : `/courses/${course.id}`
                                  }
                                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                                    course.completed
                                      ? "border border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                                      : "bg-brand text-black hover:scale-105 hover:shadow-[0_0_15px_rgba(95,236,107,0.4)]"
                                  }`}
                                >
                                  {course.completed
                                    ? locale === "ar"
                                      ? "مراجعة ✓"
                                      : locale === "en"
                                        ? "Review ✓"
                                        : "Revoir ✓"
                                    : course.progress > 0
                                      ? locale === "ar"
                                        ? "متابعة ←"
                                        : locale === "en"
                                          ? "Continue →"
                                          : "Continuer →"
                                      : locale === "ar"
                                        ? "بدء ←"
                                        : locale === "en"
                                          ? "Start →"
                                          : "Commencer →"}
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
