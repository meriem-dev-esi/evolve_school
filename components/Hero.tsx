"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  ArrowRight,
  Clock,
  Award,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle2,
} from "lucide-react";
import EarthGlobe from "@/components/EarthGlobe";

type Course = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number;
  duration: string | null;
  level: string | null;
  type: string | null;
};

export default function Hero() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const locale = useLocale();

  // ─────────────────────────────────────────────
  // LOAD COURSES
  // ─────────────────────────────────────────────

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();

        const { data, error } = await supabase
          .from("courses")
          .select(
            "id, title, description, image_url, price, duration, level, type"
          )
          .eq("is_published", true)
          .limit(5);

        if (error) {
          console.error("Error loading courses:", error);
          setError(error.message);
          return;
        }

        setCourses((data ?? []) as Course[]);
      } catch (err) {
        console.error("Unexpected error loading courses:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load courses."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadCourses();
  }, []);

  // ─────────────────────────────────────────────
  // AUTO CAROUSEL
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (courses.length <= 1) return;

    const interval = setInterval(() => {
      setActive((current) => (current + 1) % courses.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [courses.length]);

  // ─────────────────────────────────────────────
  // CAROUSEL CONTROLS
  // ─────────────────────────────────────────────

  const handlePrev = () => {
    if (courses.length === 0) return;

    setActive((current) =>
      current === 0 ? courses.length - 1 : current - 1
    );
  };

  const handleNext = () => {
    if (courses.length === 0) return;

    setActive((current) => (current + 1) % courses.length);
  };

  // ─────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────

  if (loading) {
    return (
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-transparent text-white">
        <div className="absolute inset-0 bg-radial-hero opacity-40" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 animate-ping rounded-full border-4 border-white/20" />

            <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/10 border-t-white" />
          </div>

          <p className="text-xs font-medium uppercase tracking-widest text-white/50">
            Chargement des formations d&apos;élite...
          </p>
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────

  if (error) {
    return (
      <section className="relative flex min-h-[90vh] items-center justify-center bg-transparent px-6 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 text-rose-400">
            !
          </div>

          <h2 className="mt-4 text-xl font-bold text-white">
            Impossible de charger les formations
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/50">
            Une erreur réseau est survenue. Veuillez rafraîchir la page.
          </p>
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────
  // FALLBACK COURSE
  // ─────────────────────────────────────────────

  const activeCourse: Course = courses[active] ?? {
    id: "default-course",
    title: "Maîtrisez les Compétences du Futur",
    description:
      "Formations d'élite en UI/UX Design, Développement Web Fullstack et Technologies Créatives conçues pour le marché algérien et international.",
    image_url: null,
    price: 15000,
    duration: "8 Semaines",
    level: "Tous Niveaux",
    type: "FORMATION DIPLÔMANTE",
  };

  // ─────────────────────────────────────────────
  // HERO
  // ─────────────────────────────────────────────

  return (
    <section className="relative flex min-h-[94vh] items-center overflow-hidden bg-transparent pb-14 pt-24 text-white">
      {/* Background grid texture */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-20" />

      {/* Main container */}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">

          {/* LEFT COLUMN */}

          <div className="lg:col-span-7">

            {/* Category */}

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                ✦ FORMATION CERTIFIANTE
              </span>

              {activeCourse.type && (
                <span className="text-xs font-medium uppercase tracking-widest text-white/40">
                  {activeCourse.type}
                </span>
              )}
            </div>

            {/* Title */}

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {activeCourse.title}
            </h1>

            {/* Description */}

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
              {activeCourse.description ||
                "Apprenez directement auprès d'experts du domaine avec des projets concrets, du mentorat en direct et une certification reconnue."}
            </p>

            {/* Metadata */}

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-medium">

              {activeCourse.level && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-white/70">
                  <Award className="h-3.5 w-3.5 text-white/70" />
                  {activeCourse.level}
                </span>
              )}

              {activeCourse.duration && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-white/70">
                  <Clock className="h-3.5 w-3.5 text-sky-400" />
                  {activeCourse.duration}
                </span>
              )}

              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-bold text-white">
                {activeCourse.price && activeCourse.price > 0
                  ? `${activeCourse.price.toLocaleString("fr-DZ")} DA`
                  : "Gratuit"}
              </span>
            </div>

            {/* CTA */}

            <div className="mt-8 flex flex-wrap items-center gap-4">

              <Link
                href={`/${locale}/courses/${activeCourse.id}`}
                className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-white/90 hover:shadow-xl hover:shadow-white/10 active:scale-95"
              >
                <span>Commencer maintenant</span>

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href={`/${locale}/formations`}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-white/80 transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <Play className="h-4 w-4 text-white/40" />

                <span>Voir le catalogue</span>
              </Link>
            </div>

            {/* Social proof */}

            <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-white/10 pt-6 text-xs text-white/45">

              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <span className="inline-block h-6 w-6 rounded-full border-2 border-[#0b0b0b] bg-white/20 text-center text-[10px] font-bold leading-6 text-white">
                    A
                  </span>

                  <span className="inline-block h-6 w-6 rounded-full border-2 border-[#0b0b0b] bg-white/30 text-center text-[10px] font-bold leading-6 text-white">
                    M
                  </span>

                  <span className="inline-block h-6 w-6 rounded-full border-2 border-[#0b0b0b] bg-white/40 text-center text-[10px] font-bold leading-6 text-white">
                    Y
                  </span>
                </div>

                <span className="font-medium text-white/70">
                  +5 000 Apprenants
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

                <span className="font-semibold text-white/80">
                  4.9 / 5
                </span>

                <span>(1,200+ avis vérifiés)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-white/80" />

                <span>100% Pratique &amp; Ateliers</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — EARTH */}

          <div className="relative flex items-center justify-center lg:col-span-5">
            <div className="relative h-[420px] w-full sm:h-[500px]">
              <EarthGlobe />
            </div>
          </div>
        </div>

        {/* CAROUSEL NAVIGATION */}

        {courses.length > 1 && (
          <div className="mt-14 flex items-center justify-between border-t border-white/10 pt-6">

            {/* Indicators */}

            <div className="flex items-center gap-2.5">
              {courses.map((course, index) => (
                <button
                  key={course.id}
                  type="button"
                  aria-label={`Slide ${index + 1}`}
                  onClick={() => setActive(index)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index === active
                      ? "w-10 bg-white shadow-sm"
                      : "w-2.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            {/* Arrows */}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous slide"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next slide"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}