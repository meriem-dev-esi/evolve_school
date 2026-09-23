"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileFormProps = {
  userId: string;
  email: string;
  initialName: string;
  initialAvatar: string;
};

export default function ProfileForm({
  userId,
  email,
  initialName,
  initialAvatar,
}: ProfileFormProps) {
const _router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");

  useEffect(() => {
    setFullName(initialName);
    setAvatarUrl(initialAvatar);
  }, [initialName, initialAvatar]);

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();

      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(authError.message);
      }

      if (!user) {
        throw new Error("You are not signed in.");
      }

      // Make sure this is the correct profile
      if (user.id !== userId) {
        throw new Error(
          "Your session does not match this profile.",
        );
      }

      const cleanName = fullName.trim();

      if (!cleanName) {
        throw new Error(
          "Please enter your full name.",
        );
      }

      let finalAvatarUrl = avatarUrl;

      // Upload new avatar
      if (selectedFile) {
        if (selectedFile.size > 5 * 1024 * 1024) {
          throw new Error(
            "Profile picture must be smaller than 5 MB.",
          );
        }

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
          throw new Error(
            "Only JPG, PNG, and WebP images are allowed.",
          );
        }

        const extension =
          selectedFile.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const filePath =
          `${user.id}/avatar.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("avatars")
            .upload(filePath, selectedFile, {
              upsert: true,
              contentType: selectedFile.type,
            });

        if (uploadError) {
          throw new Error(
            `Avatar upload failed: ${uploadError.message}`,
          );
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        finalAvatarUrl = publicUrl;
      }

      // Update profile and immediately return
      // the updated row.
      const { data: savedProfile, error: updateError } =
        await supabase
          .from("profiles")
          .update({
            full_name: cleanName,
            avatar_url: finalAvatarUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
          .select("id, full_name, avatar_url")
          .single();

      if (updateError) {
        throw new Error(
          `Profile update failed: ${updateError.message}`,
        );
      }

      if (!savedProfile) {
        throw new Error(
          "No profile was updated.",
        );
      }

      // Update local UI using the actual database result.
      setFullName(savedProfile.full_name ?? "");
      setAvatarUrl(
        savedProfile.avatar_url ?? "",
      );
      setSelectedFile(null);

      setMessageType("success");
      setMessage(
        "Your profile has been updated successfully.",
      );
    } catch (error) {
      console.error(
        "[Evolve] Profile save error:",
        error,
      );

      setMessageType("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="grid gap-8 md:grid-cols-[180px_1fr]">

          {/* Avatar */}
          <div className="flex flex-col items-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile avatar"
                className="h-32 w-32 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-brand text-4xl font-bold text-black">
                {fullName
                  .trim()
                  .charAt(0)
                  .toUpperCase() || "U"}
              </div>
            )}

            <label
              className={`mt-5 cursor-pointer rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium transition ${
                saving
                  ? "cursor-not-allowed opacity-50"
                  : "hover:border-brand hover:text-brand"
              }`}
            >
              Change photo

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={saving}
                className="hidden"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0] ?? null;

                  setSelectedFile(file);
                  setMessage("");
                }}
              />
            </label>

            {selectedFile && (
              <p className="mt-3 max-w-[160px] truncate text-center text-xs text-white/40">
                {selectedFile.name}
              </p>
            )}

            <p className="mt-2 text-center text-xs text-white/25">
              JPG, PNG or WebP
              <br />
              Maximum 5 MB
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-6">

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Email address
              </label>

              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white/40 outline-none"
              />

              <p className="mt-2 text-xs text-white/25">
                Your email is managed by your Evolve account.
              </p>
            </div>

            {/* Full name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Full name
              </label>

              <input
                type="text"
                value={fullName}
                disabled={saving}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Enter your full name"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 transition focus:border-brand/60 focus:ring-1 focus:ring-brand/30 disabled:opacity-50"
              />
            </div>

            {/* Save */}
            <button
              type="button"
              onClick={() => {
                void handleSave();
              }}
              disabled={saving}
              className="w-full rounded-2xl bg-brand px-6 py-3.5 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {saving
                ? "Saving..."
                : "Save changes"}
            </button>

            {/* Message */}
            {message && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
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
      </div>
    </section>
  );
}