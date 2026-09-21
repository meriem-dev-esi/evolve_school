import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://evolve-academy.dz";
  const locales = ["fr", "ar", "en"];
  const staticPaths = ["", "/formations", "/ateliers", "/community", "/disciplines"];

  const entries: MetadataRoute.Sitemap = [];

  // Static Localized Routes
  for (const path of staticPaths) {
    for (const locale of locales) {
      const url = `${baseUrl}/${locale}${path}`;
      const alternates: Record<string, string> = {};
      for (const altLocale of locales) {
        alternates[altLocale] = `${baseUrl}/${altLocale}${path}`;
      }

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1.0 : 0.8,
        alternates: {
          languages: alternates,
        },
      });
    }
  }

  // Fetch Published Courses for dynamic sitemap
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: courses } = await supabase
        .from("courses")
        .select("id, updated_at")
        .eq("is_published", true)
        .limit(100);

      if (courses) {
        for (const course of courses) {
          for (const locale of locales) {
            const alternates: Record<string, string> = {};
            for (const altLocale of locales) {
              alternates[altLocale] = `${baseUrl}/${altLocale}/courses/${course.id}`;
            }

            entries.push({
              url: `${baseUrl}/${locale}/courses/${course.id}`,
              lastModified: course.updated_at ? new Date(course.updated_at) : new Date(),
              changeFrequency: "weekly",
              priority: 0.9,
              alternates: {
                languages: alternates,
              },
            });
          }
        }
      }

      // Fetch Community Projects
      const { data: projects } = await supabase
        .from("community_projects")
        .select("id, created_at")
        .limit(50);

      if (projects) {
        for (const project of projects) {
          for (const locale of locales) {
            const alternates: Record<string, string> = {};
            for (const altLocale of locales) {
              alternates[altLocale] = `${baseUrl}/${altLocale}/community/${project.id}`;
            }

            entries.push({
              url: `${baseUrl}/${locale}/community/${project.id}`,
              lastModified: project.created_at ? new Date(project.created_at) : new Date(),
              changeFrequency: "monthly",
              priority: 0.7,
              alternates: {
                languages: alternates,
              },
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("[Sitemap] Could not fetch dynamic entities:", error);
  }

  return entries;
}
