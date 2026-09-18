import { setRequestLocale } from "next-intl/server";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HorizontalCourseSection from "@/components/HorizontalCourseSection";
import SeriesCard from "@/components/SeriesCard";

import { createClient } from "@/lib/supabase/server";

type Course = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  level: string | null;
  domain: string | null;
  practice_percentage: number | null;
};

type EnrollmentSeries = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  level: string | null;
  domain: string | null;
  courseIds: string[];
  completedCourses: number;
  progress: number;
};

type ContinueLearning = {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  progress: number;
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const supabase = await createClient();

  /* =========================================================
     PUBLIC COURSES
  ========================================================= */

  const {
    data: beginnerCourses,
  } = await supabase
    .from("courses")
    .select(
      "id, title, description, image_url, price, level, domain, practice_percentage",
    )
    .eq("is_published", true)
    .eq("is_beginner", true)
    .order("created_at", { ascending: false });

  const {
    data: partnerCourses,
  } = await supabase
    .from("courses")
    .select(
      "id, title, description, image_url, price, level, domain, practice_percentage",
    )
    .eq("is_published", true)
    .eq("is_partner", true)
    .order("created_at", { ascending: false })
    .limit(10);

  const {
    data: exclusiveCourses,
  } = await supabase
    .from("courses")
    .select(
      "id, title, description, image_url, price, level, domain, practice_percentage",
    )
    .eq("is_published", true)
    .eq("is_exclusive", true)
    .order("created_at", { ascending: false })
    .limit(10);

  const {
    data: trendingCourses,
  } = await supabase
    .from("courses")
    .select(
      "id, title, description, image_url, price, level, domain, practice_percentage",
    )
    .eq("is_published", true)
    .eq("is_trending", true)
    .order("created_at", { ascending: false })
    .limit(10);

  const {
    data: comingSoonCourses,
  } = await supabase
    .from("courses")
    .select(
      "id, title, description, image_url, price, level, domain, practice_percentage",
    )
    .eq("is_published", true)
    .eq("is_coming_soon", true)
    .order("created_at", { ascending: false })
    .limit(10);

  /* =========================================================
     CURRENT USER
  ========================================================= */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(
    "EVOLVE USER:",
    user?.id ?? "NOT LOGGED IN",
  );

  /* =========================================================
     PERSONALIZED DATA
  ========================================================= */

  let recommendedCourses: Course[] = [];
  let watchlistCourses: Course[] = [];
  let becauseYouCompleted: Course[] = [];
  let mostSearchedCourses: Course[] = [];

  let enrollmentPaths: EnrollmentSeries[] = [];

  let continueLearning:
    | ContinueLearning
    | null = null;

  /* =========================================================
     LOGGED-IN USER
  ========================================================= */

  if (user) {
    /* =======================================================
       ENROLLMENTS
    ======================================================= */

    const {
      data: enrollments,
    } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("user_id", user.id)
      .eq("payment_status", "paid");

    const enrolledIds = new Set(
      (enrollments ?? [])
        .map((item) => item.course_id)
        .filter(Boolean),
    );

    /* =======================================================
       RECOMMENDED FOR YOU
    ======================================================= */

    const {
      data: activities,
    } = await supabase
      .from("user_activity")
      .select("course_id")
      .eq("user_id", user.id)
      .not("course_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(20);

    const activityIds = [
      ...new Set(
        (activities ?? [])
          .map((item) => item.course_id)
          .filter(
            (id): id is string => Boolean(id),
          ),
      ),
    ];

    const {
      data: candidates,
    } = await supabase
      .from("courses")
      .select(
        "id, title, description, image_url, price, level, domain, practice_percentage",
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(50);

    const availableCourses = (
      candidates ?? []
    ).filter(
      (course) => !enrolledIds.has(course.id),
    );

    const activityIndex = new Map(
      activityIds.map(
        (courseId, index) => [
          courseId,
          index,
        ],
      ),
    );

    availableCourses.sort((a, b) => {
      const aIndex = activityIndex.get(a.id);
      const bIndex = activityIndex.get(b.id);

      if (
        aIndex !== undefined &&
        bIndex === undefined
      ) {
        return -1;
      }

      if (
        aIndex === undefined &&
        bIndex !== undefined
      ) {
        return 1;
      }

      if (
        aIndex !== undefined &&
        bIndex !== undefined
      ) {
        return aIndex - bIndex;
      }

      return 0;
    });

    recommendedCourses =
      availableCourses.slice(0, 10);

    /* =======================================================
       WATCHLIST
    ======================================================= */

    const {
      data: watchlist,
    } = await supabase
      .from("course_watchlist")
      .select("course_id")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(10);

    const watchlistIds =
      (watchlist ?? [])
        .map((item) => item.course_id)
        .filter(Boolean);

    if (watchlistIds.length > 0) {
      const {
        data: courses,
      } = await supabase
        .from("courses")
        .select(
          "id, title, description, image_url, price, level, domain, practice_percentage",
        )
        .in("id", watchlistIds)
        .eq("is_published", true);

      const courseMap = new Map(
        (courses ?? []).map(
          (course) => [
            course.id,
            course,
          ],
        ),
      );

      watchlistCourses =
        watchlistIds
          .map((courseId) =>
            courseMap.get(courseId),
          )
          .filter(
            (course): course is Course =>
              Boolean(course),
          );
    }

    /* =======================================================
       COMPLETED COURSES
    ======================================================= */

    if (enrolledIds.size > 0) {
      const {
        data: lessons,
      } = await supabase
        .from("lessons")
        .select("id, course_id")
        .in(
          "course_id",
          [...enrolledIds],
        );

      const lessonIds =
        (lessons ?? []).map(
          (lesson) => lesson.id,
        );

      if (lessonIds.length > 0) {
        const {
          data: progressRows,
        } = await supabase
          .from("lesson_progress")
          .select(
            "lesson_id, completed",
          )
          .eq("user_id", user.id)
          .in("lesson_id", lessonIds);

        const completedLessonIds = new Set(
          (progressRows ?? [])
            .filter(
              (row) => row.completed,
            )
            .map(
              (row) => row.lesson_id,
            ),
        );

        const completedCourseIds = new Set<string>();

        for (const courseId of enrolledIds) {
          const courseLessons =
            (lessons ?? []).filter(
              (lesson) =>
                lesson.course_id ===
                courseId,
            );

          if (
            courseLessons.length > 0 &&
            courseLessons.every(
              (lesson) =>
                completedLessonIds.has(
                  lesson.id,
                ),
            )
          ) {
            completedCourseIds.add(
              courseId,
            );
          }
        }

        if (completedCourseIds.size > 0) {
          const {
            data: completed,
          } = await supabase
            .from("courses")
            .select(
              "id, title, description, image_url, price, level, domain, practice_percentage",
            )
            .in(
              "id",
              [...completedCourseIds],
            );

          becauseYouCompleted =
            completed ?? [];
        }
      }
    }

    /* =======================================================
       YOUR ENROLLMENT PATH
    ======================================================= */

    const enrolledCourseIds =
      [...enrolledIds];

    if (enrolledCourseIds.length > 0) {
      const {
        data: seriesCourses,
      } = await supabase
        .from("series_courses")
        .select(
          "series_id, course_id, order_index",
        )
        .in(
          "course_id",
          enrolledCourseIds,
        )
        .order("order_index", {
          ascending: true,
        });

      const seriesIds = [
        ...new Set(
          (seriesCourses ?? [])
            .map(
              (item) => item.series_id,
            )
            .filter(Boolean),
        ),
      ];

      if (seriesIds.length > 0) {
        const {
          data: series,
        } = await supabase
          .from("course_series")
          .select(
            "id, title, description, image_url, level, domain",
          )
          .in("id", seriesIds)
          .eq(
            "is_published",
            true,
          );

        const {
          data: progressRows,
        } = await supabase
          .from("lesson_progress")
          .select(
            "lesson_id, completed",
          )
          .eq("user_id", user.id);

        const {
          data: lessons,
        } = await supabase
          .from("lessons")
          .select(
            "id, course_id",
          )
          .in(
            "course_id",
            enrolledCourseIds,
          );

        enrollmentPaths =
          (series ?? []).map(
            (item) => {
              const coursesInSeries =
                (seriesCourses ?? [])
                  .filter(
                    (sc) =>
                      sc.series_id ===
                      item.id,
                  )
                  .sort(
                    (a, b) =>
                      a.order_index -
                      b.order_index,
                  )
                  .map(
                    (sc) =>
                      sc.course_id,
                  );

              const completedCourses =
                coursesInSeries.filter(
                  (courseId) => {
                    const courseLessons =
                      (lessons ?? []).filter(
                        (lesson) =>
                          lesson.course_id ===
                          courseId,
                      );

                    if (
                      courseLessons.length ===
                      0
                    ) {
                      return false;
                    }

                    return courseLessons.every(
                      (lesson) =>
                        (
                          progressRows ??
                          []
                        ).some(
                          (progress) =>
                            progress.lesson_id ===
                              lesson.id &&
                            progress.completed,
                        ),
                    );
                  },
                ).length;

              const progress =
                coursesInSeries.length > 0
                  ? Math.round(
                      (completedCourses /
                        coursesInSeries.length) *
                        100,
                    )
                  : 0;

              return {
                ...item,
                courseIds:
                  coursesInSeries,
                completedCourses,
                progress,
              };
            },
          );
      }
    }

    /* =======================================================
       CONTINUE LEARNING
    ======================================================= */

    const {
      data: latestProgress,
    } = await supabase
      .from("lesson_progress")
      .select(
        "lesson_id, progress_percentage, updated_at",
      )
      .eq("user_id", user.id)
      .eq("completed", false)
      .order("updated_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();
      console.log("[Evolve] Latest Progress:", latestProgress);

    if (latestProgress) {
  const {
    data: lesson,
    error: lessonError,
  } = await supabase
    .from("lessons")
    .select("id, title, course_id")
    .eq("id", latestProgress.lesson_id)
    .maybeSingle();

  console.log("[Evolve] Continue Lesson:", lesson);
  console.log(
    "[Evolve] Continue Lesson Error:",
    lessonError,
  );

  if (lesson) {
    const {
      data: course,
      error: courseError,
    } = await supabase
      .from("courses")
      .select("id, title")
      .eq("id", lesson.course_id)
      .maybeSingle();

    console.log("[Evolve] Continue Course:", course);
    console.log(
      "[Evolve] Continue Course Error:",
      courseError,
    );

    if (course) {
      continueLearning = {
        courseId: course.id,
        courseTitle: course.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        progress:
          latestProgress.progress_percentage ?? 0,
      };
    }
  }
}
  }

  /* =========================================================
     MOST SEARCHED THIS WEEK

     Only query this if the table exists.
     If it does not exist, the section remains
     locked for logged-out users and empty for logged-in users.
  ========================================================= */

  if (user) {
    const {
      data: searchData,
    } = await supabase
      .from("search_analytics")
      .select("course_id")
      .not("course_id", "is", null)
      .limit(100);

    if (searchData) {
      const counts = new Map<
        string,
        number
      >();

      for (const item of searchData) {
        if (!item.course_id) continue;

        counts.set(
          item.course_id,
          (counts.get(
            item.course_id,
          ) ?? 0) + 1,
        );
      }

      const sortedIds =
        [...counts.entries()]
          .sort(
            (a, b) => b[1] - a[1],
          )
          .map(
            ([courseId]) =>
              courseId,
          );

      if (sortedIds.length > 0) {
        const {
          data: searchedCourses,
        } = await supabase
          .from("courses")
          .select(
            "id, title, description, image_url, price, level, domain, practice_percentage",
          )
          .in(
            "id",
            sortedIds,
          )
          .eq(
            "is_published",
            true,
          );

        const courseMap = new Map(
          (searchedCourses ?? []).map(
            (course) => [
              course.id,
              course,
            ],
          ),
        );

        mostSearchedCourses =
          sortedIds
            .map((id) =>
              courseMap.get(id),
            )
            .filter(
              (
                course,
              ): course is Course =>
                Boolean(course),
            )
            .slice(0, 10);
      }
    }
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-dvh bg-canvas text-ink">
      <Navbar />

      <Hero />

      <div className="bg-canvas">

        {/* =================================================
            1. RECOMMENDED FOR YOU
        ================================================= */}

        <HorizontalCourseSection
          title="Recommended For You"
          courses={recommendedCourses}
          locale={locale}
          locked={!user}
        />

        {/* =================================================
            2. YOUR ENROLLMENT PATH
        ================================================= */}

        {user &&
        enrollmentPaths.length > 0 ? (
          <section className="px-6 py-12 lg:px-10">
            <div className="mx-auto max-w-7xl">

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white md:text-3xl">
                  Your Enrollment Path
                </h2>
              </div>

              <div className="flex gap-5 overflow-x-auto pb-4">
                {enrollmentPaths.map(
                  (series) => (
                    <SeriesCard
                      key={series.id}
                      series={series}
                      courseCount={
                        series.courseIds
                          .length
                      }
                      completedCourses={
                        series.completedCourses
                      }
                      progress={
                        series.progress
                      }
                      locale={locale}
                    />
                  ),
                )}
              </div>

            </div>
          </section>
        ) : (
          <HorizontalCourseSection
            title="Your Enrollment Path"
            courses={[]}
            locale={locale}
            locked={!user}
          />
        )}

        {/* =================================================
            3. CONTINUE LEARNING
        ================================================= */}

        {user &&
        continueLearning ? (
          <section className="px-6 py-12 lg:px-10">
            <div className="mx-auto max-w-7xl">

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white md:text-3xl">
                  Continue Learning
                </h2>
              </div>

              <div className="flex gap-5 overflow-x-auto pb-4">

                <article className="w-[280px] shrink-0 overflow-hidden rounded-3xl border border-black/10 bg-white">

                  <div className="flex h-44 items-center justify-center bg-black">
                    <span className="text-4xl">
                      ▶️
                    </span>
                  </div>

                  <div className="p-5">

                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs">
                      In Progress
                    </span>

                    <h3 className="mt-4 line-clamp-2 text-lg font-bold text-black">
                      {
                        continueLearning.courseTitle
                      }
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-black/50">
                      {
                        continueLearning.lessonTitle
                      }
                    </p>

                    <div className="mt-4">

                      <div className="flex justify-between text-xs">
                        <span className="text-black/40">
                          Progress
                        </span>

                        <span className="font-semibold">
                          {
                            continueLearning.progress
                          }
                          %
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                continueLearning.progress,
                              ),
                            )}%`,
                          }}
                        />
                      </div>

                    </div>

                    <Link
                      href={`/${locale}/courses/${continueLearning.courseId}/lessons/${continueLearning.lessonId}`}
                      className="mt-5 block rounded-full bg-brand px-4 py-2 text-center text-xs font-semibold text-black"
                    >
                      Continue →
                    </Link>

                  </div>
                </article>

              </div>
            </div>
          </section>
        ) : (
          <HorizontalCourseSection
            title="Continue Learning"
            courses={[]}
            locale={locale}
            locked={!user}
          />
        )}

        {/* =================================================
            4. BECAUSE YOU COMPLETED
        ================================================= */}

        <HorizontalCourseSection
          title="Because You Completed"
          courses={becauseYouCompleted}
          locale={locale}
          locked={!user}
        />

        {/* =================================================
            5. BEGINNER STARTER PACK
        ================================================= */}

        <HorizontalCourseSection
          title="Beginner Starter Pack"
          courses={
            beginnerCourses ?? []
          }
          locale={locale}
        />

        {/* =================================================
            6. PARTNER COURSES ZONE
        ================================================= */}

        <HorizontalCourseSection
          title="Partner Courses Zone"
          courses={
            partnerCourses ?? []
          }
          locale={locale}
        />

        {/* =================================================
            7. WATCHLIST
        ================================================= */}

        <HorizontalCourseSection
          title="Watchlist"
          courses={watchlistCourses}
          locale={locale}
          locked={!user}
        />

        {/* =================================================
            8. MY WATCHLIST
        ================================================= */}

        <HorizontalCourseSection
          title="My Watchlist"
          courses={watchlistCourses}
          locale={locale}
          locked={!user}
        />

        {/* =================================================
            9. MOST SEARCHED THIS WEEK
        ================================================= */}

        <HorizontalCourseSection
          title="Most Searched This Week"
          courses={mostSearchedCourses}
          locale={locale}
          locked={!user}
        />

        {/* =================================================
            10. EXCLUSIVE TO EVOLVE
        ================================================= */}

        <HorizontalCourseSection
          title="Exclusive to Evolve"
          courses={
            exclusiveCourses ?? []
          }
          locale={locale}
        />

        {/* =================================================
            11. TRENDING
        ================================================= */}

        <HorizontalCourseSection
          title="Trending"
          courses={
            trendingCourses ?? []
          }
          locale={locale}
        />

        {/* =================================================
            12. COMING SOON
        ================================================= */}

        <HorizontalCourseSection
          title="Coming Soon"
          courses={
            comingSoonCourses ?? []
          }
          locale={locale}
        />

      </div>
    </main>
  );
}