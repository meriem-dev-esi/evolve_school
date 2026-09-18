"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  Clock3,
  Layers3,
  X,
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
        category === "All Workshops" ||
        workshop.domain === category;

      if (!matchesCategory) return false;

      if (!query) return true;

      return (
        workshop.title.toLowerCase().includes(query) ||
        (workshop.description ?? "")
          .toLowerCase()
          .includes(query) ||
        (workshop.domain ?? "")
          .toLowerCase()
          .includes(query) ||
        (workshop.level ?? "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [workshops, search, category]);

  function resetFilters() {
    setSearch("");
    setCategory("All Workshops");
  }

  return (
    <>
      {/* SEARCH */}
      <div className="mx-auto mt-8 max-w-2xl px-6 lg:px-10">
        <div className="relative">
          <Search
            size={20}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search workshops..."
            className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.06] pl-12 pr-12 text-white outline-none transition placeholder:text-white/30 focus:border-purple-500/60 focus:bg-white/[0.08]"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {search.trim() && (
          <p className="mt-3 text-sm text-white/40">
            Search results for{" "}
            <span className="font-medium text-white/70">
              "{search}"
            </span>
          </p>
        )}
      </div>

      {/* CONTENT */}
      <section className="mx-auto flex max-w-7xl gap-8 px-6 py-10 lg:px-10">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-8">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white/40">
              Categories
            </h2>

            <nav className="space-y-1">
              {["All Workshops", ...categories].map(
                (item) => {
                  const active = category === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                        active
                          ? "bg-white/10 font-medium text-white"
                          : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <span>{item}</span>

                      {active && (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  );
                },
              )}
            </nav>
          </div>
        </aside>

        {/* MAIN */}
        <div className="min-w-0 flex-1">
          {/* MOBILE CATEGORIES */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {["All Workshops", ...categories].map(
              (item) => {
                const active = category === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                      active
                        ? "border-purple-500/50 bg-purple-500/20 text-white"
                        : "border-white/10 bg-white/[0.05] text-white/60"
                    }`}
                  >
                    {item}
                  </button>
                );
              },
            )}
          </div>

          {/* HEADER */}
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                {category === "All Workshops"
                  ? "Workshops"
                  : category}
              </h2>

              <p className="mt-2 text-sm text-white/40">
                {filteredWorkshops.length}{" "}
                {filteredWorkshops.length === 1
                  ? "workshop"
                  : "workshops"}{" "}
                available
              </p>
            </div>

            {(search.trim() ||
              category !== "All Workshops") && (
              <button
                type="button"
                onClick={resetFilters}
                className="shrink-0 text-sm text-white/40 transition hover:text-white"
              >
                Reset
              </button>
            )}
          </div>

          {/* NO RESULTS */}
          {filteredWorkshops.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
              <Search
                size={40}
                className="mx-auto text-white/20"
              />

              <h3 className="mt-5 text-xl font-semibold">
                No workshops found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
                We couldn't find a workshop matching your
                search. Try another keyword or category.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/80"
              >
                Reset filters
              </button>
            </div>
          ) : (
            /* WORKSHOPS */
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {filteredWorkshops.map((workshop) => (
                <article
                  key={workshop.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] transition hover:border-white/20"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-transparent">
                    {workshop.image_url ? (
                      <img
                        src={workshop.image_url}
                        alt={workshop.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Layers3
                          size={64}
                          className="text-white/20"
                        />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/20" />
                  </div>

                  {/* INFO */}
                  <div className="p-7">
                    <div className="flex flex-wrap gap-2">
                      {workshop.domain && (
                        <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-300">
                          {workshop.domain}
                        </span>
                      )}

                      {workshop.level && (
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                          {workshop.level}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-2xl font-bold">
                      {workshop.title}
                    </h3>

                    {workshop.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/50">
                        {workshop.description}
                      </p>
                    )}

                    <div className="mt-6 flex items-center gap-5 text-sm text-white/40">
                      <span className="flex items-center gap-2">
                        <Clock3 size={16} />
                        {workshop.duration ||
                          "Practical workshop"}
                      </span>

                      <span>
                        {Number(workshop.price) === 0
                          ? "Free"
                          : `${workshop.price} DA`}
                      </span>
                    </div>

                    {/* ACTION */}
                    <Link
                      href={`/${locale}/ateliers/${workshop.id}`}
                      className="mt-6 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/80"
                    >
                      Start Workshop →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}