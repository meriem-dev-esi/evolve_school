
import Comments from "./Comments";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

export default async function CommunityProjectPage({
  params,
}: Props) {
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

  // Check if the current user already liked this project
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

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/${locale}/community`}
          className="text-sm underline"
        >
          ← Back to Community
        </Link>

        <article className="mt-8 overflow-hidden rounded-2xl border">
          {project.image_url && (
            <img
              src={project.image_url}
              alt={project.title}
              className="h-80 w-full object-cover"
            />
          )}

          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold">
                {project.title}
              </h1>

              {project.category && (
                <span className="rounded-full border px-3 py-1 text-sm">
                  {project.category}
                </span>
              )}
            </div>

            {project.description && (
              <p className="mt-6 leading-7 text-gray-600">
                {project.description}
              </p>
            )}

            {project.technologies &&
              project.technologies.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold">
                    Technologies
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.technologies.map(
                      (technology: string) => (
                        <span
                          key={technology}
                          className="rounded-md bg-gray-100 px-3 py-1 text-sm"
                        >
                          {technology}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border px-4 py-2"
                >
                  GitHub
                </a>
              )}

              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border px-4 py-2"
                >
                  Live Demo
                </a>
              )}

              <LikeButton
                projectId={project.id}
                initialLikes={project.likes_count}
                initiallyLiked={initiallyLiked}
              />
            </div>

            {/* Project owner actions */}
            {isOwner && (
              <ProjectActions
                projectId={project.id}
                locale={locale}
              />
            )}
          </div>
        </article>

        <Comments projectId={project.id} />
      </div>
    </main>
  );
}
