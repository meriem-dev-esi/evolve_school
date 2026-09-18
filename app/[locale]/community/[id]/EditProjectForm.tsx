"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  projectId: string;
  locale: string;
  initialTitle: string;
  initialDescription: string;
  initialCategory: string;
  initialTechnologies: string;
  initialGithubUrl: string;
  initialDemoUrl: string;
  initialImageUrl: string;
};

export default function EditProjectForm({
  projectId,
  locale,
  initialTitle,
  initialDescription,
  initialCategory,
  initialTechnologies,
  initialGithubUrl,
  initialDemoUrl,
  initialImageUrl,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [category, setCategory] = useState(initialCategory);
  const [technologies, setTechnologies] = useState(
    initialTechnologies
  );
  const [githubUrl, setGithubUrl] = useState(initialGithubUrl);
  const [demoUrl, setDemoUrl] = useState(initialDemoUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);

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
      setMessage("You must be signed in.");
      setLoading(false);
      return;
    }

    let finalImageUrl = imageUrl || null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();

      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("community-projects")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("[Image Upload]", uploadError);
        setMessage(uploadError.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from("community-projects")
        .getPublicUrl(filePath);

      finalImageUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("community_projects")
      .update({
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || null,
        technologies: technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        github_url: githubUrl.trim() || null,
        demo_url: demoUrl.trim() || null,
        image_url: finalImageUrl,
      })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) {
      console.error("[Project Update]", error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/community/${projectId}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5"
    >
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium"
        >
          Project Title
        </label>

        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium"
        >
          Description
        </label>

        <textarea
          id="description"
          required
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-medium"
        >
          Category
        </label>

        <input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label
          htmlFor="technologies"
          className="mb-2 block text-sm font-medium"
        >
          Technologies
        </label>

        <input
          id="technologies"
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          placeholder="React, Next.js, Supabase"
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label
          htmlFor="github"
          className="mb-2 block text-sm font-medium"
        >
          GitHub URL
        </label>

        <input
          id="github"
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label
          htmlFor="demo"
          className="mb-2 block text-sm font-medium"
        >
          Live Demo URL
        </label>

        <input
          id="demo"
          type="url"
          value={demoUrl}
          onChange={(e) => setDemoUrl(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label
          htmlFor="project-image"
          className="mb-2 block text-sm font-medium"
        >
          Project Image
        </label>

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Current project"
            className="mb-4 h-48 w-full rounded-lg object-cover"
          />
        )}

        <input
          id="project-image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) =>
            setImageFile(e.target.files?.[0] ?? null)
          }
          className="w-full rounded-lg border p-3"
        />

        {imageFile && (
          <p className="mt-2 text-sm text-gray-500">
            New image: {imageFile.name}
          </p>
        )}
      </div>

      {message && (
        <p className="text-sm text-red-600">
          {message}
        </p>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg border px-5 py-3 font-medium transition hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(
              `/${locale}/community/${projectId}`
            )
          }
          className="rounded-lg border px-5 py-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}