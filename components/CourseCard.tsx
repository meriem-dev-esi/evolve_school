import { ArrowUpRight, Award, BookOpen, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

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
  const t = useTranslations("courseCard");
  const isFree = !course.price || course.price === 0;

  return (
    <article className="group relative w-[290px] shrink-0 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-lime-400 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-lime-400/20">
      {/* Top hover gradient accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 rounded-t-3xl bg-gradient-to-r from-lime-400 to-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <Link href={`/courses/${course.id}`} prefetch={true} className="block">
        {/* Course Thumbnail */}
        <div className="relative h-44 w-full overflow-hidden bg-gray-100">
          {course.image_url ? (
            <img
              src={course.image_url}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-lime-50 to-emerald-100 text-lime-600 text-xs font-medium gap-2">
              <BookOpen className="h-8 w-8 text-lime-400" />
            </div>
          )}

          {/* Subtle bottom vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

          {/* Badges on Thumbnail */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
            {course.domain && (
              <span className="rounded-full border border-white/60 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-700 backdrop-blur-md shadow-sm">
                {course.domain}
              </span>
            )}

            {course.practice_percentage && (
              <span className="flex items-center gap-1 rounded-full border border-lime-300 bg-lime-500/95 px-2.5 py-1 text-[11px] font-bold text-black backdrop-blur-md shadow-sm">
                <Zap className="h-3 w-3 fill-black" />
                {course.practice_percentage}% {t("practice")}
              </span>
            )}
          </div>

          {/* Level Pill Bottom-Start */}
          {course.level && (
            <div className="absolute bottom-2.5 start-3">
              <span className="flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-medium text-gray-700 backdrop-blur-md shadow-sm">
                <Award className="h-3 w-3 text-lime-600" />
                {course.level}
              </span>
            </div>
          )}
        </div>

        {/* Course Details */}
        <div className="p-5">
          <h3 className="line-clamp-2 text-base font-bold text-gray-900 transition-colors duration-200 group-hover:text-lime-600">
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
                {t("priceLabel")}
              </span>
              <span className="text-sm font-extrabold text-gray-900">
                {isFree ? (
                  <span className="text-emerald-600 font-bold">
                    {t("free")}
                  </span>
                ) : (
                  `${course.price?.toLocaleString(locale === "ar" ? "ar-DZ" : locale === "en" ? "en-US" : "fr-DZ")} DA`
                )}
              </span>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition-all duration-300 group-hover:bg-lime-400 group-hover:border-lime-400 group-hover:text-black group-hover:scale-110 shadow-sm">
              <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
