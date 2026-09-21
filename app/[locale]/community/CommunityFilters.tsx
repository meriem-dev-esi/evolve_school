"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

type Props = {
  categories: string[];
  technologies: string[];
};

export default function CommunityFilters({
  categories,
  technologies,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page"); // Reset pagination on filter change
    router.push(`?${params.toString()}`);
  }

  const hasActiveFilters = Boolean(
    searchParams.get("q") ||
    searchParams.get("category") ||
    searchParams.get("technology") ||
    (searchParams.get("sort") && searchParams.get("sort") !== "newest")
  );

  const resetAll = () => {
    router.push(window.location.pathname);
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="glass-panel rounded-3xl p-3 shadow-xl border border-white/10 grid gap-3 md:grid-cols-12 items-center">
        {/* Search input */}
        <div className="relative md:col-span-4">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => updateFilter("q", e.target.value)}
            placeholder="Rechercher par titre, description, techno..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-brand/50 focus:bg-white/[0.08]"
          />
        </div>

        {/* Category select */}
        <div className="relative md:col-span-3">
          <select
            value={searchParams.get("category") ?? ""}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white/90 outline-none transition focus:border-brand/50 cursor-pointer appearance-none"
          >
            <option value="" className="bg-zinc-950 text-white">Toutes les spécialités</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-zinc-950 text-white">
                {cat}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-white/40">
            ▼
          </span>
        </div>

        {/* Technology select */}
        <div className="relative md:col-span-3">
          <select
            value={searchParams.get("technology") ?? ""}
            onChange={(e) => updateFilter("technology", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white/90 outline-none transition focus:border-brand/50 cursor-pointer appearance-none"
          >
            <option value="" className="bg-zinc-950 text-white">Toutes les technologies</option>
            {technologies.map((tech) => (
              <option key={tech} value={tech} className="bg-zinc-950 text-white">
                {tech}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-white/40">
            ▼
          </span>
        </div>

        {/* Sort select */}
        <div className="relative md:col-span-2">
          <select
            value={searchParams.get("sort") ?? "newest"}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white/90 outline-none transition focus:border-brand/50 cursor-pointer appearance-none"
          >
            <option value="newest" className="bg-zinc-950 text-white">Plus récents</option>
            <option value="likes" className="bg-zinc-950 text-white">Plus populaires ❤️</option>
          </select>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-white/40">
            ▼
          </span>
        </div>
      </div>

      {/* Active filters pill list */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="text-white/40 text-[11px]">Filtres actifs :</span>
          {searchParams.get("q") && (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">
              <span>"{searchParams.get("q")}"</span>
              <button type="button" onClick={() => updateFilter("q", "")} className="hover:opacity-75">
                <X size={12} />
              </button>
            </span>
          )}
          {searchParams.get("category") && (
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-400">
              <span>{searchParams.get("category")}</span>
              <button type="button" onClick={() => updateFilter("category", "")} className="hover:opacity-75">
                <X size={12} />
              </button>
            </span>
          )}
          {searchParams.get("technology") && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-400">
              <span>{searchParams.get("technology")}</span>
              <button type="button" onClick={() => updateFilter("technology", "")} className="hover:opacity-75">
                <X size={12} />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={resetAll}
            className="text-[11px] text-white/50 hover:text-white underline transition ml-1"
          >
            Effacer tous les filtres
          </button>
        </div>
      )}
    </div>
  );
}
