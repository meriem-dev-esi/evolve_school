"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  projectId: string;
  locale: string;
};

export default function ProjectActions({ projectId, locale }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  function handleEdit() {
    router.push(`/${locale}/community/${projectId}/edit`);
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer définitivement ce projet ?",
    );

    if (!confirmed) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("community_projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) {
      console.error("[Project Delete]", error);
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/community`);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleEdit}
        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/25 transition"
      >
        <Pencil className="h-3.5 w-3.5 text-brand" />
        <span>Modifier le projet</span>
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Suppression...</span>
          </>
        ) : (
          <>
            <Trash2 className="h-3.5 w-3.5" />
            <span>Supprimer</span>
          </>
        )}
      </button>
    </div>
  );
}
