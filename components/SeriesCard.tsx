import { ArrowRight, CheckCircle2, Compass, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Props = {
  series: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    level: string | null;
    domain: string | null;
  };
  courseCount: number;
  completedCourses: number;
  progress: number;
  locale: string;
};

export default function SeriesCard({
  series,
  courseCount,
  completedCourses,
  progress,
  locale: _locale,
}: Props) {
  const t = useTranslations("seriesCard");

  return (
    <article className="group relative w-[320px] shrink-0 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-lime-400 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-lime-400/20">
      {/* Top accent line on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 rounded-t-3xl bg-gradient-to-r from-lime-400 to-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <Link href="/disciplines" prefetch={true} className="block">
        {/* Thumbnail Banner */}
        <div className="relative h-44 w-full overflow-hidden bg-gray-100">
          {series.image_url ? (
            <img
              src={series.image_url}
              alt={series.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-lime-50 to-emerald-100 text-lime-600 text-xs gap-2">
              <Layers className="h-8 w-8 text-lime-400 mb-1" />
              <span className="text-lime-600 font-medium">
                {t("learningPath")}
              </span>
            </div>
          )}

          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

          {/* Badges on Thumbnail */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-lime-300 bg-lime-500/95 px-2.5 py-1 text-[11px] font-bold text-black backdrop-blur-md shadow-sm">
              <Compass className="h-3 w-3" />
              {t("guidedPath")}
            </span>

            {series.domain && (
              <span className="rounded-full border border-white/60 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-gray-700 backdrop-blur-md shadow-sm">
                {series.domain}
              </span>
            )}
          </div>

          {/* Level bottom-start */}
          {series.level && (
            <div className="absolute bottom-2.5 start-3">
              <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-medium text-gray-700 backdrop-blur-md shadow-sm">
                {series.level}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-5">
          <h3 className="line-clamp-2 text-lg font-bold text-gray-900 transition-colors duration-200 group-hover:text-lime-600">
            {series.title}
          </h3>

          {series.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
              {series.description}
            </p>
          )}

          {/* Progress Indicator */}
          <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {completedCourses}/{courseCount}{" "}
                {t("coursesCount", { count: courseCount })}
              </span>
              <span className="font-extrabold text-emerald-600">
                {progress}%
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 transition-all duration-500 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* CTA Row */}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              {t("viewSteps")}
            </span>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-bold text-gray-700 transition-all group-hover:bg-lime-400 group-hover:border-lime-400 group-hover:text-black shadow-sm">
              <span>{t("continue")}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
