
"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type YouTubePlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
};

type YouTubeAPI = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars?: {
        start?: number;
      };
      events: {
        onReady: (event: { target: YouTubePlayer }) => void;
      };
    },
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function getYouTubeId(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }

    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

export default function LessonVideo({
  lessonId,
  youtubeUrl,
  courseId,
  nextCourseId,
  isLastCourse,
  formationId,
  locale,
}: {
  lessonId: string;
  youtubeUrl: string;
  courseId: string;
  nextCourseId?: string | null;
  isLastCourse?: boolean;
  formationId?: string | null;
  locale: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const redirectedRef = useRef(false);

  useEffect(() => {
    const videoId = getYouTubeId(youtubeUrl);

    if (!videoId || !containerRef.current) {
      return;
    }

    let interval: number | null = null;
    let cancelled = false;

    const supabase = createClient();

    const startPlayer = async () => {
      if (!window.YT || !containerRef.current || cancelled) {
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let lastPosition = 0;

      if (user) {
        const { data: progress } = await supabase
          .from("lesson_progress")
          .select("last_position")
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId)
          .maybeSingle();

        lastPosition = progress?.last_position ?? 0;
      }

      new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          start: lastPosition,
        },
        events: {
          onReady: (event) => {
            playerRef.current = event.target;

            if (lastPosition > 0) {
              event.target.seekTo(lastPosition, true);
            }

            interval = window.setInterval(async () => {
              if (!playerRef.current || !user || cancelled) {
                return;
              }

              const currentTime =
                playerRef.current.getCurrentTime();

              const duration =
                playerRef.current.getDuration();

              if (!duration) {
                return;
              }

              const percentage = Math.min(
                100,
                Math.round(
                  (currentTime / duration) * 100,
                ),
              );

              const completed = percentage >= 90;

              const { error } = await supabase
                .from("lesson_progress")
                .upsert(
                  {
                    user_id: user.id,
                    lesson_id: lessonId,
                    progress_percentage: completed
                      ? 100
                      : percentage,
                    completed,
                    last_position: Math.floor(currentTime),
                    updated_at:
                      new Date().toISOString(),
                  },
                  {
                    onConflict:
                      "user_id,lesson_id",
                  },
                );

              if (error) {
                console.error(
                  "[Evolve] Progress save error:",
                  error,
                );
                return;
              }

              console.log(
                "[Evolve] Progress saved:",
                percentage + "%",
                "Position:",
                Math.floor(currentTime),
              );

              /*
               * Lesson completed.
               * Check whether the whole course is completed.
               */
              if (
                completed &&
                !redirectedRef.current
              ) {
                const { data: courseLessons } =
                  await supabase
                    .from("lessons")
                    .select("id")
                    .eq("course_id", courseId);

                if (
                  courseLessons &&
                  courseLessons.length > 0
                ) {
                  const lessonIds =
                    courseLessons.map(
                      (lesson) => lesson.id,
                    );

                  const {
                    data: completedLessons,
                  } = await supabase
                    .from("lesson_progress")
                    .select("lesson_id")
                    .eq(
                      "user_id",
                      user.id,
                    )
                    .eq("completed", true)
                    .in(
                      "lesson_id",
                      lessonIds,
                    );

                  const allCompleted =
                    completedLessons?.length ===
                    courseLessons.length;

                  if (!allCompleted) {
                    return;
                  }

                  redirectedRef.current = true;

                  console.log(
                    "[Evolve] Course completed:",
                    courseId,
                  );

                  /*
                   * =====================================
                   * LAST COURSE → FORMATION COMPLETED
                   * =====================================
                   */
                  if (isLastCourse) {
                    console.log(
                      "[Evolve] Formation completed:",
                      formationId,
                    );

                    const completionUrl =
                      formationId
                        ? `/${locale}/formations?completed=1&formation=${formationId}`
                        : `/${locale}/formations?completed=1`;

                    window.location.href =
                      completionUrl;

                    return;
                  }

                  /*
                   * =====================================
                   * NEXT COURSE
                   * =====================================
                   */
                  if (nextCourseId) {
                    console.log(
                      "[Evolve] Moving to next course:",
                      nextCourseId,
                    );

                    const {
                      data: nextLessons,
                    } = await supabase
                      .from("lessons")
                      .select(
                        "id, order_index",
                      )
                      .eq(
                        "course_id",
                        nextCourseId,
                      )
                      .order(
                        "order_index",
                        {
                          ascending: true,
                        },
                      );

                    const firstNextLesson =
                      nextLessons?.[0];

                    if (firstNextLesson) {
                      window.location.href =
                        `/${locale}/courses/${nextCourseId}/lessons/${firstNextLesson.id}`;

                      return;
                    }

                    /*
                     * Next course has no lessons.
                     */
                    window.location.href =
                      `/${locale}/courses/${nextCourseId}`;

                    return;
                  }

                  /*
                   * No next course found.
                   */
                  window.location.href =
                    `/${locale}/formations`;

                  return;
                }
              }
            }, 10000);
          },
        },
      });
    };

    if (!window.YT) {
      window.onYouTubeIframeAPIReady = () => {
        void startPlayer();
      };

      const script =
        document.createElement("script");

      script.src =
        "https://www.youtube.com/iframe_api";

      script.async = true;

      document.body.appendChild(script);
    } else {
      void startPlayer();
    }

    return () => {
      cancelled = true;

      if (interval !== null) {
        window.clearInterval(interval);
      }

      playerRef.current = null;
    };
  }, [
    lessonId,
    youtubeUrl,
    courseId,
    nextCourseId,
    isLastCourse,
    formationId,
    locale,
  ]);

  return (
    <div
      ref={containerRef}
      className="mt-10 aspect-video overflow-hidden rounded-3xl bg-black"
    />
  );
}

