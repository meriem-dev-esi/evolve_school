"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  Clock3,
  Layers3,
  X,
  ArrowRight,
  Award,
  Sparkles,
} from "lucide-react";

type Workshop = {
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
  workshops: Workshop[];
  locale: string;
};

const categories = [
  "Business & Product",
  "Cloud & DevOps",
  "Data & AI",
  "Digital Marketing",
  "Mobile Development",
  "Web Development",
  "Career Skills",
  "Cybersecurity",
  "Design",
];

export default function AteliersBrowser({
  workshops,
  locale,
}: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Workshops");

  const filteredWorkshops = useMemo(() => {
    const query = search.trim().toLowerCase();

    return workshops.filter((workshop) => {
      const matchesCategory =
        category === "All Workshops" || workshop.domain === category;

      if (!matchesCategory) return false;

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
    setCategory("All Workshops");
  }

  return (
    <>
      {/* SEARCH BAR */}
      <div className="mx-auto mt-10 max-w-2xl px-6 lg:px-10">
        <div className="relative glass-panel rounded-2xl p-1 shadow-lg transition-all focus-within:border-brand/40 focus-within:shadow-[0_0_25px_rgba(95,236,107,0.15)]">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un atelier, sujet, technologie..."
            className="h-12 w-full rounded-xl bg-transparent pl-11 pr-11 text-sm text-white outline-none placeholder:text-white/30"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
              aria-label="Effacer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {search.trim() && (
          <p className="mt-3 text-xs text-white/40">
            Résultats pour{" "}
            <span className="font-semibold text-brand">"{search}"</span>
          </p>
        )}
      </div>

      {/* CONTENT */}
      <section className="mx-auto flex max-w-7xl gap-8 px-6 py-12 lg:px-10">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28 glass-panel rounded-3xl p-5 shadow-xl border border-white/10">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/40 px-2">
              Spécialités
            </h2>

            <nav className="space-y-1">
              {["All Workshops", ...categories].map((item) => {
                const active = category === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-all ${
                      active
                        ? "bg-brand/15 text-brand font-bold border border-brand/20 shadow-[0_0_12px_rgba(95,236,107,0.15)]"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{item === "All Workshops" ? "Tous les ateliers" : item}</span>
                    {active && <ChevronRight size={14} className="text-brand" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* MAIN LIST */}
        <div className="min-w-0 flex-1">
          {/* MOBILE CATEGORIES */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {["All Workshops", ...categories].map((item) => {
              const active = category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                    active
                      ? "border-brand/40 bg-brand/15 text-brand font-bold"
                      : "border-white/10 bg-white/5 text-white/60"
                  }`}
                >
                  {item === "All Workshops" ? "Tous" : item}
                </button>
              );
            })}
          </div>

          {/* HEADER */}
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                {category === "All Workshops" ? "Ateliers Pratiques Disponibles" : category}
              </h2>

              <p className="mt-1 text-xs text-white/50">
                {filteredWorkshops.length}{" "}
                {filteredWorkshops.length === 1 ? "atelier intensif" : "ateliers intensifs"}
              </p>
            </div>

            {(search.trim() || category !== "All Workshops") && (
              <button
                type="button"
                onClick={resetFilters}
                className="shrink-0 text-xs font-semibold text-brand transition hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {/* NO RESULTS */}
          {filteredWorkshops.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-20 text-center backdrop-blur-md">
              <Search size={36} className="mx-auto text-white/20" />

              <h3 className="mt-4 text-lg font-bold text-white">
                Aucun atelier trouvé
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/40">
                Nous n'avons trouvé aucun atelier correspondant à votre recherche. Essayez d'autres termes ou une autre catégorie.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-black transition hover:scale-105"
              >
                Voir tous les ateliers
              </button>
            </div>
          ) : (
            /* WORKSHOPS GRID */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredWorkshops.map((workshop) => {
                const isFree = Number(workshop.price) === 0;

                return (
                  <article
                    key={workshop.id}
                    className="group glass-card flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-brand/40 hover:-translate-y-1.5"
                  >
                    <div>
                      {/* IMAGE CONTAINER */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900">
                        {workshop.image_url ? (
                          <img
                            src={workshop.image_url}
                            alt={workshop.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-white/20">
                            <Layers3 size={54} className="text-brand/20" />
                          </div>
                        )}

                        {/* Dark Vignette Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-black/30" />

                        {/* Top Badges */}
                        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 rounded-full border border-brand/30 bg-black/70 px-3 py-1 text-[11px] font-bold text-brand backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                            Session Pratique
                          </span>

                          {workshop.domain && (
                            <span className="rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
                              {workshop.domain}
                            </span>
                          )}
                        </div>

                        {/* Level bottom-left */}
                        {workshop.level && (
                          <div className="absolute bottom-3 left-3.5">
                            <span className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-md">
                              <Award size={11} className="text-brand" />
                              {workshop.level}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* WORKSHOP DETAILS */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-white transition-colors group-hover:text-brand line-clamp-2">
                          {workshop.title}
                        </h3>

                        {workshop.description && (
                          <p className="mt-2 text-xs leading-relaxed text-white/50 line-clamp-2">
                            {workshop.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/50">
                          <span className="flex items-center gap-1.5">
                            <Clock3 size={14} className="text-sky-400" />
                            {workshop.duration || "Atelier intensif"}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Sparkles size={14} className="text-brand" />
                            Projet inclus
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* FOOTER & ACTION */}
                    <div className="p-6 pt-0">
                      <div className="flex items-center justify-between border-t border-white/10 pt-4">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-white/40 block">
                            Participation
                          </span>
                          <span className="text-sm font-extrabold text-white">
                            {isFree ? (
                              <span className="text-brand">Gratuit</span>
                            ) : (
                              `${workshop.price?.toLocaleString("fr-DZ")} DA`
                            )}
                          </span>
                        </div>

                        <Link
                          href={`/${locale}/ateliers/${workshop.id}`}
                          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-xs font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(95,236,107,0.5)]"
                        >
                          <span>Participer</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}