
import Link from "next/link";
import SubmitProjectForm from "./SubmitProjectForm";
import CommunityFilters from "./CommunityFilters";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    technology?: string;
    sort?: string;
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
    console.error(
      "[Community] Error loading projects:",
      error,
    );
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, role",
    );

  const profileMap = new Map<string, Profile>(
    ((profiles ?? []) as Profile[]).map(
      (profile) => [
        profile.id,
        profile,
      ],
    ),
  );

  let projectList: Project[] =
    (data as Project[]) ?? [];

  // Search
  if (search) {
    const searchLower =
      search.toLowerCase();

    projectList = projectList.filter(
      (project) =>
        project.title
          .toLowerCase()
          .includes(searchLower) ||
        project.description
          ?.toLowerCase()
          .includes(searchLower) ||
        project.category
          ?.toLowerCase()
          .includes(searchLower) ||
        project.technologies?.some(
          (tech) =>
            tech
              .toLowerCase()
              .includes(searchLower),
        ),
    );
  }

  // Category filter
  if (category) {
    projectList = projectList.filter(
      (project) =>
        project.category === category,
    );
  }

  // Technology filter
  if (technology) {
    projectList = projectList.filter(
      (project) =>
        project.technologies?.some(
          (tech) =>
            tech === technology,
        ),
    );
  }

  // Sorting
  if (sort === "likes") {
    projectList.sort(
      (a, b) =>
        b.likes_count -
        a.likes_count,
    );
  } else {
    projectList.sort(
      (a, b) =>
        new Date(
          b.created_at,
        ).getTime() -
        new Date(
          a.created_at,
        ).getTime(),
    );
  }

  // Filter options
  const allProjects: Project[] =
    (data as Project[]) ?? [];

  const categories = Array.from(
    new Set(
      allProjects
        .map(
          (project) =>
            project.category,
        )
        .filter(
          (
            category,
          ): category is string =>
            Boolean(category),
        ),
    ),
  ).sort();

  const technologies = Array.from(
    new Set(
      allProjects.flatMap(
        (project) =>
          project.technologies ?? [],
      ),
    ),
  ).sort();

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold">
          Community
        </h1>

        <p className="mt-2 text-gray-500">
          Discover projects from the Evolve
          community.
        </p>

        <CommunityFilters
          categories={categories}
          technologies={technologies}
        />

        <section className="mt-10 rounded-2xl border p-6">
          <h2 className="text-2xl font-bold">
            Share your project
          </h2>

          <p className="mt-2 text-gray-500">
            Showcase what you have built with
            the Evolve community.
          </p>

          <div className="mt-6 max-w-2xl">
            <SubmitProjectForm
              locale={locale}
            />
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Community projects
            </h2>

            <span className="text-sm text-gray-500">
              {projectList.length}{" "}
              {projectList.length === 1
                ? "project"
                : "projects"}
            </span>
          </div>

          {projectList.length === 0 ? (
            <div className="mt-6 rounded-2xl border p-8 text-center">
              <p className="text-gray-500">
                No projects match your filters.
              </p>

              <Link
                href={`/${locale}/community`}
                className="mt-4 inline-block underline"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projectList.map((project) => {
                const profile =
                  profileMap.get(
                    project.user_id,
                  );

                return (
                  <Link
                    key={project.id}
                    href={`/${locale}/community/${project.id}`}
                    className="block"
                  >
                    <article className="h-full overflow-hidden rounded-2xl border transition hover:-translate-y-1 hover:shadow-lg">
                      {project.image_url && (
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="h-48 w-full object-cover"
                        />
                      )}

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-xl font-semibold">
                            {project.title}
                          </h3>

                          {project.category && (
                            <span className="rounded-full border px-2 py-1 text-xs">
                              {project.category}
                            </span>
                          )}
                        </div>

                        {/* Owner */}
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                          {profile?.avatar_url ? (
                            <img
                              src={
                                profile.avatar_url
                              }
                              alt={
                                profile.full_name ||
                                "User"
                              }
                              className="h-7 w-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
                              👤
                            </div>
                          )}

                          <span>
                            {profile?.full_name ||
                              "Evolve Member"}
                          </span>

                          {profile?.role && (
                            <span className="text-xs">
                              ·{" "}
                              {profile.role}
                            </span>
                          )}
                        </div>

                        {project.description && (
                          <p className="mt-3 line-clamp-3 text-sm text-gray-500">
                            {project.description}
                          </p>
                        )}

                        {project.technologies &&
                          project.technologies
                            .length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {project.technologies.map(
                                (
                                  technology,
                                ) => (
                                  <span
                                    key={
                                      technology
                                    }
                                    className="rounded-md bg-gray-100 px-2 py-1 text-xs"
                                  >
                                    {
                                      technology
                                    }
                                  </span>
                                ),
                              )}
                            </div>
                          )}

                        <div className="mt-5 flex items-center gap-3 text-sm">
                          {project.github_url && (
                            <span>
                              GitHub
                            </span>
                          )}

                          {project.demo_url && (
                            <span>
                              Live Demo
                            </span>
                          )}

                          <span className="ml-auto">
                            ❤️{" "}
                            {
                              project.likes_count
                            }
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-10">
          <Link
            href={`/${locale}/formations`}
            className="text-sm underline"
          >
            ← Back to Formations
          </Link>
        </div>
      </div>
    </main>
  );
}
