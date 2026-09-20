import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import LockedCourseCard from "@/components/LockedCourseCard";

type Course = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  level: string | null;
  domain: string | null;
  practice_percentage: number | null;

  // Recommendation reasons
  reasons?: string[];
};

type Props = {
  title: string;
  courses: Course[];
  locale: string;
  href?: string;
  locked?: boolean;
};

export default function HorizontalCourseSection({
  title,
  courses,
  locale,
  href,
  locked = false,
}: Props) {
  return (
    <section className="w-full px-6 py-12 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* TITLE */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            {title}
          </h2>

          {href && (
            <Link
              href={href}
              className="text-sm font-semibold text-white/60 transition hover:text-white"
            >
              View all →
            </Link>
          )}
        </div>

        {/* COURSES */}
        <div className="flex w-full gap-5 overflow-x-auto pb-4">

          {locked ? (
            <>
              <LockedCourseCard locale={locale} />
              <LockedCourseCard locale={locale} />
              <LockedCourseCard locale={locale} />
              <LockedCourseCard locale={locale} />
            </>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="min-w-[280px] shrink-0"
              >
                <CourseCard
                  course={course}
                  locale={locale}
                />

                {/* WHY THIS COURSE */}
                {course.reasons &&
                  course.reasons.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {course.reasons
                        .slice(0, 2)
                        .map((reason) => (
                          <span
                            key={reason}
                            className="rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs text-brand"
                          >
                            ✓ {reason}
                          </span>
                        ))}
                    </div>
                  )}
              </div>
            ))
          )}

        </div>

      </div>
    </section>
  );
}