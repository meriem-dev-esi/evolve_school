"use client";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditLessonPage({
  params,
}: {
  params: Promise<{
    locale: string;
    id: string;
    lessonId: string;
  }>;
}) {
  const locale = useLocale();
  const router = useRouter();

  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [orderIndex, setOrderIndex] = useState(1);
  const [isFree, setIsFree] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadLesson() {
      const { id, lessonId: currentLessonId } = await params;

      setCourseId(id);
      setLessonId(currentLessonId);

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/${locale}/sign-in`);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile || !["teacher", "admin"].includes(profile.role)) {
        setMessage("Access denied.");
        setLoading(false);
        return;
      }

      const { data: lesson, error } = await supabase
        .from("lessons")
        .select(
          "title, description, youtube_url, video_url, duration, order_index, is_free",
        )
        .eq("id", currentLessonId)
        .eq("course_id", id)
        .maybeSingle();

      if (error || !lesson) {
        setMessage("Lesson not found.");
        setLoading(false);
        return;
      }

      setTitle(lesson.title || "");
      setDescription(lesson.description || "");
      setYoutubeUrl(lesson.youtube_url || "");
      setVideoUrl(lesson.video_url || "");
      setDuration(lesson.duration ?? 0);
      setOrderIndex(lesson.order_index ?? 1);
      setIsFree(lesson.is_free ?? false);

      setLoading(false);
    }

    void loadLesson();
  }, [locale, router, params]);

  async function handleSave() {
    if (!lessonId || !courseId || !title.trim()) {
      setMessage("Please enter a lesson title.");
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("lessons")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        youtube_url: youtubeUrl.trim() || null,
        video_url: videoUrl.trim() || null,
        duration,
        order_index: orderIndex,
        is_free: isFree,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lessonId)
      .eq("course_id", courseId);

    if (error) {
      setMessage(`Error: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("Lesson updated successfully.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-black text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-black px-6 py-28 text-white lg:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
          Teacher Dashboard
        </p>

        <h1 className="mt-4 text-4xl font-bold">Edit Lesson</h1>

        <p className="mt-3 text-white/50">
          Update lesson information and video settings.
        </p>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="space-y-5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lesson title"
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 outline-none focus:border-brand"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lesson description"
              rows={5}
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 outline-none focus:border-brand"
            />

            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="YouTube URL"
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 outline-none focus:border-brand"
            />

            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Direct video URL (optional)"
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 outline-none focus:border-brand"
            />

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Duration (seconds)
                </label>

                <input
                  type="number"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Order
                </label>

                <input
                  type="number"
                  min="1"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 outline-none focus:border-brand"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl bg-black p-4">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />

              <span>Free lesson</span>
            </label>
          </div>
        </section>

        {message && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            {message}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() =>
              router.push(`/${locale}/teacher/courses/${courseId}/lessons`)
            }
            className="rounded-full border border-white/10 px-6 py-3 font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-full bg-brand px-7 py-3 font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}
