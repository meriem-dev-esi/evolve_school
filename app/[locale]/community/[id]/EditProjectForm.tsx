"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validateUploadFile, compressImage } from "@/lib/imageCompressor";
import {
  Upload,
  Sparkles,
  Github,
  Globe,
  Tag,
  AlertCircle,
  Loader2,
} from "lucide-react";

type Props = {
  projectId: string;
  locale: string;
  initialTitle: string;
  initialDescription: string;
  initialCategory: string;
  initialTechnologies: string;
  initialGithubUrl: string;
  initialDemoUrl: string;
  initialImageUrl: string;
};

const SUGGESTED_TAGS = [
  "Next.js",
  "React",
  "Tailwind CSS",
  "TypeScript",
  "Supabase",
  "Python",
  "Figma",
  "Node.js",
  "AI / LLM",
  "Mobile",
];

const CATEGORIES = [
  "Web App",
  "Mobile App",
  "UI/UX Design",
  "Intelligence Artificielle",
  "Portfolio",
  "Outil Open Source",
  "E-Commerce",
];

export default function EditProjectForm({
  projectId,
  locale,
  initialTitle,
  initialDescription,
  initialCategory,
  initialTechnologies,
  initialGithubUrl,
  initialDemoUrl,
  initialImageUrl,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [category, setCategory] = useState(initialCategory);
  const [technologies, setTechnologies] = useState(initialTechnologies);
  const [githubUrl, setGithubUrl] = useState(initialGithubUrl);
  const [demoUrl, setDemoUrl] = useState(initialDemoUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialImageUrl || null,
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file);

    if (!validation.valid) {
      setMessage(validation.error || "Fichier image invalide.");
      return;
    }

    try {
      const compressed = await compressImage(file, 1600, 0.85);
      setImageFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
      setMessage("");
    } catch {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addTechnologyTag = (tag: string) => {
    const currentTags = technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!currentTags.includes(tag)) {
      setTechnologies(
        currentTags.length > 0 ? `${technologies}, ${tag}` : tag,
      );
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    let finalImageUrl = initialImageUrl || null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("community-projects")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("[Image Upload]", uploadError);
        setMessage(
          "Impossible de télécharger l'image : " + uploadError.message,
        );
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from("community-projects")
        .getPublicUrl(filePath);

      finalImageUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("community_projects")
      .update({
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || null,
        technologies: technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        github_url: githubUrl.trim() || null,
        demo_url: demoUrl.trim() || null,
        image_url: finalImageUrl,
      })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) {
      console.error("[Project Update]", error);
      setMessage("Erreur lors de la mise à jour : " + error.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/community/${projectId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/70"
        >
          Titre du projet *
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex: Plateforme SaaS de Facturation pour PME Algériennes"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-brand focus:outline-none"
        />
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/70"
        >
          Catégorie
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-xl px-3 py-1.5 text-xs transition ${
                category === c
                  ? "bg-brand text-black font-bold"
                  : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Ou saisissez une catégorie personnalisée..."
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-brand focus:outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/70"
        >
          Description & Présentation *
        </label>
        <textarea
          id="description"
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Expliquez la problématique résolue, votre démarche technique et ce que vous avez appris durant ce projet..."
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-brand focus:outline-none"
        />
      </div>

      {/* Technologies */}
      <div>
        <label
          htmlFor="technologies"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5"
        >
          <Tag className="h-3.5 w-3.5 text-brand" />
          <span>Technologies employées (séparées par des virgules)</span>
        </label>
        <input
          id="technologies"
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          placeholder="Next.js, TypeScript, Tailwind, Supabase"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-brand focus:outline-none"
        />
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-white/40">Suggestions :</span>
          {SUGGESTED_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTechnologyTag(tag)}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/60 hover:border-brand/40 hover:text-white transition"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Links Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="github"
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5"
          >
            <Github className="h-3.5 w-3.5 text-brand" />
            <span>Lien GitHub (Optionnel)</span>
          </label>
          <input
            id="github"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="demo"
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5"
          >
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span>Lien Démo en ligne (Optionnel)</span>
          </label>
          <input
            id="demo"
            type="url"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            placeholder="https://mon-projet.vercel.app"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {/* Image Preview & Upload */}
      <div>
        <label
          htmlFor="project-image"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/70"
        >
          Capture d'écran ou Visuel du projet
        </label>

        {imagePreview && (
          <div className="relative mb-4 h-52 w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <img
              src={imagePreview}
              alt="Aperçu du projet"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <label
          htmlFor="project-image"
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-center hover:border-brand/50 hover:bg-white/[0.04] transition"
        >
          <Upload className="h-6 w-6 text-brand/80 mb-2" />
          <span className="text-xs font-semibold text-white">
            {imageFile
              ? `Nouveau fichier : ${imageFile.name}`
              : "Cliquez pour remplacer l'image (PNG, JPG, WebP)"}
          </span>
          <span className="text-[10px] text-white/40 mt-1">
            Recommandé : format 16:9, max 5 Mo (compression auto)
          </span>
          <input
            id="project-image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageChange}
            className="sr-only"
          />
        </label>
      </div>

      {/* Error Message */}
      {message && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => router.push(`/${locale}/community/${projectId}`)}
          className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-semibold text-white hover:bg-white/10 transition"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand px-8 py-3 text-xs font-bold text-black shadow-[0_0_20px_rgba(95,236,107,0.3)] transition hover:opacity-90 disabled:opacity-50 active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Sauvegarder les modifications</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}