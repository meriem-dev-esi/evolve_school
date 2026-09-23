"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const categories = [
  "Web Development",
  "Mobile Development",
  "AI & Machine Learning",
  "Data Science",
  "Cybersecurity",
  "Design",
  "Business",
  "Marketing",
];

const levels = ["Beginner", "Intermediate", "Advanced"];

const difficulties = ["Easy", "Medium", "Hard"];

const formats = ["Video", "Reading", "Practice", "Mixed"];

const languages = ["Arabic", "French", "English"];

export default function LearningPreferencesForm() {
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [format, setFormat] = useState("");
  const [language, setLanguage] = useState("");
  const [learningTime, setLearningTime] = useState("");

  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  useEffect(() => {
    let cancelled = false;

    const loadPreferences = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_learning_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[Evolve] Error loading preferences:", error);

        if (!cancelled) {
          setMessage(error.message);
          setMessageType("error");
        }
      }

      if (data && !cancelled) {
        setGoal(data.learning_goal ?? "");
        setLevel(data.current_level ?? "");
        setCategory(data.preferred_category ?? "");
        setDifficulty(data.preferred_difficulty ?? "");
        setFormat(data.preferred_learning_format ?? "");
        setLanguage(data.preferred_language ?? "");
        setLearningTime(data.learning_time ?? "");

        setInterests(Array.isArray(data.interests) ? data.interests : []);

        setSkills(Array.isArray(data.skills) ? data.skills : []);
      }

      if (!cancelled) {
        setLoading(false);
      }
    };

    void loadPreferences();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleInterest = (interest: string) => {
    setInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }

      return [...current, interest];
    });
  };

  const savePreferences = async () => {
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You must be logged in.");
        setMessageType("error");
        return;
      }

      const preferences = {
        user_id: user.id,
        learning_goal: goal.trim(),
        current_level: level || null,
        preferred_category: category || null,
        interests,
        skills,
        preferred_difficulty: difficulty || null,
        preferred_learning_format: format || null,
        learning_time: learningTime.trim(),
        preferred_language: language || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_learning_preferences")
        .upsert(preferences, {
          onConflict: "user_id",
        })
        .select(
          `
            user_id,
            learning_goal,
            current_level,
            preferred_category,
            interests,
            skills,
            preferred_difficulty,
            preferred_learning_format,
            learning_time,
            preferred_language,
            updated_at
          `,
        )
        .single();

      if (error) {
        console.error("[Evolve] Error saving preferences:", error);

        setMessage(`Could not save preferences: ${error.message}`);
        setMessageType("error");
        return;
      }

      // Verify that Supabase actually returned the saved row.
      if (!data || data.user_id !== user.id) {
        setMessage(
          "The preferences were not saved. Please check your account permissions.",
        );
        setMessageType("error");
        return;
      }

      setMessage("Preferences saved successfully.");
      setMessageType("success");
    } catch (error) {
      console.error("[Evolve] Unexpected preferences error:", error);

      setMessage("Something went wrong while saving your preferences.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-brand" />

        <p className="mt-4 text-sm text-white/50">
          Loading your preferences...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <div className="space-y-8">
        {/* Learning goal */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            What is your learning goal?
          </label>

          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Example: Become a full-stack developer"
            disabled={saving}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 transition focus:border-brand/60 focus:ring-1 focus:ring-brand/30 disabled:opacity-50"
          />
        </div>

        {/* Level + category */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Current level
            </label>

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={saving}
              className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-brand/60 disabled:opacity-50"
            >
              <option value="">Select your level</option>

              {levels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Preferred category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={saving}
              className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-brand/60 disabled:opacity-50"
            >
              <option value="">Select a category</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interests */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-white/80">
                Interests
              </label>

              <p className="mt-1 text-xs text-white/35">
                Select all topics you are interested in.
              </p>
            </div>

            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
              {interests.length} selected
            </span>
          </div>

          <div className="interest-scrollbar max-h-60 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.map((item) => {
                const selected = interests.includes(item);

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    disabled={saving}
                    aria-pressed={selected}
                    className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                      selected
                        ? "border-brand/60 bg-brand/10 text-brand"
                        : "border-white/10 bg-white/[0.02] text-white/65 hover:border-white/25 hover:bg-white/[0.05]"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                        selected
                          ? "border-brand bg-brand text-black"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {selected ? "✓" : ""}
                    </span>

                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Skills
          </label>

          <input
            type="text"
            value={skills.join(", ")}
            onChange={(e) => {
              setSkills(
                e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              );
            }}
            disabled={saving}
            placeholder="Example: JavaScript, Python, SQL"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 transition focus:border-brand/60 focus:ring-1 focus:ring-brand/30 disabled:opacity-50"
          />

          <p className="mt-2 text-xs text-white/30">
            Separate multiple skills with commas.
          </p>
        </div>

        {/* Difficulty + format */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Preferred difficulty
            </label>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={saving}
              className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-brand/60 disabled:opacity-50"
            >
              <option value="">Select difficulty</option>

              {difficulties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Preferred learning format
            </label>

            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              disabled={saving}
              className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-brand/60 disabled:opacity-50"
            >
              <option value="">Select format</option>

              {formats.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Learning time + language */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Available learning time
            </label>

            <input
              type="text"
              value={learningTime}
              onChange={(e) => setLearningTime(e.target.value)}
              disabled={saving}
              placeholder="Example: 1 hour per day"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 transition focus:border-brand/60 focus:ring-1 focus:ring-brand/30 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Preferred language
            </label>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={saving}
              className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-brand/60 disabled:opacity-50"
            >
              <option value="">Select language</option>

              {languages.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Save */}
        <div className="border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={() => {
              void savePreferences();
            }}
            disabled={saving}
            className="w-full rounded-2xl bg-brand px-6 py-3.5 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving preferences..." : "Save preferences"}
          </button>

          {message && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-center text-sm ${
                messageType === "success"
                  ? "border-brand/20 bg-brand/10 text-brand"
                  : "border-red-500/20 bg-red-500/10 text-red-400"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Visible scrollbar */}
      <style jsx>{`
        .interest-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3)
            rgba(255, 255, 255, 0.05);
        }

        .interest-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .interest-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 999px;
        }

        .interest-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 999px;
        }

        .interest-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
