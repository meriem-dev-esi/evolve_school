import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { lessonId, progressPercentage, completed, lastPosition } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 },
      );
    }

    const percentage = Math.min(
      100,
      Math.max(0, Number(progressPercentage) || 0),
    );

    const position = Math.max(0, Math.floor(Number(lastPosition) || 0));

    const isCompleted = Boolean(completed) || percentage >= 95;

    const { error } = await supabase.from("lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        progress_percentage: isCompleted ? 100 : percentage,
        completed: isCompleted,
        last_position: position,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,lesson_id",
      },
    );

    if (error) {
      console.error("[Evolve] Progress API error:", error);

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      completed: isCompleted,
      progressPercentage: isCompleted ? 100 : percentage,
      lastPosition: position,
    });
  } catch (error) {
    console.error("[Evolve] Progress API error:", error);

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
