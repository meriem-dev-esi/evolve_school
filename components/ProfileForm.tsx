
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileFormProps = {
  userId: string;
  email: string;
  initialName: string;
  initialAvatar: string;
};

export default function ProfileForm({
  email,
  initialName,
  initialAvatar,
}: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    // Check current authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("CURRENT USER:", user);

    if (!user) {
      setMessage("Error: You are not signed in.");
      setLoading(false);
      return;
    }

    let finalAvatarUrl = avatarUrl;

    // Upload avatar
    if (selectedFile) {
      const fileExtension =
        selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${user.id}/avatar.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, selectedFile, {
          upsert: true,
          contentType: selectedFile.type,
        });

      if (uploadError) {
        console.error("AVATAR UPLOAD ERROR:", uploadError);

        setMessage("Error: " + uploadError.message);
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      finalAvatarUrl = publicUrl;
      setAvatarUrl(publicUrl);
    }

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName.trim(),
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("PROFILE UPDATE ERROR:", error);

      setMessage("Error: " + error.message);
      setLoading(false);
      return;
    }

    setSelectedFile(null);
    setMessage("Profile updated successfully.");
    setLoading(false);
  }

  return (
    <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm text-white/50">
            Email
          </label>

          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white/40"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/50">
            Full Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            disabled={loading}
            placeholder="Your full name"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/50">
            Profile Picture
          </label>

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={loading}
            onChange={(event) => {
              setSelectedFile(event.target.files?.[0] ?? null);
            }}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold file:text-black"
          />

          {selectedFile && (
            <p className="mt-2 text-sm text-white/40">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        {avatarUrl && (
          <div>
            <p className="mb-2 text-sm text-white/50">
              Current Avatar
            </p>

            <img
              src={avatarUrl}
              alt="Profile avatar"
              className="h-24 w-24 rounded-full object-cover"
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            void handleSave();
          }}
          disabled={loading}
          className="rounded-full bg-brand px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {message && (
          <p
            className={
              message.startsWith("Error")
                ? "text-sm text-red-400"
                : "text-sm text-brand"
            }
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

