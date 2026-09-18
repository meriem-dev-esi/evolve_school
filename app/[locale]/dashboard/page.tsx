import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Course = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
};

type Enrollment = {
  course_id: string;
  payment_status: string;
  courses: Course | Course[] | null;
};

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
};

type Progress = {
  lesson_id: string;
  progress_percentage: number;
  completed: boolean;
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{
    locale: string;
  }>;
}) {
  const { locale } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Please sign in</h1>

          <Link
            href={`/${locale}/sign-in`}
            className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-black"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      `
        course_id,
        payment_status,
        courses (
          id,
          title,
          description,
          image_url
        )
      `,
    )
    .eq("user_id", user.id)
    .eq("payment_status", "paid");

  const safeEnrollments = (enrollments ?? []) as Enrollment[];

  const courseIds = safeEnrollments.map(
    (enrollment) => enrollment.course_id,
  );

  const { data: lessons } = courseIds.length
    ? await supabase
        .from("lessons")
        .select("id, course_id, title, order_index")
        .in("course_id", courseIds)
        .order("order_index", { ascending: true })
    : { data: [] as Lesson[] };

  const lessonIds = (lessons ?? []).map((lesson) => lesson.id);

  const { data: progressRows } = lessonIds.length
    ? await supabase
        .from("lesson_progress")
        .select("lesson_id, progress_percentage, completed")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds)
    : { data: [] as Progress[] };

  const progressMap = new Map(
    (progressRows ?? []).map((progress) => [
      progress.lesson_id,
      progress,
    ]),
  );

  return (
    <main className="min-h-dvh bg-canvas px-6 py-24 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
          Evolve
        </p>

        <h1 className="mt-3 text-4xl font-bold md:text-5xl">
          My Dashboard
        </h1>

        <p className="mt-4 text-white/50">
          Continue your learning journey.
        </p>

        {safeEnrollments.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-2xl font-semibold">
              No courses yet
            </h2>

            <p className="mt-3 text-white/50">
              Start learning by choosing a course.
            </p>

            <Link
              href={`/${locale}/disciplines`}
              className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-black"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {safeEnrollments.map((enrollment) => {
              const course = Array.isArray(enrollment.courses)
                ? enrollment.courses[0]
                : enrollment.courses;

              if (!course) return null;

              const courseLessons = (lessons ?? []).filter(
                (lesson) => lesson.course_id === course.id,
              );

            const progressPercentage = courseLessons.length
  ? Math.round(
      courseLessons.reduce((total, lesson) => {
        const progress = progressMap.get(lesson.id);
        return total + (progress?.progress_percentage ?? 0);
      }, 0) / courseLessons.length,
    )
  : 0;

          const nextLesson =
  courseLessons.find((lesson) => {
    const progress = progressMap.get(lesson.id);

    return (
      progress &&
      progress.progress_percentage > 0 &&
      !progress.completed
    );
  }) ??
  courseLessons.find((lesson) => {
    const progress = progressMap.get(lesson.id);

    return !progress?.completed;
  });
  courseLessons[0];
              return (
                <div
                  key={course.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                >
                  {course.image_url && (
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="h-52 w-full object-cover"
                    />
                  )}

                  <div className="p-6">
                    <h2 className="text-2xl font-bold">
                      {course.title}
                    </h2>

                    {course.description && (
                      <p className="mt-3 line-clamp-2 text-white/50">
                        {course.description}
                      </p>
                    )}

                    <div className="mt-6">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-white/50">
                          Progress
                        </span>

                        <span className="font-semibold text-brand">
                          {progressPercentage}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-brand transition-all"
                          style={{
                            width: `${progressPercentage}%`,
                          }}
                        />
                      </div>
                    </div>
{nextLesson ? (
  <Link
    href={`/${locale}/courses/${course.id}/lessons/${nextLesson.id}`}
    className="mt-6 block rounded-full bg-brand px-6 py-3 text-center font-semibold text-black"
  >
    Continue Learning
  </Link>
) : (
  <div className="mt-6 rounded-full bg-green-500/10 px-6 py-3 text-center font-semibold text-green-400">
    Course Completed ✓
  </div>
)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}