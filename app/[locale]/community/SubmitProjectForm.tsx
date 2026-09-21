"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { validateUploadFile, compressImage } from "@/lib/imageCompressor";
import {
  Upload,
  Sparkles,
  Github,
  Globe,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

type Props = {
  locale: string;
};

export default function SubmitProjectForm({ locale }: Props) {
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage({
        text: locale === "ar" ? "يجب تسجيل الدخول لنشر مشروع" : "Vous devez être connecté pour publier un projet.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    // Check duplicate
    const { data: duplicate } = await supabase
      .from("community_projects")
      .select("id")
      .eq("user_id", user.id)
      .eq("title", title.trim())
      .maybeSingle();

    if (duplicate) {
      setMessage({
        text: "Vous avez déjà publié un projet avec ce titre.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    let imageUrl: string | null = null;

    if (imageFile) {
      const validation = validateUploadFile(imageFile);
      if (!validation.valid) {
        setMessage({
          text: validation.error || "Fichier image invalide.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      const fileToUpload = await compressImage(imageFile);
      const fileName = `${crypto.randomUUID()}.webp`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("community-projects")
        .upload(filePath, fileToUpload, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/webp",
        });

      if (uploadError) {
        console.error("[Image Upload]", uploadError);
        setMessage({ text: uploadError.message, type: "error" });
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("community-projects")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from("community_projects").insert({
      user_id: user.id,
      title,
      description,
      category: category || null,
      technologies: technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      github_url: githubUrl || null,
      demo_url: demoUrl || null,
      image_url: imageUrl,
    });

    if (error) {
      console.error("[Project Create]", error);
      setMessage({ text: error.message, type: "error" });
      setLoading(false);
      return;
    }

    setTitle("");
    setDescription("");
    setCategory("");
    setTechnologies("");
    setGithubUrl("");
    setDemoUrl("");
    setImageFile(null);
    setPreviewUrl(null);

    setMessage({
      text: "Félicitations ! Votre projet a été publié avec succès dans la communauté.",
      type: "success",
    });

    setLoading(false);
  }

  const suggestedTechs = ["React", "Next.js", "Tailwind CSS", "Figma", "Flutter", "Three.js", "Supabase", "Python", "Blender"];

  const addTech = (t: string) => {
    const list = technologies
      ? technologies.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    if (!list.includes(t)) {
      list.push(t);
      setTechnologies(list.join(", "));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-white/80">
          Titre du projet <span className="text-brand">*</span>
        </label>
        <div className="relative">
          <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: SaaS Dashboard UI, Application Mobile Ecommerce..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/30 outline-none transition focus:border-brand/50 focus:bg-white/[0.08]"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-white/80">
          Description & Rôle <span className="text-brand">*</span>
        </label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Expliquez la problématique résolue, les technologies utilisées, votre démarche..."
          rows={4}
          className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white placeholder:text-white/30 outline-none transition focus:border-brand/50 focus:bg-white/[0.08]"
        />
      </div>

      {/* Grid Category & Technologies */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/80">
            Catégorie / Spécialité
          </label>
          <div className="relative">
            <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: UI/UX Design, Web Dev, Mobile..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/30 outline-none transition focus:border-brand/50"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/80">
            Technologies utilisées
          </label>
          <input
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            placeholder="Séparées par des virgules (ex: Next.js, Tailwind, Figma)"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder:text-white/30 outline-none transition focus:border-brand/50"
          />
        </div>
      </div>

      {/* Quick Add Tech Badges */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] text-white/40">Suggestions rapides :</span>
        {suggestedTechs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => addTech(t)}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] text-white/70 transition hover:border-brand/40 hover:text-brand"
          >
            + {t}
          </button>
        ))}
      </div>

      {/* URLs (GitHub & Demo) */}
      <div className="grid gap-4 sm:grid-cols-2 pt-1">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/80">
            Lien Code Source / GitHub
          </label>
          <div className="relative">
            <Github size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/30 outline-none transition focus:border-brand/50"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/80">
            Lien Démo / Prototype
          </label>
          <div className="relative">
            <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://mon-projet.dz ou Figma"
              className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/30 outline-none transition focus:border-brand/50"
            />
          </div>
        </div>
      </div>

      {/* Image File Upload */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-white/80">
          Capture d'écran / Aperçu visuel
        </label>
        <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] p-6 text-center transition hover:border-brand/40 hover:bg-white/[0.04]">
          <input
            id="project-image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />

          {previewUrl ? (
            <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-xl border border-white/20">
              <img src={previewUrl} alt="Aperçu" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition text-xs font-bold text-white">
                Changer l'image
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60">
                <Upload size={18} className="text-brand" />
              </div>
              <p className="text-xs font-medium text-white/80">
                Cliquez ou glissez une image ici (PNG, JPG, WebP)
              </p>
              <p className="mt-1 text-[11px] text-white/40">
                L'image sera automatiquement optimisée
              </p>
            </>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-xs font-extrabold text-black transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(95,236,107,0.5)] disabled:opacity-50 active:scale-95"
        >
          <Sparkles size={15} />
          <span>{loading ? "Publication en cours..." : "Publier mon projet sur Evolve"}</span>
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-4 text-xs font-medium ${
            message.type === "success"
              ? "border border-brand/30 bg-brand/10 text-brand"
              : "border border-rose-500/30 bg-rose-500/10 text-rose-400"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}
    </form>
  );
}
