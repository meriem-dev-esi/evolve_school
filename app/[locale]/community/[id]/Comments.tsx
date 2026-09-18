
"use client";

import { useEffect, useState } from "react";
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
  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);
  const [editingId, setEditingId] =
    useState<string | null>(null);
  const [editingContent, setEditingContent] =
    useState("");

async function loadComments() {
  const { data, error } = await supabase
    .from("community_project_comments")
    .select(`
      id,
      user_id,
      content,
      created_at
    `)
    .eq("project_id", projectId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error("[Comments]", error);
    setLoading(false);
    return;
  }

  const commentList = data ?? [];

  const userIds = [
    ...new Set(
      commentList.map((comment) => comment.user_id),
    ),
  ];

  let profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
  }[] = [];

  if (userIds.length > 0) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select(
        "id, full_name, avatar_url, role",
      )
      .in("id", userIds);

    profiles = profileData ?? [];
  }

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ]),
  );

  const commentsWithProfiles = commentList.map(
    (comment) => ({
      ...comment,
      profile:
        profileMap.get(comment.user_id) ?? null,
    }),
  );

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

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (!content.trim()) return;

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert(
        "You must be signed in to comment.",
      );
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from("community_project_comments")
      .insert({
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
    if (!editingId || !editingContent.trim()) {
      return;
    }

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

  async function deleteComment(
    commentId: string,
  ) {
    const confirmed = window.confirm(
      "Delete this comment?",
    );

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
    <section className="mt-10 border-t pt-8">
      <h2 className="text-2xl font-bold">
        Comments 💬
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mt-5 flex gap-3"
      >
        <input
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          placeholder="Write a comment..."
          className="flex-1 rounded-lg border px-4 py-3 outline-none"
          disabled={submitting}
        />

        <button
          type="submit"
          disabled={
            submitting || !content.trim()
          }
          className="rounded-lg border px-5 py-3 font-medium disabled:opacity-50"
        >
          {submitting
            ? "Posting..."
            : "Post"}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500">
            No comments yet. Be the first to
            comment.
          </p>
        ) : (
          comments.map((comment) => {
            const isOwner =
              comment.user_id === currentUserId;

            const isEditing =
              editingId === comment.id;

            return (
              <div
                key={comment.id}
                className="rounded-xl border p-4"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) =>
                        setEditingContent(
                          e.target.value,
                        )
                      }
                      rows={3}
                      className="w-full rounded-lg border p-3 outline-none"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={
                          !editingContent.trim()
                        }
                        className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="rounded-lg border px-4 py-2 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                 <>
  <div className="flex items-center gap-3">
    {comment.profile?.avatar_url ? (
      <img
        src={comment.profile.avatar_url}
        alt={
          comment.profile.full_name ||
          "User"
        }
        className="h-9 w-9 rounded-full object-cover"
      />
    ) : (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
        👤
      </div>
    )}

    <div>
      <p className="text-sm font-medium">
        {comment.profile?.full_name ||
          "Evolve Member"}
      </p>

      {comment.profile?.role && (
        <p className="text-xs text-gray-500">
          {comment.profile.role}
        </p>
      )}
    </div>
  </div>

  <p className="mt-3">
    {comment.content}
  </p>

  <div className="mt-3 flex items-center gap-3">
                      <p className="text-xs text-gray-500">
                        {new Date(
                          comment.created_at,
                        ).toLocaleString()}
                      </p>

                      {isOwner && (
                        <div className="ml-auto flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(comment)
                            }
                            className="text-xs underline"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteComment(
                                comment.id,
                              )
                            }
                            className="text-xs text-red-600 underline"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
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
