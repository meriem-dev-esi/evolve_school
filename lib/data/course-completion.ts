import { createClient } from "@/lib/supabase/client";

type CompleteLessonParams = {
  lessonId: string;
  courseId: string;
  nextCourseId?: string | null;
  isLastCourse?: boolean;
  formationId?: string | null;
  locale: string;
};

export async function completeLessonAndNavigate({
  lessonId,
  courseId,
  nextCourseId,
  isLastCourse,
  formationId,
  locale,
}: CompleteLessonParams) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // 1️⃣ Mark current lesson as completed
  const { error: progressError } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        progress_percentage: 100,
        completed: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,lesson_id",
      },
    );

  if (progressError) {
    console.error(
      "[Evolve] Completion error:",
      progressError,
    );

    return;
  }

  // 2️⃣ Get all lessons of current course
  const { data: courseLessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);

  if (!courseLessons || courseLessons.length === 0) {
    return;
  }

  const lessonIds = courseLessons.map(
    (lesson) => lesson.id,
  );

  // 3️⃣ Check completed lessons
  const { data: completedLessons } =
    await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("completed", true)
      .in("lesson_id", lessonIds);

  const allCompleted =
    completedLessons?.length ===
    courseLessons.length;

  if (!allCompleted) {
    return;
  }

  console.log(
    "[Evolve] Course completed:",
    courseId,
  );

  // 4️⃣ Last course → formation completed
  if (isLastCourse) {
    const completionUrl = formationId
      ? `/${locale}/formations?completed=1&formation=${formationId}`
      : `/${locale}/formations?completed=1`;

    window.location.href = completionUrl;

    return;
  }

  // 5️⃣ Move to next course
  if (nextCourseId) {
    const { data: nextLessons } =
      await supabase
        .from("lessons")
        .select("id, order_index")
        .eq("course_id", nextCourseId)
        .order("order_index", {
          ascending: true,
        });

    const firstLesson = nextLessons?.[0];

    if (firstLesson) {
      window.location.href =
        `/${locale}/courses/${nextCourseId}/lessons/${firstLesson.id}`;

      return;
    }

    window.location.href =
      `/${locale}/courses/${nextCourseId}`;

    return;
  }

  // 6️⃣ No next course
  window.location.href =
    `/${locale}/formations`;
}