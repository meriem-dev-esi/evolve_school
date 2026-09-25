import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  level: string | null;
  domain: string | null;
  practice_percentage: number | null;
  reasons?: string[];
}

export interface EnrollmentSeries {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  level: string | null;
  domain: string | null;
  courseIds: string[];
  completedCourses: number;
  progress: number;
}

export interface ContinueLearning {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  progress: number;
}

export async function getHomePagePublicCourses() {
  const supabase = await createClient();

  const [
    { data: beginnerCourses },
    { data: partnerCourses },
    { data: exclusiveCourses },
    { data: trendingCourses },
    { data: comingSoonCourses },
  ] = await Promise.all([
    supabase
      .from("courses")
      .select(
        "id, title, description, image_url, price, level, domain, practice_percentage",
      )
      .eq("is_published", true)
      .eq("is_beginner", true)
      .order("created_at", { ascending: false }),

    supabase
      .from("courses")
      .select(
        "id, title, description, image_url, price, level, domain, practice_percentage",
      )
      .eq("is_published", true)
      .eq("is_partner", true)
      .order("created_at", { ascending: false })
      .limit(10),

    supabase
      .from("courses")
      .select(
        "id, title, description, image_url, price, level, domain, practice_percentage",
      )
      .eq("is_published", true)
      .eq("is_exclusive", true)
      .order("created_at", { ascending: false })
      .limit(10),

    supabase
      .from("courses")
      .select(
        "id, title, description, image_url, price, level, domain, practice_percentage",
      )
      .eq("is_published", true)
      .eq("is_trending", true)
      .order("created_at", { ascending: false })
      .limit(10),

    supabase
      .from("courses")
      .select(
        "id, title, description, image_url, price, level, domain, practice_percentage",
      )
      .eq("is_published", true)
      .eq("is_coming_soon", true)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return {
    beginnerCourses: beginnerCourses ?? [],
    partnerCourses: partnerCourses ?? [],
    exclusiveCourses: exclusiveCourses ?? [],
    trendingCourses: trendingCourses ?? [],
    comingSoonCourses: comingSoonCourses ?? [],
  };
}

export async function getUserDashboardData(userId: string) {
  const supabase = await createClient();

  const [{ data: enrollments }, { data: watchlist }, { data: searchData }] =
    await Promise.all([
      supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", userId)
        .eq("payment_status", "paid"),

      supabase
        .from("course_watchlist")
        .select("course_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),

      supabase
        .from("search_analytics")
        .select("course_id")
        .not("course_id", "is", null)
        .limit(100),
    ]);

  let watchlistCourses: Course[] = [];
  let becauseYouCompleted: Course[] = [];
  let enrollmentPaths: EnrollmentSeries[] = [];
  let mostSearchedCourses: Course[] = [];

  // Watchlist
  const watchlistIds = (watchlist ?? [])
    .map((i) => i.course_id)
    .filter(Boolean);
  if (watchlistIds.length > 0) {
    const { data: courses } = await supabase
      .from("courses")
      .select(
        "id, title, description, image_url, price, level, domain, practice_percentage",
      )
      .in("id", watchlistIds)
      .eq("is_published", true);

    const map = new Map((courses ?? []).map((c) => [c.id, c]));
    watchlistCourses = watchlistIds
      .map((id) => map.get(id))
      .filter((c): c is Course => Boolean(c));
  }

  // Enrollments & Progress
  const enrolledIds = new Set(
    (enrollments ?? []).map((i) => i.course_id).filter(Boolean),
  );
  const enrolledCourseIds = [...enrolledIds];

  if (enrolledCourseIds.length > 0) {
    const [{ data: lessons }, { data: seriesCourses }] = await Promise.all([
      supabase
        .from("lessons")
        .select("id, course_id")
        .in("course_id", enrolledCourseIds),
      supabase
        .from("series_courses")
        .select("series_id, course_id, order_index")
        .in("course_id", enrolledCourseIds)
        .order("order_index", { ascending: true }),
    ]);

    const lessonIds = (lessons ?? []).map((l) => l.id);

    if (lessonIds.length > 0) {
      const { data: progressRows } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", userId)
        .in("lesson_id", lessonIds);

      const completedLessonIds = new Set(
        (progressRows ?? []).filter((r) => r.completed).map((r) => r.lesson_id),
      );

      const completedCourseIds = new Set<string>();
      for (const courseId of enrolledIds) {
        const courseLessons = (lessons ?? []).filter(
          (l) => l.course_id === courseId,
        );
        if (
          courseLessons.length > 0 &&
          courseLessons.every((l) => completedLessonIds.has(l.id))
        ) {
          completedCourseIds.add(courseId);
        }
      }

      if (completedCourseIds.size > 0) {
        const { data: completed } = await supabase
          .from("courses")
          .select(
            "id, title, description, image_url, price, level, domain, practice_percentage",
          )
          .in("id", [...completedCourseIds]);

        becauseYouCompleted = completed ?? [];
      }
    }

    // Series
    const seriesIds = [
      ...new Set((seriesCourses ?? []).map((s) => s.series_id).filter(Boolean)),
    ];
    if (seriesIds.length > 0) {
      const [{ data: series }, { data: progressRows }] = await Promise.all([
        supabase
          .from("course_series")
          .select("id, title, description, image_url, level, domain")
          .in("id", seriesIds)
          .eq("is_published", true),
        supabase
          .from("lesson_progress")
          .select("lesson_id, completed")
          .eq("user_id", userId),
      ]);

      enrollmentPaths = (series ?? []).map((item) => {
        const coursesInSeries = (seriesCourses ?? [])
          .filter((sc) => sc.series_id === item.id)
          .sort((a, b) => a.order_index - b.order_index)
          .map((sc) => sc.course_id);

        const completedCourses = coursesInSeries.filter((courseId) => {
          const courseLessons = (lessons ?? []).filter(
            (l) => l.course_id === courseId,
          );
          if (courseLessons.length === 0) return false;
          return courseLessons.every((l) =>
            (progressRows ?? []).some(
              (p) => p.lesson_id === l.id && p.completed,
            ),
          );
        }).length;

        const progress =
          coursesInSeries.length > 0
            ? Math.round((completedCourses / coursesInSeries.length) * 100)
            : 0;

        return {
          ...item,
          courseIds: coursesInSeries,
          completedCourses,
          progress,
        };
      });
    }
  }

  // Analytics Search
  if (searchData) {
    const counts = new Map<string, number>();
    for (const item of searchData) {
      if (!item.course_id) continue;
      counts.set(item.course_id, (counts.get(item.course_id) ?? 0) + 1);
    }

    const sortedIds = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    if (sortedIds.length > 0) {
      const { data: searchedCourses } = await supabase
        .from("courses")
        .select(
          "id, title, description, image_url, price, level, domain, practice_percentage",
        )
        .in("id", sortedIds)
        .eq("is_published", true);

      const map = new Map((searchedCourses ?? []).map((c) => [c.id, c]));
      mostSearchedCourses = sortedIds
        .map((id) => map.get(id))
        .filter((c): c is Course => Boolean(c))
        .slice(0, 10);
    }
  }

  return {
    watchlistCourses,
    becauseYouCompleted,
    enrollmentPaths,
    mostSearchedCourses,
  };
}

export async function getContinueLearning(
  userId: string,
): Promise<ContinueLearning | null> {
  const supabase = await createClient();

  const { data: latestProgress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, progress_percentage, updated_at")
    .eq("user_id", userId)
    .eq("completed", false)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestProgress) return null;

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, course_id")
    .eq("id", latestProgress.lesson_id)
    .maybeSingle();

  if (!lesson) return null;

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", lesson.course_id)
    .maybeSingle();

  if (!course) return null;

  return {
    courseId: course.id,
    courseTitle: course.title,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    progress: latestProgress.progress_percentage ?? 0,
  };
}
