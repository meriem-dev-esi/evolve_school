
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  locale: string;
};

export default function SubmitProjectForm({ locale }: Props) {
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage(
        "You must be signed in to publish a project.",
      );
      setLoading(false);
      return;
    }

    let imageUrl: string | null = null;

    // Upload project image
    if (imageFile) {
      const fileExt =
        imageFile.name.split(".").pop();

      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("community-projects")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        console.error(
          "[Image Upload]",
          uploadError,
        );

        setMessage(uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("community-projects")
          .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("community_projects")
      .insert({
        user_id: user.id,
        title,
        description,
        category: category || null,
        technologies: technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        github_url: githubUrl || null,
        demo_url: demoUrl || null,
        image_url: imageUrl,
      });

    if (error) {
      console.error(
        "[Project Create]",
        error,
      );

      setMessage(error.message);
      setLoading(false);
      return;
    }

    setTitle("");
    setDescription("");
    setCategory("");
    setTechnologies("");
    setGithubUrl("");
    setDemoUrl("");
    setImageFile(null);

    setMessage(
      "Project published successfully.",
    );

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        required
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        placeholder="Project title"
        className="w-full rounded-lg border p-3"
      />

      <textarea
        required
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
        placeholder="Project description"
        rows={5}
        className="w-full rounded-lg border p-3"
      />

      <input
        value={category}
        onChange={(e) =>
          setCategory(e.target.value)
        }
        placeholder="Category"
        className="w-full rounded-lg border p-3"
      />

      <input
        value={technologies}
        onChange={(e) =>
          setTechnologies(e.target.value)
        }
        placeholder="Technologies (React, Next.js, Supabase)"
        className="w-full rounded-lg border p-3"
      />

      <input
        type="url"
        value={githubUrl}
        onChange={(e) =>
          setGithubUrl(e.target.value)
        }
        placeholder="GitHub URL"
        className="w-full rounded-lg border p-3"
      />

      <input
        type="url"
        value={demoUrl}
        onChange={(e) =>
          setDemoUrl(e.target.value)
        }
        placeholder="Live Demo URL"
        className="w-full rounded-lg border p-3"
      />

      <div>
        <label
          htmlFor="project-image"
          className="mb-2 block text-sm font-medium"
        >
          Project Image
        </label>

        <input
          id="project-image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) =>
            setImageFile(
              e.target.files?.[0] ?? null,
            )
          }
          className="w-full rounded-lg border p-3"
        />

        {imageFile && (
          <p className="mt-2 text-sm text-gray-500">
            Selected: {imageFile.name}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg px-5 py-3 font-medium transition disabled:opacity-50"
      >
        {loading
          ? "Publishing..."
          : "Publish Project"}
      </button>

      {message && (
        <p className="text-sm">
          {message}
        </p>
      )}
    </form>
  );
}
