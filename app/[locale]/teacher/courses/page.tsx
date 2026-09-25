import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["teacher", "admin"].includes(profile.role)) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Access denied</h1>

          <p className="mt-3 text-white/50">Teacher access is required.</p>
        </div>
      </main>
    );
  }

  const { data: courses, error } = await supabase
    .from("courses")
    .select(
      "id, title, description, image_url, domain, level, type, practice_percentage, is_published, is_beginner, is_partner, is_exclusive, is_trending, is_coming_soon, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-dvh bg-black px-6 py-28 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
              Teacher Dashboard
            </p>

            <h1 className="mt-4 text-4xl font-bold md:text-5xl">My Courses</h1>

            <p className="mt-3 text-white/50">
              Create and manage your Evolve courses.
            </p>
          </div>

          <Link
            href={`/${locale}/teacher/courses/new`}
            className="rounded-full bg-brand px-6 py-3 font-semibold text-black transition hover:opacity-90"
          >
            + Create Course
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-10 rounded-3xl border border-red-400/20 bg-red-400/5 p-8 text-red-400">
            Error: {error.message}
          </div>
        )}

        {/* Empty */}
        {!error && courses?.length === 0 && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-2xl font-semibold">No courses yet</h2>

            <p className="mt-3 text-white/50">Create your first course.</p>

            <Link
              href={`/${locale}/teacher/courses/new`}
              className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-black"
            >
              Create Course
            </Link>
          </div>
        )}

        {/* Courses */}
        {!error && courses && courses.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
              >
                {/* Image */}
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-white/5">
                    <span className="text-white/20">No image</span>
                  </div>
                )}

                <div className="p-6">
                  {/* Status */}
                  <div className="flex flex-wrap gap-2">
                    {course.is_published ? (
                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                        Published
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                        Draft
                      </span>
                    )}

                    {course.is_beginner && (
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                        Beginner
                      </span>
                    )}

                    {course.is_partner && (
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                        Partner
                      </span>
                    )}

                    {course.is_exclusive && (
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-xs text-brand">
                        Exclusive
                      </span>
                    )}

                    {course.is_trending && (
                      <span className="rounded-full bg-pink-500/10 px-3 py-1 text-xs text-pink-400">
                        Trending
                      </span>
                    )}

                    {course.is_coming_soon && (
                      <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="mt-4 text-xl font-bold">{course.title}</h2>

                  {/* Description */}
                  {course.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-white/40">
                      {course.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-white/5 p-3">
                      <p className="text-white/30">Domain</p>

                      <p className="mt-1 font-medium">{course.domain || "—"}</p>
                    </div>

                    <div className="rounded-2xl bg-white/5 p-3">
                      <p className="text-white/30">Level</p>

                      <p className="mt-1 font-medium">{course.level || "—"}</p>
                    </div>

                    <div className="rounded-2xl bg-white/5 p-3">
                      <p className="text-white/30">Type</p>

                      <p className="mt-1 font-medium">{course.type || "—"}</p>
                    </div>

                    <div className="rounded-2xl bg-white/5 p-3">
                      <p className="text-white/30">Practice</p>

                      <p className="mt-1 font-medium text-brand">
                        {course.practice_percentage ?? 0}%
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <Link
                      href={`/${locale}/courses/${course.id}`}
                      className="rounded-full border border-white/10 px-4 py-3 text-center text-sm font-semibold transition hover:border-brand hover:text-brand"
                    >
                      View
                    </Link>

                    <Link
                      href={`/${locale}/teacher/courses/${course.id}/edit`}
                      className="rounded-full bg-brand px-4 py-3 text-center text-sm font-semibold text-black transition hover:opacity-90"
                    >
                      Edit
                    </Link>

                    <Link
                      href={`/${locale}/teacher/courses/${course.id}/lessons`}
                      className="rounded-full border border-white/10 px-4 py-3 text-center text-sm font-semibold transition hover:border-brand hover:text-brand"
                    >
                      Lessons
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
