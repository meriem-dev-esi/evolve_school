"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MarkLessonComplete({
lessonId,
courseId,
nextCourseId,
isLastCourse,
formationId,
locale,
}: {
lessonId: string;
courseId: string;
nextCourseId?: string | null;
isLastCourse?: boolean;
formationId?: string | null;
locale: string;
}) {
const [loading, setLoading] = useState(false);
const [completed, setCompleted] = useState(false);

async function handleComplete() {
setLoading(true);


const supabase = createClient();

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  setLoading(false);
  return;
}

// Mark current lesson as completed
const { error } = await supabase
  .from("lesson_progress")
  .upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      progress_percentage: 100,
      completed: true,
      last_position: 0,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,lesson_id",
    },
  );

if (error) {
  console.error(
    "[Evolve] Complete lesson error:",
    error,
  );

  setLoading(false);
  return;
}

setCompleted(true);

// Get all lessons from current course
const {
  data: courseLessons,
  error: lessonsError,
} = await supabase
  .from("lessons")
  .select("id, order_index")
  .eq("course_id", courseId)
  .order("order_index", {
    ascending: true,
  });

if (lessonsError) {
  console.error(
    "[Evolve] Get course lessons error:",
    lessonsError,
  );

  setLoading(false);
  return;
}

// Check whether the whole course is completed
if (courseLessons && courseLessons.length > 0) {
  const lessonIds = courseLessons.map(
    (lesson) => lesson.id,
  );

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

  if (allCompleted) {
    console.log(
      "[Evolve] Course completed:",
      courseId,
    );

    // ==========================================
    // LAST COURSE → FORMATION COMPLETED
    // ==========================================
    if (isLastCourse) {
      console.log(
        "[Evolve] Formation completed:",
        formationId,
      );

      const completionUrl = formationId
        ? `/${locale}/formations?completed=1&formation=${formationId}`
        : `/${locale}/formations?completed=1`;

      window.location.href = completionUrl;

      return;
    }

    // ==========================================
    // NEXT COURSE
    // ==========================================
    if (nextCourseId) {
      console.log(
        "[Evolve] Moving to next course:",
        nextCourseId,
      );

      // Get first lesson of next course
      const {
        data: nextLessons,
        error: nextLessonsError,
      } = await supabase
        .from("lessons")
        .select("id, order_index")
        .eq("course_id", nextCourseId)
        .order("order_index", {
          ascending: true,
        });

      if (nextLessonsError) {
        console.error(
          "[Evolve] Get next course lessons error:",
          nextLessonsError,
        );

        setLoading(false);
        return;
      }

      const firstNextLesson =
        nextLessons?.[0];

      if (firstNextLesson) {
        window.location.href =
          `/${locale}/courses/${nextCourseId}/lessons/${firstNextLesson.id}`;

        return;
      }

      // Next course has no lessons
      window.location.href =
        `/${locale}/courses/${nextCourseId}`;

      return;
    }

    // No next course
    window.location.href =
      `/${locale}/formations`;

    return;
  }
}

setLoading(false);


}

if (completed) {
return ( <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm font-medium text-green-400">
✓ Lesson completed </div>
);
}

return ( <button
   type="button"
   onClick={handleComplete}
   disabled={loading}
   className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
 >
{loading
? "Saving..."
: "Mark lesson as complete ✓"} </button>
);
}
