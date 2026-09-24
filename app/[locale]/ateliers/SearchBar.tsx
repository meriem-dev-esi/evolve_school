"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  const t = useTranslations("ateliers.search");

  return (
    <div className="mx-auto mt-10 max-w-2xl px-6 lg:px-10">
      <div className="glass-panel relative rounded-2xl p-1 shadow-lg transition-all focus-within:border-brand/40 focus-within:shadow-brand-glow">
        <Search
          size={18}
          className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-white/40"
        />

        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("label")}
          className="h-12 w-full rounded-xl bg-transparent ps-11 pe-11 text-sm text-white outline-none placeholder:text-white/30"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute end-3.5 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
            aria-label={t("clear")}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {value.trim() && (
        <p className="mt-3 text-xs text-white/40">
          {t("resultsFor")}{" "}
          <span className="font-semibold text-brand">{`“${value}”`}</span>
        </p>
      )}
    </div>
  );
}
