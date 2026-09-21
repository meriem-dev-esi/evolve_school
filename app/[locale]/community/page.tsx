import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SubmitProjectForm from "./SubmitProjectForm";
import CommunityFilters from "./CommunityFilters";
import { createClient } from "@/lib/supabase/server";
import {
  Sparkles,
  Heart,
  ExternalLink,
  Github,
  ArrowRight,
  ArrowLeft,
  Code2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Communauté & Projets Étudiants — Evolve Academy",
  description:
    "Découvrez les réalisations créatives et techniques des étudiants et membres de la communauté Evolve Academy.",
  openGraph: {
    title: "Communauté Evolve Academy — Projets Étudiants",
    description:
      "Explorez les créations, portfolios et applications développés par la communauté Evolve Academy.",
  },
};

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    technology?: string;
    sort?: string;
    page?: string;
  }>;
};

type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  github_url: string | null;
  demo_url: string | null;
  category: string | null;
  technologies: string[] | null;
  likes_count: number;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

export default async function CommunityPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const filters = await searchParams;

  const supabase = await createClient();

  const search = filters.q?.trim() ?? "";
  const category = filters.category ?? "";
  const technology = filters.technology ?? "";
  const sort = filters.sort ?? "newest";
  const currentPage = Math.max(1, Number.parseInt(filters.page || "1", 10));
  const pageSize = 12;

  const { data, error } = await supabase
    .from("community_projects")
    .select(`
      id,
      user_id,
      title,
      description,
      image_url,
      github_url,
      demo_url,
      category,
      technologies,
      likes_count,
      created_at
    `);

  if (error) {
    console.error("[Community] Error loading projects:", error);
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role");

  const profileMap = new Map<string, Profile>(
    ((profiles ?? []) as Profile[]).map((profile) => [profile.id, profile]),
  );

  let projectList: Project[] = (data as Project[]) ?? [];

  // Search
  if (search) {
    const searchLower = search.toLowerCase();
    projectList = projectList.filter(
      (project) =>
        project.title.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.category?.toLowerCase().includes(searchLower) ||
        project.technologies?.some((tech) =>
          tech.toLowerCase().includes(searchLower),
        ),
    );
  }

  // Category filter
  if (category) {
    projectList = projectList.filter(
      (project) => project.category === category,
    );
  }

  // Technology filter
  if (technology) {
    projectList = projectList.filter((project) =>
      project.technologies?.some((tech) => tech === technology),
    );
  }

  // Sorting
  if (sort === "likes") {
    projectList.sort((a, b) => b.likes_count - a.likes_count);
  } else {
    projectList.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  const allProjects: Project[] = (data as Project[]) ?? [];

  const categories = Array.from(
    new Set(
      allProjects
        .map((project) => project.category)
        .filter((cat): cat is string => Boolean(cat)),
    ),
  ).sort();

  const technologies = Array.from(
    new Set(
      allProjects.flatMap((project) => project.technologies ?? []),
    ),
  ).sort();

  // Pagination
  const totalCount = projectList.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedProjects = projectList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="min-h-dvh bg-canvas text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 pt-28 pb-16">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[450px] w-full max-w-7xl bg-brand/5 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl">
          {/* Header */}
          <div className="border-b border-white/10 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
                <Sparkles size={13} />
                Showcase Créatif & Tech
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              La Communauté <span className="text-gradient-brand">Evolve</span>
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/60 sm:text-base">
              Explorez les réalisations, portfolios, applications et designs créés par les talents de l'académie en Algérie.
            </p>

            {/* Community Stats Strip */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-3xl">
              <div className="glass-panel rounded-2xl p-3.5 border border-white/10">
                <div className="text-lg font-black text-white">{totalCount}+</div>
                <div className="text-[11px] text-white/50">Projets publiés</div>
              </div>
              <div className="glass-panel rounded-2xl p-3.5 border border-white/10">
                <div className="text-lg font-black text-brand">+1 200</div>
                <div className="text-[11px] text-white/50">Retours & feedbacks</div>
              </div>
              <div className="glass-panel rounded-2xl p-3.5 border border-white/10">
                <div className="text-lg font-black text-sky-400">95%</div>
                <div className="text-[11px] text-white/50">Insertion professionnelle</div>
              </div>
              <div className="glass-panel rounded-2xl p-3.5 border border-white/10">
                <div className="text-lg font-black text-amber-400">Top 10</div>
                <div className="text-[11px] text-white/50">Projets du mois</div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <CommunityFilters
            categories={categories}
            technologies={technologies}
          />

          {/* Submit Project Creator Card */}
          <section className="mt-12 glass-card rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/10 blur-[80px]" />

            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand">
                  Espace Créateur
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">
                Publiez votre réalisation sur Evolve
              </h2>

              <p className="mt-1 max-w-xl text-xs leading-relaxed text-white/60">
                Gagnez en visibilité, recevez les retours des mentors et connectez-vous avec de futurs recruteurs.
              </p>

              <div className="mt-6 max-w-3xl">
                <SubmitProjectForm locale={locale} />
              </div>
            </div>
          </section>

          {/* Projects Gallery */}
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Projets Récents
                </h2>
                <p className="text-xs text-white/50 mt-1">
                  Découvrez les travaux de la promotion actuelle
                </p>
              </div>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                {totalCount} {totalCount === 1 ? "réalisation" : "réalisations"}
              </span>
            </div>

            {projectList.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-16 text-center backdrop-blur-md">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl border border-white/10">
                  <Code2 className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-lg font-bold text-white">Aucun projet trouvé</h3>
                <p className="mt-1.5 text-xs text-white/50 max-w-sm mx-auto">
                  Aucune création ne correspond à vos critères. Essayez d'élargir votre recherche.
                </p>
                <Link
                  href={`/${locale}/community`}
                  className="mt-6 inline-block rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-black transition hover:scale-105"
                >
                  Réinitialiser les filtres
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedProjects.map((project) => {
                    const profile = profileMap.get(project.user_id);

                    return (
                      <article
                        key={project.id}
                        className="group glass-card flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-brand/40 hover:-translate-y-1.5"
                      >
                        <div>
                          {/* Image Container */}
                          <Link
                            href={`/${locale}/community/${project.id}`}
                            className="block relative aspect-video w-full overflow-hidden bg-zinc-900"
                          >
                            {project.image_url ? (
                              <img
                                src={project.image_url}
                                alt={project.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-brand/30">
                                <Code2 size={48} />
                              </div>
                            )}

                            {/* Dark Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-black/30" />

                            {/* Category Pill Top-Left */}
                            {project.category && (
                              <div className="absolute top-3 left-3">
                                <span className="rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
                                  {project.category}
                                </span>
                              </div>
                            )}
                          </Link>

                          {/* Content */}
                          <div className="p-6">
                            <Link href={`/${locale}/community/${project.id}`}>
                              <h3 className="text-base font-bold text-white transition-colors group-hover:text-brand line-clamp-1">
                                {project.title}
                              </h3>
                            </Link>

                            {/* Creator Badge */}
                            <div className="mt-3 flex items-center gap-2.5 text-xs text-white/60">
                              <div className="relative">
                                {profile?.avatar_url ? (
                                  <img
                                    src={profile.avatar_url}
                                    alt={profile.full_name || "Membre"}
                                    className="h-6 w-6 rounded-full object-cover border border-white/20"
                                  />
                                ) : (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/20 text-[10px] font-bold text-brand">
                                    {(profile?.full_name || "M").charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <span className="truncate font-medium text-white/80">
                                {profile?.full_name || "Membre Evolve"}
                              </span>
                              {profile?.role && (
                                <span className="text-white/40 text-[11px]">· {profile.role}</span>
                              )}
                            </div>

                            {project.description && (
                              <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-white/55">
                                {project.description}
                              </p>
                            )}

                            {/* Technology Chips */}
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-1.5">
                                {project.technologies.slice(0, 4).map((tech) => (
                                  <span
                                    key={tech}
                                    className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/80"
                                  >
                                    {tech}
                                  </span>
                                ))}
                                {project.technologies.length > 4 && (
                                  <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">
                                    +{project.technologies.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="p-6 pt-0">
                          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                            <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                              <Heart size={14} className="fill-rose-400/20" />
                              {project.likes_count}
                            </span>

                            <div className="flex items-center gap-2">
                              {project.github_url && (
                                <a
                                  href={project.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Code source GitHub"
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                                >
                                  <Github size={13} />
                                </a>
                              )}
                              {project.demo_url && (
                                <a
                                  href={project.demo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Démo en direct"
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                                >
                                  <ExternalLink size={13} />
                                </a>
                              )}
                              <Link
                                href={`/${locale}/community/${project.id}`}
                                className="inline-flex items-center gap-1 rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-[11px] font-bold text-brand transition hover:bg-brand hover:text-black"
                              >
                                <span>Détails</span>
                                <ArrowRight size={11} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Link
                        key={pageNum}
                        href={`/${locale}/community?${new URLSearchParams({
                          ...(search ? { q: search } : {}),
                          ...(category ? { category } : {}),
                          ...(technology ? { technology } : {}),
                          ...(sort ? { sort } : {}),
                          page: pageNum.toString(),
                        }).toString()}`}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                          pageNum === currentPage
                            ? "bg-brand text-black shadow-[0_0_15px_rgba(95,236,107,0.4)]"
                            : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          <div className="mt-14 pt-8 border-t border-white/10 flex items-center justify-between">
            <Link
              href={`/${locale}/formations`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 transition hover:text-brand"
            >
              <ArrowLeft size={14} />
              <span>Retour aux formations</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}