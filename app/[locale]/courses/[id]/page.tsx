import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

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
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-6xl">

        <Link
          href={`/${locale}/formations`}
          className="mb-8 inline-flex text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          ← Back to formations
        </Link>

        {/* Course header */}

        <section className="mb-10">
          <div className="rounded-3xl border bg-card p-8 shadow-sm">

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {course.title}
            </h1>

            {course.description && (
              <p className="mt-4 max-w-3xl text-muted-foreground">
                {course.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">

              <span>
                📚 {totalLessons} lessons
              </span>

              <span>
                ✅ {completedLessons}/{totalLessons} completed
              </span>

              <span>
                📊 {courseProgress}% complete
              </span>

            </div>

            {/* Progress */}

            <div className="mt-6">

              <div className="mb-2 flex justify-between text-sm">
                <span>
                  Course progress
                </span>

                <span>
                  {courseProgress}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-muted">

                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${courseProgress}%`,
                  }}
                />

              </div>

            </div>
          </div>
        </section>

        {/* Lessons */}

        <section>

          <h2 className="mb-6 text-2xl font-bold">
            Course lessons
          </h2>

          <div className="space-y-4">

            {lessonList.map(
              (lesson, index) => {

                const lessonProgress =
                  progressList.find(
                    (item) =>
                      item.lesson_id ===
                      lesson.id,
                  );

                const completed =
                  lessonProgress?.completed ??
                  false;

                const percentage =
                  lessonProgress?.progress_percentage ??
                  0;

                const accessible =
                  lesson.is_free || isPaid;

                return (
                  <div
                    key={lesson.id}
                    className="rounded-2xl border bg-card p-5 shadow-sm"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                          {completed
                            ? "✓"
                            : index + 1}
                        </div>

                        <div className="min-w-0">

                          <h3 className="font-semibold">
                            {lesson.title}
                          </h3>

                          {lesson.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {lesson.description}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">

                            <span>
                              {lesson.is_free
                                ? "🆓 Free"
                                : "🔒 Paid course"}
                            </span>

                            {lesson.duration ? (
                              <span>
                                ⏱{" "}
                                {lesson.duration}{" "}
                                min
                              </span>
                            ) : null}

                            {percentage > 0 &&
                            !completed ? (
                              <span>
                                {percentage}%
                                watched
                              </span>
                            ) : null}

                            {completed ? (
                              <span className="font-medium text-green-600">
                                Completed
                              </span>
                            ) : null}

                          </div>
                        </div>
                      </div>

                      {accessible ? (
                        <Link
                          href={`/${locale}/courses/${id}/lessons/${lesson.id}`}
                          className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                        >
                          {completed
                            ? "Review"
                            : "Start"}
                        </Link>
                      ) : (
                        <Link
                          href={`/${locale}/courses/${id}/checkout`}
                          className="shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                        >
                          🔒 Unlock
                        </Link>
                      )}

                    </div>

                    {/* Lesson progress */}

                    {percentage > 0 &&
                    !completed ? (
                      <div className="mt-4">

                        <div className="h-2 overflow-hidden rounded-full bg-muted">

                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>
                    ) : null}

                  </div>
                );
              },
            )}

          </div>
        </section>

      </div>
    </main>
  );
}