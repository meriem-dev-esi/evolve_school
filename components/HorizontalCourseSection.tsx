"use client";

import { useRef } from "react";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import LockedCourseCard from "@/components/LockedCourseCard";
import {
  Sparkles,
  TrendingUp,
  Flame,
  Award,
  Clock,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Layers,
  Search,
} from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  level: string | null;
  domain: string | null;
  practice_percentage: number | null;
  reasons?: string[];
};

type Props = {
  title: string;
  courses: Course[];
  locale: string;
  href?: string;
  locked?: boolean;
};

export default function HorizontalCourseSection({
  title,
  courses,
  locale,
  href,
  locked = false,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const getSectionIcon = (heading: string) => {
    const lower = heading.toLowerCase();
    if (lower.includes("recommended") || lower.includes("pour vous")) return <Sparkles className="h-5 w-5 text-brand" />;
    if (lower.includes("trending") || lower.includes("tendance")) return <Flame className="h-5 w-5 text-rose-400" />;
    if (lower.includes("beginner") || lower.includes("débutant")) return <GraduationCap className="h-5 w-5 text-sky-400" />;
    if (lower.includes("partner") || lower.includes("partenaire")) return <Layers className="h-5 w-5 text-emerald-400" />;
    if (lower.includes("exclusive") || lower.includes("exclusif")) return <Award className="h-5 w-5 text-amber-400" />;
    if (lower.includes("soon") || lower.includes("bientôt")) return <Clock className="h-5 w-5 text-purple-400" />;
    if (lower.includes("watchlist") || lower.includes("favoris")) return <Bookmark className="h-5 w-5 text-brand" />;
    if (lower.includes("searched") || lower.includes("recherché")) return <Search className="h-5 w-5 text-cyan-400" />;
    return <TrendingUp className="h-5 w-5 text-brand" />;
  };

  return (
    <section className="w-full px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              {getSectionIcon(title)}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                  {title}
                </h2>
                {!locked && courses.length > 0 && (
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/60">
                    {courses.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {href && (
              <Link
                href={href}
                className="group flex items-center gap-1.5 text-xs font-semibold text-white/60 transition hover:text-brand"
              >
                <span>Voir tout</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            )}

            {/* Desktop Left/Right Scroll Arrows */}
            <div className="hidden items-center gap-1.5 sm:flex">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-brand/40 hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-brand/40 hover:bg-white/10 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Courses Horizontal List */}
        <div
          ref={scrollContainerRef}
          className="flex w-full gap-5 overflow-x-auto pb-4 scroll-smooth"
        >
          {locked ? (
            <>
              <LockedCourseCard locale={locale} />
              <LockedCourseCard locale={locale} />
              <LockedCourseCard locale={locale} />
              <LockedCourseCard locale={locale} />
            </>
          ) : courses.length === 0 ? (
            <div className="flex h-36 w-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-xs text-white/40">
              Aucune formation disponible pour le moment dans cette section.
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="min-w-[290px] shrink-0">
                <CourseCard course={course} locale={locale} />

                {/* Reason tags if available */}
                {course.reasons && course.reasons.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {course.reasons.slice(0, 2).map((reason) => (
                      <span
                        key={reason}
                        className="rounded-full border border-brand/20 bg-brand/10 px-2.5 py-0.5 text-[10px] font-semibold text-brand"
                      >
                        ✓ {reason}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}