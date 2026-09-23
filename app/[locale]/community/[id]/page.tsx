import {
  ArrowLeft,
  Calendar,
  Code2,
  ExternalLink,
  Github,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import Comments from "./Comments";
import LikeButton from "./LikeButton";
import ProjectActions from "./ProjectActions";

type Props = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

type CommunityProject = {
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("community_projects")
    .select("title, description, image_url")
    .eq("id", id)
    .maybeSingle();

  if (!project) {
    return {
      title: "Projet non trouvé — Evolve Academy",
    };
  }

  return {
    title: `${project.title} — Communauté Evolve`,
    description:
      project.description ||
      "Découvrez ce projet développé par la communauté Evolve Academy.",
    openGraph: {
      title: `${project.title} — Evolve Academy`,
      description:
        project.description ||
        "Projet réalisé par les étudiants d'Evolve Academy.",
      images: project.image_url ? [{ url: project.image_url }] : [],
    },
  };
}

export default async function CommunityProjectPage({ params }: Props) {
  const { locale, id } = await params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("community_projects")
    .select(
      `
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
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[Community Project]", error);
  }

  const project = data as CommunityProject | null;

  if (!project) {
    notFound();
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get author profile
  const { data: authorProfile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", project.user_id)
    .maybeSingle();

  // Check if current user has liked this project
  let initiallyLiked = false;

  if (user) {
    const { data: like } = await supabase
      .from("community_project_likes")
      .select("id")
      .eq("project_id", project.id)
      .eq("user_id", user.id)
      .maybeSingle();

    initiallyLiked = !!like;
  }

  // Check if current user owns this project
  const isOwner = user?.id === project.user_id;

  const authorName = authorProfile?.full_name || "Étudiant Evolve";
  const formattedDate = new Date(project.created_at).toLocaleDateString(
    locale === "ar" ? "ar-DZ" : "fr-FR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-brand selection:text-black">
      <Navbar />

      <main className="flex-1 px-5 pt-28 pb-20 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-brand/10 blur-[140px]" />
        <div className="pointer-events-none absolute top-1/2 right-10 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="mx-auto max-w-4xl relative z-10">
          {/* Breadcrumb Navigation */}
          <Link
            href={`/${locale}/community`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-brand transition duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour aux projets de la communauté</span>
          </Link>

          {/* Main Showcase Article */}
          <article className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
            {/* Project Image Banner */}
            {project.image_url ? (
              <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-zinc-900 border-b border-white/10">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
              </div>
            ) : null}

            <div className="p-6 sm:p-10">
              {/* Meta tags & Category */}
              <div className="flex flex-wrap items-center gap-3">
                {project.category && (
                  <span className="rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1 text-xs font-bold text-brand tracking-wide">
                    {project.category}
                  </span>
                )}

                <span className="flex items-center gap-1.5 text-xs text-white/40">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate}
                </span>

                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <Sparkles className="h-3.5 w-3.5" />
                  Vérifié Evolve Showcase
                </span>
              </div>

              {/* Title */}
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                {project.title}
              </h1>

              {/* Author Strip */}
              <div className="mt-6 flex items-center justify-between gap-4 border-y border-white/10 py-4">
                <div className="flex items-center gap-3.5">
                  {authorProfile?.avatar_url ? (
                    <img
                      src={authorProfile.avatar_url}
                      alt={authorName}
                      className="h-11 w-11 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/15 border border-brand/30 text-sm font-bold text-brand">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {authorName}
                      </span>
                      {authorProfile?.role && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
                          {authorProfile.role}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40">Créateur du projet</p>
                  </div>
                </div>

                <div className="shrink-0">
                  <LikeButton
                    projectId={project.id}
                    initialLikes={project.likes_count}
                    initiallyLiked={initiallyLiked}
                  />
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <div className="mt-8">
                  <p className="text-sm sm:text-base leading-relaxed text-white/80 whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              )}

              {/* Technologies Employed */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mt-8">
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50">
                    <Code2 className="h-4 w-4 text-brand" />
                    Technologies & Outils
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.technologies.map((technology) => (
                      <span
                        key={technology}
                        className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-mono font-medium text-white/90 hover:border-brand/40 transition"
                      >
                        {technology}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-10 flex flex-wrap items-center gap-3 pt-6 border-t border-white/10">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-black hover:opacity-90 transition shadow-[0_0_20px_rgba(95,236,107,0.25)]"
                  >
                    <span>Tester la démo en ligne</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}

                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/25 transition"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>Code source GitHub</span>
                  </a>
                )}

                {/* Direct Message Author */}
                <Link
                  href={`/${locale}/messages?recipient=${project.user_id}&course=${encodeURIComponent(project.title)}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Échanger avec l'auteur</span>
                </Link>
              </div>

              {/* Project owner actions */}
              {isOwner && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">
                      Gestion de votre projet (Auteur) :
                    </span>
                    <ProjectActions projectId={project.id} locale={locale} />
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Comments Section */}
          <div className="mt-10">
            <Comments projectId={project.id} />
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
