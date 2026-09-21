"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  Trash2,
  Pencil,
  Clock,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null;
};

type Props = {
  projectId: string;
};

export default function Comments({ projectId }: Props) {
  const supabase = createClient();

  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  async function loadComments() {
    const { data, error } = await supabase
      .from("community_project_comments")
      .select("id, user_id, content, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[Comments]", error);
      setLoading(false);
      return;
    }

    const commentList = data ?? [];
    const userIds = [...new Set(commentList.map((c) => c.user_id))];

    let profiles: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
      role: string | null;
    }[] = [];

    if (userIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .in("id", userIds);

      profiles = profileData ?? [];
    }

    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    const commentsWithProfiles = commentList.map((c) => ({
      ...c,
      profile: profileMap.get(c.user_id) ?? null,
    }));

    setComments(commentsWithProfiles);
    setLoading(false);
  }

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUserId(user?.id ?? null);
  }

  useEffect(() => {
    loadComments();
    loadUser();
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Connectez-vous pour participer à la discussion.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("community_project_comments").insert({
      project_id: projectId,
      user_id: user.id,
      content: content.trim(),
    });

    if (error) {
      console.error("[Comments]", error);
      setSubmitting(false);
      return;
    }

    setContent("");
    await loadComments();
    setSubmitting(false);
  }

  function startEditing(comment: Comment) {
    setEditingId(comment.id);
    setEditingContent(comment.content);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingContent("");
  }

  async function saveEdit() {
    if (!editingId || !editingContent.trim()) return;

    const { error } = await supabase
      .from("community_project_comments")
      .update({
        content: editingContent.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingId)
      .eq("user_id", currentUserId);

    if (error) {
      console.error("[Comments]", error);
      return;
    }

    cancelEditing();
    await loadComments();
  }

  async function deleteComment(commentId: string) {
    const confirmed = window.confirm("Supprimer ce commentaire ?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("community_project_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", currentUserId);

    if (error) {
      console.error("[Comments]", error);
      return;
    }

    await loadComments();
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Commentaires & Retours
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-mono font-normal text-brand">
                {comments.length}
              </span>
            </h2>
            <p className="text-xs text-white/50">
              Partagez vos impressions et suggestions constructives.
            </p>
          </div>
        </div>
      </div>

      {/* Input composer */}
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-2 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/40 transition">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écrivez un message ou posez une question sur le projet..."
            rows={3}
            disabled={submitting}
            className="w-full resize-none bg-transparent px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none"
          />

          <div className="flex items-center justify-between border-t border-white/5 pt-2 px-2">
            <span className="text-[11px] text-white/40 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-brand" />
              Markdown & retours bienveillants encouragés
            </span>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2 text-xs font-bold text-black transition-all hover:opacity-90 disabled:opacity-40 active:scale-95 shadow-md shadow-brand/15"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Publication...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Commenter
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Comment list */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-white/40 gap-2 text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            Chargement des discussions...
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-10 text-center">
            <p className="text-sm font-medium text-white/70">
              Aucun retour pour l'instant
            </p>
            <p className="mt-1 text-xs text-white/40">
              Soyez le premier à féliciter l'auteur ou à poser une question !
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner = comment.user_id === currentUserId;
            const isEditing = editingId === comment.id;

            return (
              <div
                key={comment.id}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md transition-all hover:border-white/20"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-brand/50 bg-zinc-900 p-3 text-sm text-white focus:outline-none"
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 transition"
                      >
                        <X className="h-3 w-3" /> Annuler
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={!editingContent.trim()}
                        className="rounded-lg bg-brand px-4 py-1.5 text-xs font-bold text-black hover:opacity-90 disabled:opacity-40 transition"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {comment.profile?.avatar_url ? (
                          <img
                            src={comment.profile.avatar_url}
                            alt={comment.profile.full_name || "Membre"}
                            className="h-9 w-9 rounded-full object-cover border border-white/15 shadow-sm"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand border border-brand/30">
                            {(comment.profile?.full_name || "E").charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {comment.profile?.full_name || "Membre Evolve"}
                            </span>
                            {comment.profile?.role && (
                              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
                                {comment.profile.role}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-white/40 mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(comment.created_at).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isOwner && (
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            type="button"
                            onClick={() => startEditing(comment)}
                            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
                            title="Modifier"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteComment(comment.id)}
                            className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-white/80 whitespace-pre-wrap pl-12">
                      {comment.content}
                    </p>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
