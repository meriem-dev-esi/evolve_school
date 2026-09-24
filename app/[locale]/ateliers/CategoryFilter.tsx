"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  categories: string[];
  /** `null` = toutes les catégories */
  value: string | null;
  onChange: (category: string | null) => void;
};

export function CategorySidebar({ categories, value, onChange }: Props) {
  const t = useTranslations("ateliers.filters");
  const items: (string | null)[] = [null, ...categories];

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="glass-panel sticky top-28 rounded-3xl border border-white/10 p-5 shadow-xl">
        <h2 className="mb-4 px-2 text-xs font-bold tracking-wider text-white/40 rtl:tracking-normal">
          {t("title")}
        </h2>

        <nav className="space-y-1">
          {items.map((item) => {
            const active = value === item;

            return (
              <button
                key={item ?? "all"}
                type="button"
                onClick={() => onChange(item)}
                aria-pressed={active}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-start text-xs font-medium transition-all ${
                  active
                    ? "border border-brand/20 bg-brand/15 font-bold text-brand shadow-brand-glow-sm"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{item ?? t("all")}</span>
                {active && (
                  <ChevronRight
                    size={14}
                    className="text-brand rtl:rotate-180"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export function CategoryPills({ categories, value, onChange }: Props) {
  const t = useTranslations("ateliers.filters");
  const items: (string | null)[] = [null, ...categories];

  return (
    <div className="mb-8 flex gap-2 overflow-x-auto pb-2 lg:hidden">
      {items.map((item) => {
        const active = value === item;

        return (
          <button
            key={item ?? "all"}
            type="button"
            onClick={() => onChange(item)}
            aria-pressed={active}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-all ${
              active
                ? "border-brand/40 bg-brand/15 font-bold text-brand"
                : "border-white/10 bg-white/5 text-white/60"
            }`}
          >
            {item ?? t("allShort")}
          </button>
        );
      })}
    </div>
  );
}
