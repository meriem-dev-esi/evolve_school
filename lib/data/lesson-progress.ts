import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function saveLessonProgress(
  lessonId: string,
  progressPercentage: number,
  completed: boolean,
  lastPosition: number,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      progress_percentage: completed ? 100 : progressPercentage,
      completed,
      last_position: Math.floor(lastPosition),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,lesson_id",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}
