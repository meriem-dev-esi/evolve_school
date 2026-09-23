import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getLearningProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 1. Get enrolled courses
  const { data: enrollments, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("course_id, enrolled_at")
    .eq("user_id", user.id)
    .order("enrolled_at", {
      ascending: false,
    });

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  const courseIds =
    enrollments?.map((enrollment) => enrollment.course_id) ?? [];

  if (courseIds.length === 0) {
    return {
      enrolledCourses: [],
      completedCourses: [],
      currentCourse: null,
      courseProgress: [],
    };
  }

  // 2. Get courses
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select(
      `
        id,
        title,
        level,
        domain,
        type,
        is_published,
        is_beginner
        `,
    )
    .in("id", courseIds);

  if (coursesError) {
    throw new Error(coursesError.message);
  }

  // 3. Get all lessons for enrolled courses
  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, course_id")
    .in("course_id", courseIds);

  if (lessonsError) {
    throw new Error(lessonsError.message);
  }

  const lessonIds = lessons?.map((lesson) => lesson.id) ?? [];

  if (lessonIds.length === 0) {
    return {
      enrolledCourses: courses ?? [],
      completedCourses: [],
      currentCourse: courses?.[0] ?? null,
      courseProgress: [],
    };
  }

  // 4. Get student's lesson progress
  const { data: progress, error: progressError } = await supabase
    .from("lesson_progress")
    .select(
      `
        lesson_id,
        progress_percentage,
        completed,
        updated_at
        `,
    )
    .eq("user_id", user.id)
    .in("lesson_id", lessonIds);

  if (progressError) {
    throw new Error(progressError.message);
  }

  // 5. Calculate progress for every course
  const courseProgress = (courses ?? []).map((course) => {
    const courseLessons =
      lessons?.filter((lesson) => lesson.course_id === course.id) ?? [];

    const courseProgressRows = courseLessons
      .map((lesson) => progress?.find((item) => item.lesson_id === lesson.id))
      .filter(Boolean);

    const completedLessons = courseProgressRows.filter(
      (item) => item?.completed,
    ).length;

    const totalLessons = courseLessons.length;

    const percentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      courseId: course.id,
      courseTitle: course.title,
      progressPercentage: percentage,
      completedLessons,
      totalLessons,
      completed: totalLessons > 0 && completedLessons === totalLessons,
    };
  });

  // 6. Completed courses
  const completedCourses = courseProgress
    .filter((course) => course.completed)
    .map((course) => course.courseId);

  // 7. Current course
  //
  // The current course is the most recently enrolled
  // course that is not yet completed.
  const currentCourseProgress = courseProgress.find(
    (course) => !course.completed,
  );

  const currentCourse =
    courses?.find((course) => course.id === currentCourseProgress?.courseId) ??
    null;

  return {
    enrolledCourses: courses ?? [],
    completedCourses,
    currentCourse,
    courseProgress,
  };
}
