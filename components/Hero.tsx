"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useLocale } from "next-intl";

type Course = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number;
  duration: string | null;
  level: string | null;
  type: string | null;
  hero_category: "new" | "upcoming" | "discover" | "trending" | null;
};



export default function Hero() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [active, setActive] = useState(0);
const locale = useLocale();
  useEffect(() => {
    async function loadCourses() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("courses")
        .select(
  "id, title, description, image_url, price, duration, level, type, hero_category",
)
        .eq("is_published", true)
        .limit(4);

      if (error) {
        console.error("Error loading courses:", error);
        return;
      }

      console.log("COURSES FROM SUPABASE:", data);
      setCourses(data ?? []);
    }

    loadCourses();
  }, []);

  useEffect(() => {
    if (courses.length <= 1) return;

    const interval = setInterval(() => {
      setActive((current) => (current + 1) % courses.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [courses.length]);

  if (courses.length === 0) {
    return (
      <section className="flex min-h-dvh items-center justify-center bg-canvas text-white">
        <p className="text-white/60">No formations available yet.</p>
      </section>
    );
  }

  return (
    <section className="relative min-h-dvh overflow-hidden">
      {courses.map((course, index) => {
 const heroColor =
  course.hero_category === "new"
    ? "#000000"
    : course.hero_category === "upcoming"
      ? "#51C9EC"
      : course.hero_category === "discover"
        ? "#FACD12"
        : course.hero_category === "trending"
          ? "#EA356E"
          : "#000000";
        return (
          <div
            key={course.id}
            className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
                
              index === active
                ? "translate-x-0"
                : index < active
                  ? "-translate-x-full"
                  : "translate-x-full"
            }`}
            style={{ backgroundColor: heroColor }}
          >
            <div className="mx-auto grid min-h-dvh w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pt-24 lg:grid-cols-2 lg:px-10">
              <div className="text-white">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em]">
                  {course.type ?? "FORMATION"}
                </p>

                <h1 className="text-5xl font-bold leading-tight md:text-7xl">
                  {course.title}
                </h1>

                {course.description && (
                  <p className="mt-6 max-w-xl text-lg leading-8 text-white/85 md:text-xl">
                    {course.description}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  {course.level && (
                    <span className="rounded-pill bg-white/15 px-4 py-2">
                      {course.level}
                    </span>
                  )}

                  {course.duration && (
                    <span className="rounded-pill bg-white/15 px-4 py-2">
                      {course.duration}
                    </span>
                  )}

                  <span className="rounded-pill bg-white/15 px-4 py-2">
                    {course.price.toLocaleString("fr-DZ")} DA
                  </span>
                </div>

                <div className="mt-8 flex gap-4">
                 <Link
  href={`/${locale}/courses/${course.id}`}
  className="rounded-pill bg-white px-7 py-3.5 font-semibold text-black transition-transform hover:scale-105"
>
  Commencer
</Link>

                  <button
                    type="button"
                    className="rounded-pill border border-white/50 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Save
                  </button>
                </div>
              </div>

              {course.image_url ? (
                <div className="flex justify-center lg:justify-end">
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="max-h-[520px] w-full max-w-xl rounded-3xl object-cover shadow-2xl"
                  />
                </div>
              ) : (
                <div className="hidden lg:block" />
              )}
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 gap-2">
        {courses.map((course, index) => (
          <button
            key={course.id}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setActive(index)}
            className={`h-2 rounded-pill transition-all ${
              index === active
                ? "w-10 bg-white"
                : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}