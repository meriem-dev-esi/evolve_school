import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Play,
  MessageSquare,
  Clock,
  Sparkles,
} from "lucide-react";

type Props = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("title, description, image_url, price, level, domain")
    .eq("id", id)
    .maybeSingle();

  if (!course) {
    return { title: "Formation — Evolve Academy" };
  }

  return {
    title: `${course.title} — Evolve Academy`,
    description: course.description || `Suivez le cours ${course.title} sur Evolve Academy.`,
    openGraph: {
      title: `${course.title} | Evolve Academy`,
      description: course.description || `Formation ${course.domain || "créative"} de niveau ${course.level || "tous niveaux"}.`,
      images: course.image_url ? [{ url: course.image_url }] : [],
    },
  };
}

export default async function CoursePage({ params }: Props) {
  const { locale, id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/courses/${id}/checkout`);
  }

  // --------------------------------------------------
  // Check whether this course belongs to a formation
  // --------------------------------------------------

  const { data: seriesCourse } = await supabase
    .from("series_courses")
    .select("series_id, order_index")
    .eq("course_id", id)
    .maybeSingle();

  // --------------------------------------------------
  // Formation locking
  // --------------------------------------------------

  if (seriesCourse && seriesCourse.order_index > 1) {
    const { data: previousCourse } = await supabase
      .from("series_courses")
      .select("course_id")
      .eq("series_id", seriesCourse.series_id)
      .eq(
        "order_index",
        seriesCourse.order_index - 1,
      )
      .maybeSingle();

    if (previousCourse) {
      const { data: previousLessons } =
        await supabase
          .from("lessons")
          .select("id")
          .eq(
            "course_id",
            previousCourse.course_id,
          );

      if (
        previousLessons &&
        previousLessons.length > 0
      ) {
        const previousLessonIds =
          previousLessons.map(
            (lesson) => lesson.id,
          );

        const { data: completedLessons } =
          await supabase
            .from("lesson_progress")
            .select("lesson_id")
            .eq("user_id", user.id)
            .eq("completed", true)
            .in(
              "lesson_id",
              previousLessonIds,
            );

        const previousCompleted =
          completedLessons?.length ===
          previousLessons.length;

        if (!previousCompleted) {
          redirect(`/${locale}/formations`);
        }
      }
    }
  }

  // --------------------------------------------------
  // Get course
  // --------------------------------------------------

  const { data: course, error: courseError } =
    await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (courseError || !course) {
    notFound();
  }

  // --------------------------------------------------
  // Get lessons
  // --------------------------------------------------

  const { data: lessons, error: lessonsError } =
    await supabase
      .from("lessons")
      .select(
        `
          id,
          title,
          description,
          duration,
          order_index,
          is_free
        `,
      )
      .eq("course_id", id)
      .order("order_index", {
        ascending: true,
      });

  if (lessonsError) {
    throw new Error(lessonsError.message);
  }

  const lessonList = lessons ?? [];

  // --------------------------------------------------
  // Get user's progress
  // --------------------------------------------------

  const lessonIds = lessonList.map(
    (lesson) => lesson.id,
  );

  const { data: progress } =
    lessonIds.length > 0
      ? await supabase
          .from("lesson_progress")
          .select(
            `
              lesson_id,
              progress_percentage,
              completed,
              last_position
            `,
          )
          .eq("user_id", user.id)
          .in("lesson_id", lessonIds)
      : { data: [] };

  const progressList = progress ?? [];

  const completedLessons =
    progressList.filter(
      (item) => item.completed,
    ).length;

  const totalLessons = lessonList.length;

  const courseProgress =
    totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) * 100,
        )
      : 0;

  // --------------------------------------------------
  // Check enrollment
  // --------------------------------------------------

  const { data: enrollment } =
    await supabase
      .from("enrollments")
      .select("id, payment_status")
      .eq("user_id", user.id)
      .eq("course_id", id)
      .maybeSingle();

  const isPaid =
    enrollment?.payment_status === "paid";

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="min-h-dvh bg-canvas text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 pt-28 pb-16">
        <div className="mx-auto max-w-5xl">
          {/* Back Navigation */}
          <Link
            href={`/${locale}/formations`}
            className="group mb-8 inline-flex items-center gap-2 text-xs font-semibold text-white/60 transition hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Retour aux formations</span>
          </Link>

          {/* Course Hero Header Card */}
          <section className="mb-12">
            <div className="glass-card relative overflow-hidden rounded-3xl border border-white/10 p-8 md:p-10 shadow-2xl">
              {/* Ambient radial glow */}
              <div className="pointer-events-none absolute -top-12 -right-12 h-64 w-64 rounded-full bg-brand/10 blur-[80px]" />

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-bold text-brand uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  Formation Certifiante
                </span>
                {course.level && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                    {course.level}
                  </span>
                )}
                {course.domain && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                    {course.domain}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                {course.title}
              </h1>

              {course.description && (
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/60 sm:text-base">
                  {course.description}
                </p>
              )}

              {/* Meta stats & Mentor Contact */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                <div className="flex flex-wrap items-center gap-5 text-xs text-white/60">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-brand" />
                    <span className="text-white font-bold">{totalLessons}</span> leçons
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-white font-bold">{completedLessons}/{totalLessons}</span> complétées
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-sky-400" />
                    <span className="text-brand font-extrabold">{courseProgress}%</span> complété
                  </span>
                </div>

                <Link
                  href={`/${locale}/messages?recipient=teacher&course=${encodeURIComponent(course.title)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-4 py-2 text-xs font-bold text-brand transition-all hover:bg-brand hover:text-black hover:shadow-[0_0_15px_rgba(95,236,107,0.4)]"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Contacter le formateur</span>
                </Link>
              </div>

              {/* Course Global Progress Bar */}
              <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-white/60 font-medium">Progression du cours</span>
                  <span className="font-extrabold text-brand">{courseProgress}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-emerald-400 shadow-[0_0_10px_rgba(95,236,107,0.5)] transition-all duration-700"
                    style={{ width: `${courseProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Lessons List Section */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                  Programme des Leçons
                </h2>
                <p className="mt-1 text-xs text-white/40">
                  Accédez aux cours vidéo, exercices pratiques et quiz
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/60">
                {totalLessons} modules
              </span>
            </div>

            <div className="space-y-3.5">
              {lessonList.map((lesson, index) => {
                const lessonProgress = progressList.find(
                  (item) => item.lesson_id === lesson.id,
                );

                const completed = lessonProgress?.completed ?? false;
                const percentage = lessonProgress?.progress_percentage ?? 0;
                const accessible = lesson.is_free || isPaid;

                return (
                  <div
                    key={lesson.id}
                    className={`glass-card rounded-2xl border border-white/10 p-5 transition-all duration-300 hover:border-brand/30 ${
                      !accessible ? "opacity-75" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        {/* Number or Checkmark */}
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold ${
                            completed
                              ? "bg-brand/20 text-brand border border-brand/30"
                              : accessible
                                ? "bg-white/10 text-white border border-white/15"
                                : "bg-white/5 text-white/30 border border-white/5"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : accessible ? (
                            index + 1
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </div>

                        {/* Title & Metadata */}
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white tracking-tight">
                            {lesson.title}
                          </h3>

                          {lesson.description && (
                            <p className="mt-0.5 line-clamp-1 text-xs text-white/50">
                              {lesson.description}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-white/50">
                            <span>
                              {lesson.is_free ? (
                                <span className="text-brand font-semibold">Gratuit</span>
                              ) : (
                                "Formation Complète"
                              )}
                            </span>

                            {lesson.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-sky-400" />
                                {lesson.duration} min
                              </span>
                            )}

                            {percentage > 0 && !completed && (
                              <span className="text-brand font-semibold">
                                {percentage}% visionné
                              </span>
                            )}

                            {completed && (
                              <span className="text-brand font-bold">
                                Complété ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action CTA */}
                      <div>
                        {accessible ? (
                          <Link
                            href={`/${locale}/courses/${id}/lessons/${lesson.id}`}
                            className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold transition-all ${
                              completed
                                ? "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                                : "bg-brand text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(95,236,107,0.4)]"
                            }`}
                          >
                            <span>{completed ? "Revoir" : percentage > 0 ? "Reprendre" : "Commencer"}</span>
                            <Play className="h-3 w-3 fill-current ml-0.5" />
                          </Link>
                        ) : (
                          <Link
                            href={`/${locale}/courses/${id}/checkout`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-xs font-bold text-brand transition-all hover:bg-brand hover:text-black"
                          >
                            <Lock className="h-3 w-3" />
                            <span>Débloquer</span>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Mini Lesson Progress Bar */}
                    {percentage > 0 && !completed && (
                      <div className="mt-3.5 pt-3 border-t border-white/5">
                        <div className="h-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}