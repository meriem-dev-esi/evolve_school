
"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  categories: string[];
  technologies: string[];
};

export default function CommunityFilters({
  categories,
  technologies,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(
    key: string,
    value: string,
  ) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`?${params.toString()}`);
  }

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-4">
      <input
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) =>
          updateFilter("q", e.target.value)
        }
        placeholder="Search projects..."
        className="rounded-lg border px-4 py-3 outline-none"
      />

      <select
        value={searchParams.get("category") ?? ""}
        onChange={(e) =>
          updateFilter(
            "category",
            e.target.value,
          )
        }
        className="rounded-lg border px-4 py-3"
      >
        <option value="">All categories</option>

        {categories.map((category) => (
          <option
            key={category}
            value={category}
          >
            {category}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("technology") ?? ""}
        onChange={(e) =>
          updateFilter(
            "technology",
            e.target.value,
          )
        }
        className="rounded-lg border px-4 py-3"
      >
        <option value="">All technologies</option>

        {technologies.map((technology) => (
          <option
            key={technology}
            value={technology}
          >
            {technology}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("sort") ?? "newest"}
        onChange={(e) =>
          updateFilter(
            "sort",
            e.target.value,
          )
        }
        className="rounded-lg border px-4 py-3"
      >
        <option value="newest">
          Newest
        </option>

        <option value="likes">
          Most liked
        </option>
      </select>
    </div>
  );
}
