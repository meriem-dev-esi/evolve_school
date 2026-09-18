import Link from "next/link";

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

type Props = {
  course: Course;
  locale: string;
};

export default function CourseCard({ course, locale }: Props) {
  return (
    <article className="group w-[280px] shrink-0 overflow-hidden rounded-3xl border border-black/10 bg-white transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/${locale}/courses/${course.id}`}>
        <div className="relative h-44 overflow-hidden bg-black/5">
          {course.image_url ? (
            <img
              src={course.image_url}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-black/5 text-sm text-black/30">
              No image
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex flex-wrap gap-2 text-xs">
            {course.domain && (
              <span className="rounded-full bg-black/5 px-3 py-1">
                {course.domain}
              </span>
            )}

            {course.level && (
              <span className="rounded-full bg-black/5 px-3 py-1">
                {course.level}
              </span>
            )}
          </div>

          <h3 className="mt-4 line-clamp-2 text-lg font-bold text-black">
            {course.title}
          </h3>

          {course.description && (
            <p className="mt-2 line-clamp-2 text-sm text-black/50">
              {course.description}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-black">
              {course.price && course.price > 0
                ? `${course.price} DA`
                : "Free"}
            </span>

            <span className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-black">
              View
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}