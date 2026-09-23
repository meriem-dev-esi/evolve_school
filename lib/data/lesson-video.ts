import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getLessonVideoUrl(videoPath: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from("lesson-videos")
    .createSignedUrl(videoPath, 60 * 60);

  if (error) {
    throw new Error(error.message);
  }

  return data.signedUrl;
}
