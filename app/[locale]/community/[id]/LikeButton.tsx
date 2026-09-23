"use client";

import { Heart, Loader2 } from "lucide-react";
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
      alert("Connectez-vous pour aimer ce projet.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc("toggle_project_like", {
      p_project_id: projectId,
    });

    if (error) {
      console.error("[Like]", error);
      setLoading(false);
      return;
    }

    const isNowLiked = Boolean(data);

    setLiked(isNowLiked);

    setLikes((current) =>
      isNowLiked ? current + 1 : Math.max(0, current - 1),
    );

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={loading}
      aria-label={liked ? "Je n'aime plus" : "J'aime ce projet"}
      className={`group relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold backdrop-blur-md transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 border ${
        liked
          ? "border-rose-500/40 bg-rose-500/15 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.25)] hover:bg-rose-500/25"
          : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white"
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
      ) : (
        <Heart
          className={`h-4 w-4 transition-all duration-300 ${
            liked
              ? "fill-rose-500 text-rose-500 scale-110"
              : "text-white/60 group-hover:scale-110 group-hover:text-rose-400"
          }`}
        />
      )}
      <span className="tabular-nums font-mono">{likes}</span>
      <span className="text-[11px] font-normal text-white/40 group-hover:text-white/60 transition-colors">
        {likes <= 1 ? "coup de cœur" : "coups de cœur"}
      </span>
    </button>
  );
}
