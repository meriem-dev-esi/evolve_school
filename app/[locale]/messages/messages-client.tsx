"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type CourseTeacher = {
  courseId: string;
  courseTitle: string;
  teacherId: string;
  teacherName: string;
};

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function MessagesClient({
  courseTeachers,
  initialCourseId,
}: {
  courseTeachers: CourseTeacher[];
  initialCourseId: string | null;
}) {
  const locale = useLocale();
  const supabase = useMemo(() => createClient(), []);
  const [selectedKey, setSelectedKey] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = courseTeachers.find(
    (item) => `${item.courseId}:${item.teacherId}` === selectedKey,
  );

  const loadMessages = useCallback(
    async (id: string) => {
      const { data, error: queryError } = await supabase
        .from("course_messages")
        .select("id, sender_id, body, created_at")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (queryError) throw queryError;
      setMessages((data ?? []) as Message[]);
    },
    [supabase],
  );

  useEffect(() => {
    if (courseTeachers.length === 0) {
      setLoading(false);
      return;
    }
    if (!selectedKey) {
      const initial =
        courseTeachers.find((item) => item.courseId === initialCourseId) ??
        courseTeachers[0];
      if (!initial) return;
      setSelectedKey(`${initial.courseId}:${initial.teacherId}`);
    }
  }, [courseTeachers, initialCourseId, selectedKey]);

  useEffect(() => {
    if (!selected) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setConversationId(null);
    setMessages([]);

    void (async () => {
      const { data, error: queryError } = await supabase
        .from("course_conversations")
        .select("id")
        .eq("course_id", selected.courseId)
        .eq("teacher_id", selected.teacherId)
        .maybeSingle();

      if (queryError) throw queryError;
      if (cancelled) return;

      const id = data?.id ? String(data.id) : null;
      setConversationId(id);
      if (id) await loadMessages(id);
      if (!cancelled) setLoading(false);
    })().catch((reason: unknown) => {
      if (cancelled) return;
      setError(
        reason instanceof Error ? reason.message : "Could not load messages.",
      );
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [loadMessages, selected, supabase]);

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`course-messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "course_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          void loadMessages(conversationId).catch((reason: unknown) => {
            setError(
              reason instanceof Error
                ? reason.message
                : "Could not refresh messages.",
            );
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, loadMessages, supabase]);

  async function sendMessage() {
    const body = draft.trim();
    if (!selected || !body || sending) return;

    setSending(true);
    setError(null);
    try {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!currentUser)
        throw new Error("Please sign in again to send a message.");

      let activeConversationId = conversationId;
      if (!activeConversationId) {
        const { data, error: insertError } = await supabase
          .from("course_conversations")
          .insert({
            course_id: selected.courseId,
            student_id: currentUser.id,
            teacher_id: selected.teacherId,
          })
          .select("id")
          .single();
        if (insertError) throw insertError;
        activeConversationId = String(data.id);
        setConversationId(activeConversationId);
      }

      const { error: sendError } = await supabase
        .from("course_messages")
        .insert({
          conversation_id: activeConversationId,
          sender_id: currentUser.id,
          body,
        });
      if (sendError) throw sendError;

      setDraft("");
      await loadMessages(activeConversationId);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not send your message.",
      );
    } finally {
      setSending(false);
    }
  }

  if (courseTeachers.length === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-white/60">
        You need a paid course enrollment with an assigned teacher before you
        can send a message.
        <Link
          href={`/${locale}/dashboard`}
          className="ml-2 text-brand underline"
        >
          Go to your dashboard
        </Link>
      </div>
    );
  }

  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <div className="border-b border-white/10 p-5">
        <label
          htmlFor="course-teacher"
          className="mb-2 block text-sm text-white/60"
        >
          Course and teacher
        </label>
        <select
          id="course-teacher"
          value={selectedKey}
          onChange={(event) => setSelectedKey(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
        >
          {courseTeachers.map((item) => {
            const key = `${item.courseId}:${item.teacherId}`;
            return (
              <option key={key} value={key}>
                {item.courseTitle} — {item.teacherName}
              </option>
            );
          })}
        </select>
      </div>

      {selected && (
        <div className="flex min-h-[28rem] flex-col">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-semibold">{selected.teacherName}</h2>
            <p className="text-sm text-white/50">{selected.courseTitle}</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {loading ? (
              <p className="text-white/50">Loading messages…</p>
            ) : messages.length === 0 ? (
              <p className="text-white/50">
                Start the conversation with your teacher.
              </p>
            ) : (
              messages.map((message) => {
                const ownMessage = message.sender_id !== selected.teacherId;
                return (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      ownMessage
                        ? "ml-auto bg-brand text-black"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.body}
                    </p>
                    <time className="mt-2 block text-xs opacity-60">
                      {new Date(message.created_at).toLocaleString()}
                    </time>
                  </div>
                );
              })
            )}
          </div>

          {error && (
            <p role="alert" className="px-5 text-sm text-red-400">
              {error}
            </p>
          )}
          <form
            className="flex gap-3 border-t border-white/10 p-5"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={4000}
              rows={2}
              placeholder="Write a message..."
              aria-label="Write a message"
              className="min-w-0 flex-1 resize-y rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="self-end rounded-full bg-brand px-6 py-3 font-semibold text-black disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
