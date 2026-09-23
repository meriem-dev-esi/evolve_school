import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import FormationsBrowser from "./FormationsBrowser";

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    completed?: string;
    formation?: string;
  }>;
};

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

export default async function FormationsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("formations");
  const tNav = await getTranslations("nav");

  const { completed: completedParam, formation: completedFormationParam } =
    await searchParams;

  const supabase = await createClient();

  // =====================================================
  // =====================================================
  // 1. AUTHENTICATED USER & FORMATIONS (PARALLEL STAGE 1)
  // =====================================================

  const [
    {
      data: { user },
    },
    { data: formations, error: formationsError },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("course_series")
      .select("id, title, description, image_url, level, domain, is_published")
      .eq("is_published", true)
      .order("created_at", {
        ascending: false,
      }),
  ]);

  if (formationsError) {
    console.error("[Evolve] Formations error:", formationsError);
  }

  // =====================================================
  // 2. USER PROGRESS & FORMATION RELATIONSHIPS (PARALLEL STAGE 2)
  // =====================================================

  const formationIds = (formations ?? []).map((formation) => formation.id);

  const [
    { data: progressRows },
    { data: seriesCourses, error: seriesCoursesError },
  ] = await Promise.all([
    user
      ? supabase
          .from("lesson_progress")
          .select("lesson_id, completed, progress_percentage")
          .eq("user_id", user.id)
      : Promise.resolve({ data: [] }),

    formationIds.length > 0
      ? supabase
          .from("series_courses")
          .select("series_id, course_id, order_index")
          .in("series_id", formationIds)
          .order("order_index", {
            ascending: true,
          })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (seriesCoursesError) {
    console.error("[Evolve] Series courses error:", seriesCoursesError);
  }

  // =====================================================
  // 3. GET COURSES & LESSONS (PARALLEL STAGE 3)
  // =====================================================

  const courseIds = [
    ...new Set((seriesCourses ?? []).map((item) => item.course_id)),
  ];

  const [{ data: courses, error: coursesError }, { data: lessons }] =
    await Promise.all([
      courseIds.length > 0
        ? supabase
            .from("courses")
            .select(
              "id, title, description, image_url, level, domain, duration",
            )
            .in("id", courseIds)
            .eq("is_published", true)
        : Promise.resolve({ data: [], error: null }),

      courseIds.length > 0
        ? supabase
            .from("lessons")
            .select("id, course_id, order_index")
            .in("course_id", courseIds)
            .order("order_index", {
              ascending: true,
            })
        : Promise.resolve({ data: [] }),
    ]);

  if (coursesError) {
    console.error("[Evolve] Courses error:", coursesError);
  }

  // =====================================================
  // 5. CREATE COURSE MAP WITH PROGRESS
  // =====================================================

  const courseMap = new Map<string, Course>();

  for (const course of courses ?? []) {
    const courseLessons = (lessons ?? [])
      .filter((lesson) => lesson.course_id === course.id)
      .sort((a, b) => a.order_index - b.order_index);

    const completedLessons = courseLessons.filter((lesson) =>
      (progressRows ?? []).some(
        (progress) =>
          progress.lesson_id === lesson.id && progress.completed === true,
      ),
    ).length;

    const progress =
      courseLessons.length > 0
        ? Math.round((completedLessons / courseLessons.length) * 100)
        : 0;

    const completed =
      courseLessons.length > 0 && completedLessons === courseLessons.length;

    const nextLesson =
      courseLessons.find(
        (lesson) =>
          !(progressRows ?? []).some(
            (progress) =>
              progress.lesson_id === lesson.id && progress.completed === true,
          ),
      ) ??
      courseLessons[0] ??
      null;

    courseMap.set(course.id, {
      ...course,
      progress,
      completed,
      nextLessonId: nextLesson?.id ?? null,
    });
  }

  // =====================================================
  // 6. BUILD FORMATION DATA
  // =====================================================

  const formationData: Formation[] = (formations ?? []).map((formation) => {
    const formationCourses = (seriesCourses ?? [])
      .filter((item) => item.series_id === formation.id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((item) => courseMap.get(item.course_id))
      .filter((course): course is Course => Boolean(course));

    return {
      id: formation.id,
      title: formation.title,
      description: formation.description,
      image_url: formation.image_url,
      level: formation.level,
      domain: formation.domain,
      courses: formationCourses,
    };
  });

  // =====================================================
  // 7. COMPLETED FORMATIONS
  // =====================================================

  const completedFormationIds = formationData
    .filter(
      (formation) =>
        formation.courses.length > 0 &&
        formation.courses.every((course) => course.completed),
    )
    .map((formation) => formation.id);

  // =====================================================
  // 8. GLOBAL PROGRESS
  // =====================================================

  const totalFormationCourses = formationData.reduce(
    (total, formation) => total + formation.courses.length,
    0,
  );

  const completedFormationCourses = formationData.reduce(
    (total, formation) =>
      total + formation.courses.filter((course) => course.completed).length,
    0,
  );

  const globalProgress =
    totalFormationCourses > 0
      ? Math.round((completedFormationCourses / totalFormationCourses) * 100)
      : 0;

  // =====================================================
  // 9. COMPLETION MESSAGE
  // =====================================================

  const formationWasCompleted =
    completedParam === "1" &&
    completedFormationParam &&
    completedFormationIds.includes(completedFormationParam);

  const completedFormation = completedFormationParam
    ? formationData.find(
        (formation) => formation.id === completedFormationParam,
      )
    : null;

  // =====================================================
  // 10. RENDER
  // =====================================================

  return (
    <div className="min-h-dvh bg-canvas text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* ================================================= */}
        {/* HERO HEADER */}
        {/* ================================================= */}
        <section className="relative overflow-hidden border-b border-white/10 px-6 py-16 lg:px-10">
          {/* Ambient Top Glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-brand/10 blur-[120px]" />
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
                <Sparkles className="h-3.5 w-3.5" />
                {t("badge")}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              {t("title")}{" "}
              <span className="text-gradient-brand">{t("titleGradient")}</span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              {t("subtitle")}
            </p>

            {/* User Learning Progress Card */}
            {user && totalFormationCourses > 0 && (
              <div className="glass-panel mt-8 max-w-xl rounded-2xl p-5 shadow-xl">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/70 font-medium">
                    {t("globalProgress")}
                  </span>
                  <span className="font-extrabold text-brand">
                    {globalProgress}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-emerald-400 shadow-[0_0_10px_rgba(95,236,107,0.5)] transition-all duration-700"
                    style={{ width: `${globalProgress}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-white/40">
                  {t("completedCoursesCount", {
                    completed: completedFormationCourses,
                    total: totalFormationCourses,
                  })}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ================================================= */}
        {/* COMPLETION MESSAGE */}
        {/* ================================================= */}
        {formationWasCompleted && (
          <section className="px-6 pt-8 lg:px-10">
            <div className="mx-auto max-w-7xl">
              <div className="rounded-3xl border border-brand/30 bg-brand/10 p-6 backdrop-blur-md shadow-[0_0_30px_rgba(95,236,107,0.15)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-xl font-bold text-black">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {t("completedTitle")}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-white/70">
                      {completedFormation?.title
                        ? `"${completedFormation.title}" — `
                        : ""}
                      {t("completedDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================================================= */}
        {/* BROWSER (SEARCH + FILTERS + CARDS) */}
        {/* ================================================= */}
        <FormationsBrowser
          formations={formationData}
          locale={locale}
          completedFormationIds={completedFormationIds}
        />

        {/* ================================================= */}
        {/* COMMUNITY CTA */}
        {/* ================================================= */}
        <section className="border-t border-white/10 px-6 py-20 lg:px-10 relative overflow-hidden">
          <div className="pointer-events-none absolute -bottom-10 end-10 h-72 w-72 rounded-full bg-brand/5 blur-[90px]" />

          <div className="relative mx-auto max-w-7xl">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              {tNav("community")}
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
              {locale === "ar"
                ? "استكشف مشاريع مجتمعنا التعليمي"
                : locale === "en"
                  ? "Discover projects from our community"
                  : "Découvrez les projets de notre communauté"}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              {locale === "ar"
                ? "استلهم من الأعمال التي ينجزها طلابنا، وشارك في مراجعات المشاريع وقدم إبداعاتك الخاصة."
                : locale === "en"
                  ? "Get inspired by work done by our students, participate in project reviews, and showcase your own achievements."
                  : "Inspirez-vous des travaux réalisés par nos étudiants, participez aux revues de code et présentez vos propres réalisations."}
            </p>

            <Link
              href="/community"
              className="group mt-7 inline-flex items-center gap-2.5 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(95,236,107,0.5)]"
            >
              <span>{tNav("community")}</span>
              <ArrowRight className="h-4 w-4 transition-transform rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
