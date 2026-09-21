import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://evolve-academy.dz";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/dashboard",
          "/*/profile",
          "/*/teacher/",
          "/*/messages",
          "/*/courses/*/edit",
          "/*/courses/*/lessons/*/edit",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
