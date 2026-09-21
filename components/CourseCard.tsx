import Link from "next/link";
import { ArrowUpRight, Zap, Award, BookOpen } from "lucide-react";

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
  const isFree = !course.price || course.price === 0;

  return (
    <article className="group relative w-[290px] shrink-0 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-violet-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-violet-100/60">
      {/* Top hover gradient accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 rounded-t-3xl bg-gradient-to-r from-violet-500 to-purple-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <Link href={`/${locale}/courses/${course.id}`} className="block">
        {/* Course Thumbnail */}
        <div className="relative h-44 w-full overflow-hidden bg-gray-100">
          {course.image_url ? (
            <img
              src={course.image_url}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100 text-violet-300 text-xs font-medium gap-2">
              <BookOpen className="h-8 w-8 text-violet-200" />
            </div>
          )}

          {/* Subtle bottom vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

          {/* Badges on Thumbnail */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            {course.domain && (
              <span className="rounded-full border border-white/60 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-700 backdrop-blur-md shadow-sm">
                {course.domain}
              </span>
            )}

            {course.practice_percentage && (
              <span className="flex items-center gap-1 rounded-full border border-violet-200 bg-violet-600/90 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-sm">
                <Zap className="h-3 w-3 fill-white" />
                {course.practice_percentage}% Pratique
              </span>
            )}
          </div>

          {/* Level Pill Bottom-Left */}
          {course.level && (
            <div className="absolute bottom-2.5 left-3">
              <span className="flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-medium text-gray-700 backdrop-blur-md shadow-sm">
                <Award className="h-3 w-3 text-violet-600" />
                {course.level}
              </span>
            </div>
          )}
        </div>

        {/* Course Details */}
        <div className="p-5">
          <h3 className="line-clamp-2 text-base font-bold text-gray-900 transition-colors duration-200 group-hover:text-violet-700">
            {course.title}
          </h3>

          {course.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
              {course.description}
            </p>
          )}

          {/* Price & Action Row */}
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 block">
                Tarif
              </span>
              <span className="text-sm font-extrabold text-gray-900">
                {isFree ? (
                  <span className="text-violet-600">Gratuit</span>
                ) : (
                  `${course.price?.toLocaleString("fr-DZ")} DA`
                )}
              </span>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition-all duration-300 group-hover:bg-violet-600 group-hover:border-violet-600 group-hover:text-white group-hover:scale-110 shadow-sm">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}