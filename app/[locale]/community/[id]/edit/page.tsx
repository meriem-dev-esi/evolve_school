import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EditProjectForm from "../EditProjectForm";

type Props = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function EditProjectPage({
  params,
}: Props) {
  const { locale, id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  const { data: project, error } = await supabase
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
        technologies
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[Edit Project]", error);
  }

  if (!project) {
    notFound();
  }

  if (project.user_id !== user.id) {
    redirect(`/${locale}/community/${id}`);
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/${locale}/community/${id}`}
          className="text-sm underline"
        >
          ← Back to Project
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-bold">
            Edit Project
          </h1>

          <p className="mt-2 text-gray-600">
            Update your community project information.
          </p>
        </div>

        <EditProjectForm
          projectId={project.id}
          locale={locale}
          initialTitle={project.title}
          initialDescription={
            project.description ?? ""
          }
          initialCategory={
            project.category ?? ""
          }
          initialTechnologies={
            project.technologies?.join(", ") ?? ""
          }
          initialGithubUrl={
            project.github_url ?? ""
          }
          initialDemoUrl={
            project.demo_url ?? ""
          }
          initialImageUrl={
            project.image_url ?? ""
          }
        />
      </div>
    </main>
  );
}