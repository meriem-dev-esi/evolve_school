import { ArrowRight, Award, Clock3, Layers3, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type Workshop = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  duration: string | null;
  level: string | null;
  domain: string | null;
  price: number;
};

type Props = {
  workshop: Workshop;
  locale: string;
};

export default function WorkshopCard({ workshop, locale }: Props) {
  const t = useTranslations("ateliers.card");
  const isFree = workshop.price === 0;

  return (
    <article className="group glass-card flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-brand/40 hover:-translate-y-1.5">
      <div>
        {/* IMAGE */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900">
          {workshop.image_url ? (
            <img
              src={workshop.image_url}
              alt={workshop.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-white/20">
              <Layers3 size={54} className="text-brand/20" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-black/30" />

          {/* Badges du haut */}
          <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-brand/30 bg-black/70 px-3 py-1 text-xs font-bold text-brand backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
              {t("badge")}
            </span>

            {workshop.domain && (
              <span className="rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
                {workshop.domain}
              </span>
            )}
          </div>

          {/* Niveau */}
          {workshop.level && (
            <div className="absolute bottom-3 start-3.5">
              <span className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80 backdrop-blur-md">
                <Award size={11} className="text-brand" />
                {workshop.level}
              </span>
            </div>
          )}
        </div>

        {/* DÉTAILS */}
        <div className="p-6">
          <h3 className="line-clamp-2 text-lg font-bold text-white transition-colors group-hover:text-brand">
            {workshop.title}
          </h3>

          {workshop.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/50">
              {workshop.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <Clock3 size={14} className="text-brand/70" />
              {workshop.duration || t("defaultDuration")}
            </span>

            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-brand" />
              {t("projectIncluded")}
            </span>
          </div>
        </div>
      </div>

      {/* PIED : prix + action */}
      <div className="p-6 pt-0">
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <span className="block text-xs tracking-wider text-white/40 rtl:tracking-normal">
              {t("participation")}
            </span>
            <span className="text-sm font-extrabold text-white">
              {isFree ? (
                <span className="text-brand">{t("free")}</span>
              ) : (
                `${new Intl.NumberFormat(locale).format(workshop.price)} ${t("currency")}`
              )}
            </span>
          </div>

          <Link
            href={`/ateliers/${workshop.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-xs font-bold text-black transition-all hover:scale-105 hover:shadow-brand-glow-strong"
          >
            <span>{t("join")}</span>
            <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </article>
  );
}
