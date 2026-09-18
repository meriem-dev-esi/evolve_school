
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  projectId: string;
  initialLikes: number;
  initiallyLiked: boolean;
};

export default function LikeButton({
  projectId,
  initialLikes,
  initiallyLiked,
}: Props) {
  const supabase = createClient();

  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initiallyLiked);
  const [loading, setLoading] = useState(false);

  async function handleLike() {
    if (loading) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be signed in to like a project.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc(
      "toggle_project_like",
      {
        p_project_id: projectId,
      },
    );

    if (error) {
      console.error("[Like]", error);
      setLoading(false);
      return;
    }

    const isNowLiked = Boolean(data);

    setLiked(isNowLiked);

    setLikes((current) =>
      isNowLiked
        ? current + 1
        : Math.max(0, current - 1),
    );

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={loading}
      className="rounded-lg border px-4 py-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {liked ? "❤️" : "🤍"} {likes}
    </button>
  );
}

