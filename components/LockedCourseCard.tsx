import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Props = {
  locale?: string;
};

export default function LockedCourseCard({ locale: _locale }: Props = {}) {
  const t = useTranslations("lockedCourseCard");

  return (
    <article className="group relative w-[290px] min-w-[290px] shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl transition-all duration-300 hover:border-brand/40 hover:-translate-y-1">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -end-10 -top-10 h-32 w-32 rounded-full bg-brand/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-40" />

      <Link href="/sign-in" className="block">
        {/* Header with Illuminated Lock */}
        <div className="relative flex h-44 flex-col items-center justify-center overflow-hidden border-b border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-zinc-950/80 shadow-2xl backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
            <div className="absolute inset-0 rounded-2xl bg-brand/15 blur-md" />
            <Lock className="relative h-7 w-7 text-brand" />
          </div>

          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
            <Sparkles className="h-3 w-3" />
            {t("memberSpace")}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-base font-bold text-white transition-colors group-hover:text-brand">
            {t("personalizedContent")}
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-white/50">
            {t("description")}
          </p>

          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-xs font-semibold text-white/60">
              {t("exclusiveAccess")}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-bold text-black transition-all group-hover:shadow-[0_0_15px_rgba(95,236,107,0.5)]">
              <span>{t("signIn")}</span>
              <ArrowRight className="h-3 w-3 rtl:rotate-180" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
