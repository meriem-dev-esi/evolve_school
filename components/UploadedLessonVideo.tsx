"use client";

import { completeLessonAndNavigate } from "@/lib/data/course-completion";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  lessonId: string;
  videoUrl: string;
  courseId: string;
  nextCourseId?: string | null;
  isLastCourse?: boolean;
  formationId?: string | null;
  locale: string;
};

export default function UploadedLessonVideo({
  lessonId,
  videoUrl,
  courseId,
  nextCourseId,
  isLastCourse,
  formationId,
  locale,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedRef = useRef(0);
  const completingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const supabase = createClient();
    let cancelled = false;

    const loadProgress = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) return;

      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("last_position")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (
        !cancelled &&
        progress?.last_position &&
        progress.last_position > 0
      ) {
        video.currentTime = progress.last_position;
      }
    };

    const saveProgress = async () => {
      if (
        cancelled ||
        !video.duration ||
        !Number.isFinite(video.duration)
      ) {
        return;
      }

      const currentTime = video.currentTime;

      if (
        Math.floor(currentTime) -
          lastSavedRef.current <
        10
      ) {
        return;
      }

      lastSavedRef.current =
        Math.floor(currentTime);

      const percentage = Math.min(
        100,
        Math.round(
          (currentTime / video.duration) * 100,
        ),
      );

      const completed = percentage >= 95;

      try {
        await fetch("/api/lesson-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lessonId,
            progressPercentage: percentage,
            completed,
            lastPosition: currentTime,
          }),
        });
      } catch (error) {
        console.error(
          "[Evolve] Progress save error:",
          error,
        );
      }
    };

    const handleEnded = async () => {
      if (completingRef.current || cancelled) {
        return;
      }

      completingRef.current = true;

      try {
        // 1. Save 100% completion
        const response = await fetch(
          "/api/lesson-progress",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lessonId,
              progressPercentage: 100,
              completed: true,
              lastPosition: Math.floor(
                video.duration || video.currentTime,
              ),
            }),
          },
        );

        if (!response.ok) {
          console.error(
            "[Evolve] Could not save completion",
          );

          completingRef.current = false;
          return;
        }

        // 2. Check course completion
        await completeLessonAndNavigate({
          lessonId,
          courseId,
          nextCourseId,
          isLastCourse,
          formationId,
          locale,
        });
      } catch (error) {
        console.error(
          "[Evolve] Completion error:",
          error,
        );

        completingRef.current = false;
      }
    };

    void loadProgress();

    video.addEventListener(
      "timeupdate",
      saveProgress,
    );

    video.addEventListener(
      "ended",
      handleEnded,
    );

    return () => {
      cancelled = true;

      video.removeEventListener(
        "timeupdate",
        saveProgress,
      );

      video.removeEventListener(
        "ended",
        handleEnded,
      );
    };
  }, [
    lessonId,
    videoUrl,
    courseId,
    nextCourseId,
    isLastCourse,
    formationId,
    locale,
  ]);

  return (
    <div className="mt-10 overflow-hidden rounded-3xl bg-black">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        className="aspect-video w-full"
        src={videoUrl}
      />
    </div>
  );
}