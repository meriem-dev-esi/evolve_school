"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { CategoryPills, CategorySidebar } from "./CategoryFilter";
import SearchBar from "./SearchBar";
import WorkshopCard, { type Workshop } from "./WorkshopCard";

type Props = {
  workshops: Workshop[];
  /** Noms des catégories, lus en base par la page (voir getDisciplines) */
  categories: string[];
  locale: string;
};

export default function AteliersBrowser({
  workshops,
  categories,
  locale,
}: Props) {
  const t = useTranslations("ateliers");
  const [search, setSearch] = useState("");
  // `null` = toutes les catégories (plus de valeur magique "All Workshops")
  const [category, setCategory] = useState<string | null>(null);

  const filteredWorkshops = useMemo(() => {
    const query = search.trim().toLowerCase();

    return workshops.filter((workshop) => {
      if (category !== null && workshop.domain !== category) return false;
      if (!query) return true;

      return (
        workshop.title.toLowerCase().includes(query) ||
        (workshop.description ?? "").toLowerCase().includes(query) ||
        (workshop.domain ?? "").toLowerCase().includes(query) ||
        (workshop.level ?? "").toLowerCase().includes(query)
      );
    });
  }, [workshops, search, category]);

  function resetFilters() {
    setSearch("");
    setCategory(null);
  }

  const hasFilters = search.trim() !== "" || category !== null;

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />

      <section className="mx-auto flex max-w-7xl gap-8 px-6 py-12 lg:px-10">
        <CategorySidebar
          categories={categories}
          value={category}
          onChange={setCategory}
        />

        <div className="min-w-0 flex-1">
          <CategoryPills
            categories={categories}
            value={category}
            onChange={setCategory}
          />

          {/* EN-TÊTE */}
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                {category ?? t("list.titleAll")}
              </h2>
              <p className="mt-1 text-xs text-white/50">
                {t("list.count", { count: filteredWorkshops.length })}
              </p>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="shrink-0 text-xs font-semibold text-brand transition hover:underline"
              >
                {t("list.reset")}
              </button>
            )}
          </div>

          {/* RÉSULTATS */}
          {filteredWorkshops.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-20 text-center backdrop-blur-md">
              <Search size={36} className="mx-auto text-white/20" />

              <h3 className="mt-4 text-lg font-bold text-white">
                {t("empty.title")}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/40">
                {t("empty.text")}
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-black transition hover:scale-105"
              >
                {t("empty.cta")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredWorkshops.map((workshop) => (
                <WorkshopCard
                  key={workshop.id}
                  workshop={workshop}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
