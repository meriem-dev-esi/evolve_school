import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import EditProjectForm from "../EditProjectForm";

type Props = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function EditProjectPage({ params }: Props) {
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
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-brand selection:text-black">
      <Navbar />

      <main className="flex-1 px-5 pt-28 pb-20 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-brand/10 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-0 right-10 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="mx-auto max-w-3xl relative z-10">
          <Link
            href={`/${locale}/community/${id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-brand transition duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au projet</span>
          </Link>

          <div className="mt-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1 text-xs font-bold text-brand uppercase tracking-wider">
              <Pencil className="h-3.5 w-3.5" />
              Édition de projet
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Modifier votre réalisation
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Mettez à jour les informations, liens de démonstration et
              technologies de votre projet.
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <EditProjectForm
              projectId={project.id}
              locale={locale}
              initialTitle={project.title}
              initialDescription={project.description ?? ""}
              initialCategory={project.category ?? ""}
              initialTechnologies={project.technologies?.join(", ") ?? ""}
              initialGithubUrl={project.github_url ?? ""}
              initialDemoUrl={project.demo_url ?? ""}
              initialImageUrl={project.image_url ?? ""}
            />
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
