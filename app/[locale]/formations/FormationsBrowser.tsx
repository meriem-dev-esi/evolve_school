
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  BookOpen,
  Clock3,
  Layers3,
  X,
  CheckCircle2,
} from "lucide-react";

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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Formations");

  const filteredFormations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return formations.filter((formation) => {
      const matchesCategory =
        category === "All Formations" ||
        formation.domain === category;

      if (!matchesCategory) return false;

      if (!query) return true;

      const formationMatches =
        formation.title.toLowerCase().includes(query) ||
        (formation.description ?? "")
          .toLowerCase()
          .includes(query) ||
        (formation.domain ?? "")
          .toLowerCase()
          .includes(query) ||
        (formation.level ?? "")
          .toLowerCase()
          .includes(query);

      const courseMatches = formation.courses.some(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          (course.description ?? "")
            .toLowerCase()
            .includes(query) ||
          (course.domain ?? "")
            .toLowerCase()
            .includes(query) ||
          (course.level ?? "")
            .toLowerCase()
            .includes(query),
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
      {/* SEARCH */}
      <div className="mx-auto mt-8 max-w-2xl px-6 lg:px-10">
        <div className="relative">
          <Search
            size={20}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search formations, courses..."
            className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.06] pl-12 pr-12 text-white outline-none transition placeholder:text-white/30 focus:border-purple-500/60 focus:bg-white/[0.08]"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {search.trim() && (
          <p className="mt-3 text-sm text-white/40">
            Search results for{" "}
            <span className="font-medium text-white/70">
              "{search}"
            </span>
          </p>
        )}
      </div>

      {/* CONTENT */}
      <section className="mx-auto flex max-w-7xl gap-8 px-6 py-10 lg:px-10">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-8">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white/40">
              Categories
            </h2>

            <nav className="space-y-1">
              {["All Formations", ...categories].map((item) => {
                const active = category === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                      active
                        ? "bg-white/10 font-medium text-white"
                        : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span>{item}</span>

                    {active && <ChevronRight size={16} />}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* MAIN */}
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
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                    active
                      ? "border-purple-500/50 bg-purple-500/20 text-white"
                      : "border-white/10 bg-white/[0.05] text-white/60"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* HEADER */}
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                {category === "All Formations"
                  ? "Learning Paths"
                  : category}
              </h2>

              <p className="mt-2 text-sm text-white/40">
                {filteredFormations.length}{" "}
                {filteredFormations.length === 1
                  ? "formation"
                  : "formations"}{" "}
                available
              </p>
            </div>

            {(search.trim() ||
              category !== "All Formations") && (
              <button
                type="button"
                onClick={resetFilters}
                className="shrink-0 text-sm text-white/40 transition hover:text-white"
              >
                Reset
              </button>
            )}
          </div>

          {/* NO RESULTS */}
          {filteredFormations.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
              <Search
                size={40}
                className="mx-auto text-white/20"
              />

              <h3 className="mt-5 text-xl font-semibold">
                No formations found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
                We couldn't find a formation matching your
                search. Try another keyword or category.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/80"
              >
                Reset filters
              </button>
            </div>
          ) : (
            /* FORMATIONS */
            <div className="space-y-8">
              {filteredFormations.map((formation) => {
                const formationProgress =
                  formation.courses.length > 0
                    ? Math.round(
                        formation.courses.reduce(
                          (total, course) =>
                            total + course.progress,
                          0,
                        ) / formation.courses.length,
                      )
                    : 0;

                const formationCompleted =
                  formation.courses.length > 0 &&
                  formation.courses.every(
                    (course) => course.completed,
                  );

                const isFormationCompleted =
                  completedFormationIds.includes(
                    formation.id,
                  ) || formationCompleted;

                const nextCourse =
                  formation.courses.find(
                    (course) => !course.completed,
                  ) ?? null;

                return (
                  <article
                    key={formation.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]"
                  >
                    {/* FORMATION HEADER */}
                    <div className="grid md:grid-cols-[280px_1fr]">
                      {/* IMAGE */}
                      <div className="relative min-h-[220px] overflow-hidden bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-transparent">
                        {formation.image_url ? (
                          <img
                            src={formation.image_url}
                            alt={formation.title}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-[220px] items-center justify-center">
                            <Layers3
                              size={64}
                              className="text-white/20"
                            />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/30" />
                      </div>

                      {/* INFO */}
                      <div className="p-7">
                        <div className="flex flex-wrap gap-2">
                          {formation.domain && (
                            <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-300">
                              {formation.domain}
                            </span>
                          )}

                          {formation.level && (
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                              {formation.level}
                            </span>
                          )}

                          {isFormationCompleted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-400">
                              <CheckCircle2 size={13} />
                              Completed
                            </span>
                          )}
                        </div>

                        <h3 className="mt-4 text-2xl font-bold">
                          {formation.title}
                        </h3>

                        {formation.description && (
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                            {formation.description}
                          </p>
                        )}

                        <div className="mt-6 flex flex-wrap gap-5 text-sm text-white/40">
                          <span className="flex items-center gap-2">
                            <BookOpen size={16} />
                            {formation.courses.length}{" "}
                            {formation.courses.length === 1
                              ? "course"
                              : "courses"}
                          </span>

                          <span className="flex items-center gap-2">
                            <Clock3 size={16} />
                            Learning path
                          </span>
                        </div>

                        {/* FORMATION PROGRESS */}
                        <div className="mt-7 max-w-xl">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-white/70">
                              Formation progress
                            </span>

                            <span className="text-sm font-semibold text-lime-400">
                              {formationProgress}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-lime-400 transition-all"
                              style={{
                                width: `${formationProgress}%`,
                              }}
                            />
                          </div>

                          {isFormationCompleted && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-lime-400">
                              <CheckCircle2 size={16} />
                              Formation completed
                            </div>
                          )}

                          {/* CONTINUE FORMATION */}
                          {nextCourse &&
                            !isFormationCompleted &&
                            (nextCourse.nextLessonId ? (
                              <Link
                                href={`/${locale}/courses/${nextCourse.id}/lessons/${nextCourse.nextLessonId}`}
                                className="mt-5 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/80"
                              >
                                {nextCourse.progress > 0
                                  ? "Continue Formation →"
                                  : "Start Formation →"}
                              </Link>
                            ) : (
                              <Link
                                href={`/${locale}/courses/${nextCourse.id}`}
                                className="mt-5 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/80"
                              >
                                {nextCourse.progress > 0
                                  ? "Continue Formation →"
                                  : "Start Formation →"}
                              </Link>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* PLAYLIST */}
                    <div className="border-t border-white/10">
                      <div className="px-7 py-5">
                        <h4 className="font-semibold">
                          Learning playlist
                        </h4>

                        <p className="mt-1 text-xs text-white/40">
                          Follow the courses in order
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {formation.courses.map(
                          (course, index) => {
                            const locked =
                              index > 0 &&
                              !formation.courses[
                                index - 1
                              ]?.completed;

                            return (
                              <div
                                key={course.id}
                                className={`flex items-center gap-4 px-7 py-5 transition ${
                                  locked
                                    ? "opacity-40"
                                    : "hover:bg-white/[0.025]"
                                }`}
                              >
                                {/* NUMBER */}
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                                    course.completed
                                      ? "bg-lime-400/20 text-lime-400"
                                      : locked
                                        ? "bg-white/5 text-white/30"
                                        : "bg-white/10 text-white/60"
                                  }`}
                                >
                                  {course.completed ? (
                                    <CheckCircle2 size={18} />
                                  ) : locked ? (
                                    "🔒"
                                  ) : (
                                    index + 1
                                  )}
                                </div>

                                {/* COURSE INFO */}
                                <div className="min-w-0 flex-1">
                                  <h5 className="truncate font-medium">
                                    {course.title}
                                  </h5>

                                  <p className="mt-1 truncate text-xs text-white/40">
                                    {course.description ||
                                      "Continue your learning journey."}
                                  </p>

                                  <div className="mt-3 flex items-center gap-3">
                                    <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
                                      <div
                                        className="h-full rounded-full bg-lime-400 transition-all"
                                        style={{
                                          width: `${course.progress}%`,
                                        }}
                                      />
                                    </div>

                                    <span className="text-xs text-white/40">
                                      {course.progress}%
                                    </span>
                                  </div>
                                </div>

                                {/* ACTION */}
                                {locked ? (
                                  <span className="flex shrink-0 items-center gap-2 rounded-xl bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/30">
                                    🔒 Locked
                                  </span>
                                ) : (
                                  <Link
                                    href={
                                      course.nextLessonId
                                        ? `/${locale}/courses/${course.id}/lessons/${course.nextLessonId}`
                                        : `/${locale}/courses/${course.id}`
                                    }
                                    className={`shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                                      course.completed
                                        ? "border border-white/10 bg-white/[0.06] text-white/60 hover:bg-white/10"
                                        : "bg-white text-black hover:bg-white/80"
                                    }`}
                                  >
                                    {course.completed
                                      ? "Completed ✓"
                                      : course.progress > 0
                                        ? "Continue →"
                                        : "Start →"}
                                  </Link>
                                )}
                              </div>
                            );
                          },
                        )}
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

