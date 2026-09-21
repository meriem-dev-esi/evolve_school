import Link from "next/link";
import { Compass, CheckCircle2, ArrowRight, Layers } from "lucide-react";

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
  locale,
}: Props) {
  return (
    <article className="group relative w-[320px] shrink-0 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-violet-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-violet-100/60">
      {/* Top accent line on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 rounded-t-3xl bg-gradient-to-r from-violet-500 to-purple-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <Link href={`/${locale}/disciplines`} className="block">
        {/* Thumbnail Banner */}
        <div className="relative h-44 w-full overflow-hidden bg-gray-100">
          {series.image_url ? (
            <img
              src={series.image_url}
              alt={series.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100 text-violet-300 text-xs gap-2">
              <Layers className="h-8 w-8 text-violet-200 mb-1" />
              <span className="text-violet-400 font-medium">Parcours d&apos;Apprentissage</span>
            </div>
          )}

          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

          {/* Badges on Thumbnail */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-600/90 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-sm">
              <Compass className="h-3 w-3" />
              Parcours Guidé
            </span>

            {series.domain && (
              <span className="rounded-full border border-white/60 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-gray-700 backdrop-blur-md shadow-sm">
                {series.domain}
              </span>
            )}
          </div>

          {/* Level bottom-left */}
          {series.level && (
            <div className="absolute bottom-2.5 left-3">
              <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-medium text-gray-700 backdrop-blur-md shadow-sm">
                {series.level}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-5">
          <h3 className="line-clamp-2 text-lg font-bold text-gray-900 transition-colors duration-200 group-hover:text-violet-700">
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
                <CheckCircle2 className="h-3.5 w-3.5 text-violet-600" />
                {completedCourses}/{courseCount} formations
              </span>
              <span className="font-extrabold text-violet-700">{progress}%</span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-400 transition-all duration-500 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* CTA Row */}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Voir les étapes
            </span>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-bold text-gray-700 transition-all group-hover:bg-violet-600 group-hover:border-violet-600 group-hover:text-white shadow-sm">
              <span>Continuer</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
