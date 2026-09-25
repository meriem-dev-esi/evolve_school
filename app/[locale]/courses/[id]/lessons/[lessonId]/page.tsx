import { Link } from "@/i18n/navigation";
import { notFound, redirect } from "next/navigation";
import LessonVideo from "@/components/LessonVideo";
import MarkLessonComplete from "@/components/MarkLessonComplete";
import UploadedLessonVideo from "@/components/UploadedLessonVideo";
import { getLessonVideoUrl } from "@/lib/data/lesson-video";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    locale: string;
    id: string;
    lessonId: string;
  }>;
};

export default async function LessonPage({ params }: Props) {
  const { locale, id, lessonId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔐 Authentication
  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  // =========================================================
  // 🔒 FORMATION LOCKING
  // =========================================================

  const { data: seriesCourse } = await supabase
    .from("series_courses")
    .select("series_id, order_index")
    .eq("course_id", id)
    .maybeSingle();

  if (seriesCourse && seriesCourse.order_index > 1) {
    const { data: previousCourse } = await supabase
      .from("series_courses")
      .select("course_id")
      .eq("series_id", seriesCourse.series_id)
      .eq("order_index", seriesCourse.order_index - 1)
      .maybeSingle();

    if (previousCourse) {
      const { data: previousLessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", previousCourse.course_id);

      const previousLessonIds =
        previousLessons?.map((lesson) => lesson.id) ?? [];

      if (previousLessonIds.length > 0) {
        const { data: completedLessons } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("completed", true)
          .in("lesson_id", previousLessonIds);

        const previousCourseCompleted =
          completedLessons?.length === previousLessonIds.length;

        if (!previousCourseCompleted) {
          redirect(`/${locale}/formations`);
        }
      }
    }
  }

  // =========================================================
  // 📚 GET LESSON
  // =========================================================

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(
      `         id,
        title,
        description,
        youtube_url,
        video_url,
        duration,
        order_index,
        is_free
      `,
    )
    .eq("id", lessonId)
    .eq("course_id", id)
    .maybeSingle();

  if (error || !lesson) {
    notFound();
  }
  let signedVideoUrl: string | null = null;

  if (lesson.video_url) {
    signedVideoUrl = await getLessonVideoUrl(lesson.video_url);
  }

  // =========================================================
  // 💳 CHECK ENROLLMENT
  // =========================================================

  if (!lesson.is_free) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", id)
      .eq("payment_status", "paid")
      .maybeSingle();

    if (!enrollment) {
      redirect(`/${locale}/courses/${id}`);
    }
  }

  // =========================================================
  // ▶️ FIND NEXT COURSE IN FORMATION
  // =========================================================

  const { data: currentSeriesCourse } = await supabase
    .from("series_courses")
    .select("series_id, order_index")
    .eq("course_id", id)
    .maybeSingle();

  let nextCourseId: string | null = null;
  let isLastCourse = false;
  let formationId: string | null = null;

  if (currentSeriesCourse) {
    formationId = currentSeriesCourse.series_id;

    const { data: nextSeriesCourse } = await supabase
      .from("series_courses")
      .select("course_id")
      .eq("series_id", currentSeriesCourse.series_id)
      .gt("order_index", currentSeriesCourse.order_index)
      .order("order_index", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (nextSeriesCourse) {
      const { data: nextCourse } = await supabase
        .from("courses")
        .select("id")
        .eq("id", nextSeriesCourse.course_id)
        .eq("is_published", true)
        .maybeSingle();

      nextCourseId = nextCourse?.id ?? null;
    } else {
      isLastCourse = true;
    }
  }

  console.log("[Evolve] Formation ID:", formationId);

  console.log("[Evolve] Next Course:", nextCourseId);

  console.log("[Evolve] Is Last Course:", isLastCourse);

  // =========================================================
  // 🎬 PAGE
  // =========================================================

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      {" "}
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/courses/${id}`}
          className="mb-8 inline-flex text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          ← Back to course
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-primary">
            Lesson {lesson.order_index}
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {lesson.title}
          </h1>

          {lesson.description && (
            <p className="mt-4 max-w-3xl text-muted-foreground">
              {lesson.description}
            </p>
          )}
        </div>

        {/* ================================================= */}
        {/* 🎥 YOUTUBE VIDEO */}
        {/* ================================================= */}

        {lesson.youtube_url ? (
          <LessonVideo
            lessonId={lesson.id}
            youtubeUrl={lesson.youtube_url}
            courseId={id}
            nextCourseId={nextCourseId}
            isLastCourse={isLastCourse}
            formationId={formationId}
            locale={locale}
          />
        ) : signedVideoUrl ? (
          <UploadedLessonVideo
            lessonId={lesson.id}
            videoUrl={signedVideoUrl}
            courseId={id}
            nextCourseId={nextCourseId}
            isLastCourse={isLastCourse}
            formationId={formationId}
            locale={locale}
          />
        ) : (
          /* ================================================= */
          /* 🚫 NO VIDEO */
          /* ================================================= */

          <div className="mt-10 rounded-3xl border p-10 text-center">
            <p className="text-muted-foreground">
              No video is available for this lesson yet.
            </p>

            <MarkLessonComplete
              lessonId={lesson.id}
              courseId={id}
              nextCourseId={nextCourseId}
              isLastCourse={isLastCourse}
              formationId={formationId}
              locale={locale}
            />
          </div>
        )}
      </div>
    </main>
  );
}
