
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  projectId: string;
  locale: string;
};

export default function ProjectActions({
  projectId,
  locale,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  function handleEdit() {
    router.push(
      `/${locale}/community/${projectId}/edit`,
    );
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmed) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be signed in.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("community_projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "[Project Delete]",
        error,
      );
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/community`);
    router.refresh();
  }

  return (
    <div className="mt-6 flex gap-3">
      <button
        type="button"
        onClick={handleEdit}
        className="rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-100"
      >
        ✏️ Edit
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Deleting..." : "🗑️ Delete"}
      </button>
    </div>
  );
}
