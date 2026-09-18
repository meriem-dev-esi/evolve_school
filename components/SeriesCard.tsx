import Link from "next/link";

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
    <article className="w-[320px] shrink-0 overflow-hidden rounded-3xl border border-black/10 bg-white">
      <Link href={`/${locale}/disciplines`}>
        <div className="relative h-44 overflow-hidden bg-black/5">
          {series.image_url ? (
            <img
              src={series.image_url}
              alt={series.title}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-black/30">
              Evolve Series
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex flex-wrap gap-2 text-xs">
            {series.domain && (
              <span className="rounded-full bg-black/5 px-3 py-1">
                {series.domain}
              </span>
            )}

            {series.level && (
              <span className="rounded-full bg-black/5 px-3 py-1">
                {series.level}
              </span>
            )}
          </div>

          <h3 className="mt-4 text-xl font-bold text-black">
            {series.title}
          </h3>

          {series.description && (
            <p className="mt-2 line-clamp-2 text-sm text-black/50">
              {series.description}
            </p>
          )}

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-black/50">
                {completedCourses}/{courseCount} courses completed
              </span>

              <span className="font-semibold text-black">
                {progress}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 inline-block rounded-full bg-brand px-4 py-2 text-xs font-semibold text-black">
            Continue Path →
          </div>
        </div>
      </Link>
    </article>
  );
}
