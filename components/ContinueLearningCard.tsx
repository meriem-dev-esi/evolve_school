import { Link } from "@/i18n/navigation";
import type { ContinueLearning } from "@/lib/data/dashboard";

interface Props {
  data: ContinueLearning;
  labels: {
    inProgress: string;
    progress: string;
    continueButton: string;
  };
}

export default function ContinueLearningCard({ data, labels }: Props) {
  return (
    <article className="w-[280px] shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
      <div className="flex h-44 items-center justify-center bg-black/60">
        <span className="text-4xl">▶️</span>
      </div>
      <div className="p-5">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
          {labels.inProgress}
        </span>
        <h3 className="mt-4 line-clamp-2 text-lg font-bold text-white">
          {data.courseTitle}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/50">
          {data.lessonTitle}
        </p>
        <div className="mt-4">
          <div className="flex justify-between text-xs">
            <span className="text-white/40">{labels.progress}</span>
            <span className="font-semibold text-white/80">
              {data.progress}%
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-lime-400"
              style={{
                width: `${Math.min(100, Math.max(0, data.progress))}%`,
              }}
            />
          </div>
        </div>
        <Link
          href={`/courses/${data.courseId}/lessons/${data.lessonId}`}
          className="mt-5 block rounded-full bg-lime-400 px-4 py-2 text-center text-xs font-semibold text-black transition hover:bg-lime-300"
        >
          {labels.continueButton}
        </Link>
      </div>
    </article>
  );
}
