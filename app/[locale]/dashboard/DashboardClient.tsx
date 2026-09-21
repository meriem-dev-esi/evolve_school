"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  ArrowRight,
  Search,
  Sparkles,
  Play,
  Share2,
  Printer,
  X,
  MessageSquare,
  GraduationCap,
  Calendar,
  Layers,
  ChevronRight,
  Zap,
} from "lucide-react";

export interface EnrolledCourseItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  domain?: string | null;
  level?: string | null;
  duration?: string | null;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  isCompleted: boolean;
  nextLesson?: {
    id: string;
    title: string;
    order_index: number;
  } | null;
}

export interface WorkshopItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  duration: string | null;
  level: string | null;
  domain: string | null;
  price: number;
}

export interface UserStats {
  totalCourses: number;
  inProgressCount: number;
  completedCount: number;
  totalLessonsCompleted: number;
  totalHoursEstimated: number;
  streakDays: number;
  certificatesEarned: number;
}

interface DashboardClientProps {
  locale: string;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  userRole?: string | null;
  stats: UserStats;
  enrolledCourses: EnrolledCourseItem[];
  recommendedCourses: EnrolledCourseItem[];
  upcomingWorkshops: WorkshopItem[];
}

export default function DashboardClient({
  locale,
  userName,
  userEmail,
  userAvatar,
  userRole,
  stats,
  enrolledCourses,
  recommendedCourses,
  upcomingWorkshops,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "in_progress" | "completed" | "workshops">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [certificateCourse, setCertificateCourse] = useState<EnrolledCourseItem | null>(null);

  // Filter courses based on tab and search query
  const filteredCourses = enrolledCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.domain && course.domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "in_progress") {
      return !course.isCompleted;
    }
    if (activeTab === "completed") {
      return course.isCompleted;
    }
    return true;
  });

  // Find the top priority course to resume
  const resumeCourse = enrolledCourses.find((c) => !c.isCompleted && c.nextLesson) || enrolledCourses[0];

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-10">
      {/* 1. STUDENT HERO WELCOME BANNER */}
      <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-violet-100 blur-3xl pointer-events-none opacity-60" />
        <div className="absolute bottom-0 left-1/3 -mb-20 h-60 w-60 rounded-full bg-purple-100 blur-3xl pointer-events-none opacity-40" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-20 w-20 rounded-2xl border-2 border-violet-200 object-cover shadow-md"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-violet-200 bg-gradient-to-tr from-violet-600 to-purple-400 text-2xl font-bold text-white shadow-md">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
                <Sparkles className="h-3 w-3" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-0.5 text-[11px] font-semibold text-violet-700 tracking-wide">
                  {userRole || "Étudiant Evolve"}
                </span>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] text-gray-500">
                  {userEmail}
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                Ravi de vous revoir, <span className="text-violet-700">{userName}</span> 👋
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Continuez votre parcours d&apos;excellence tech &amp; design au sein de la communauté algérienne.
              </p>
            </div>
          </div>

          {/* Quick Resume CTA */}
          {resumeCourse && resumeCourse.nextLesson && (
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={`/${locale}/courses/${resumeCourse.id}/lessons/${resumeCourse.nextLesson.id}`}
                className="group relative inline-flex items-center gap-3 rounded-2xl bg-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all duration-300 hover:bg-violet-700 hover:scale-[1.02] active:scale-95"
              >
                <Play className="h-4 w-4 fill-white transition-transform group-hover:scale-110" />
                <span>Reprendre ma leçon</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 2. GAMIFIED METRICS STRIP */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Metric 1: Formations */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-violet-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Formations</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{stats.totalCourses}</span>
            <span className="text-xs text-gray-400">inscrites</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-violet-600">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-600 animate-pulse" />
            <span>{stats.inProgressCount} en cours · {stats.completedCount} validées</span>
          </div>
        </div>

        {/* Metric 2: Lessons & Hours */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Leçons Validées</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{stats.totalLessonsCompleted}</span>
            <span className="text-xs text-gray-400">modules</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-sky-500">
            <Clock className="h-3.5 w-3.5" />
            <span>~{stats.totalHoursEstimated}h de pratique acquise</span>
          </div>
        </div>

        {/* Metric 3: Streak */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Série d&apos;Assiduité</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{stats.streakDays}</span>
            <span className="text-xs text-gray-400">jours consécutifs</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-500">
            <Zap className="h-3.5 w-3.5" />
            <span>Objectif hebdo atteint à 85% 🔥</span>
          </div>
        </div>

        {/* Metric 4: Certifications */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-purple-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Attestations</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{stats.certificatesEarned}</span>
            <span className="text-xs text-gray-400">obtenues</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-600">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Certificats certifiés Evolve</span>
          </div>
        </div>
      </section>

      {/* 3. SPOTLIGHT: LAST ACTIVE LESSON RESUME CARD */}
      {resumeCourse && (
        <section className="relative overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="relative h-24 w-36 sm:h-28 sm:w-44 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm">
                {resumeCourse.image_url ? (
                  <img
                    src={resumeCourse.image_url}
                    alt={resumeCourse.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-violet-50 text-violet-400">
                    <BookOpen className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg">
                    <Play className="h-4 w-4 fill-white translate-x-0.5" />
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-violet-100 border border-violet-200 px-2.5 py-0.5 text-[10px] font-bold text-violet-700 uppercase tracking-wider">
                    En cours actuellement
                  </span>
                  {resumeCourse.domain && (
                    <span className="rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[10px] text-gray-600">
                      {resumeCourse.domain}
                    </span>
                  )}
                </div>

                <h2 className="mt-2 text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {resumeCourse.title}
                </h2>

                {resumeCourse.nextLesson ? (
                  <p className="mt-1 text-xs text-gray-600 flex items-center gap-1.5 truncate">
                    <span className="text-violet-700 font-semibold">Leçon suivante :</span>
                    <span className="truncate">{resumeCourse.nextLesson.title}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-emerald-600 font-medium">
                    Toutes les leçons de ce cours ont été complétées avec succès !
                  </p>
                )}

                {/* Progress bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 max-w-xs overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-400 transition-all duration-500"
                      style={{ width: `${resumeCourse.progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-violet-700">
                    {resumeCourse.progressPercentage}%
                  </span>
                  <span className="text-[11px] text-gray-400">
                    ({resumeCourse.completedLessons}/{resumeCourse.totalLessons} leçons)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {resumeCourse.nextLesson ? (
                <Link
                  href={`/${locale}/courses/${resumeCourse.id}/lessons/${resumeCourse.nextLesson.id}`}
                  className="rounded-2xl bg-violet-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-violet-700 active:scale-95 shadow-lg shadow-violet-200"
                >
                  Continuer la leçon
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setCertificateCourse(resumeCourse)}
                  className="rounded-2xl border border-purple-200 bg-purple-50 px-6 py-3 text-sm font-bold text-purple-700 transition-all hover:bg-purple-100"
                >
                  Voir mon attestation 🎓
                </button>
              )}

              <Link
                href={`/${locale}/courses/${resumeCourse.id}`}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition shadow-sm"
              >
                Programme complet
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. CONTROLS: TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "all"
                ? "bg-violet-600 text-white shadow-md shadow-violet-200 font-bold"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            }`}
          >
            Toutes mes formations ({enrolledCourses.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("in_progress")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "in_progress"
                ? "bg-violet-600 text-white shadow-md shadow-violet-200 font-bold"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            }`}
          >
            En cours ({stats.inProgressCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "completed"
                ? "bg-violet-600 text-white shadow-md shadow-violet-200 font-bold"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            }`}
          >
            Terminées ({stats.completedCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("workshops")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "workshops"
                ? "bg-violet-600 text-white shadow-md shadow-violet-200 font-bold"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            }`}
          >
            Ateliers &amp; Masterclasses ({upcomingWorkshops.length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer mes cours..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* 5. COURSES CONTENT AREA */}
      {activeTab !== "workshops" ? (
        <div>
          {filteredCourses.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 border border-violet-100 text-violet-400">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">
                {enrolledCourses.length === 0
                  ? "Vous n'êtes inscrit à aucune formation pour le moment"
                  : "Aucune formation ne correspond à votre recherche"}
              </h3>
              <p className="mt-2 max-w-md mx-auto text-xs text-gray-500">
                {enrolledCourses.length === 0
                  ? "Explorez nos cursus certifiants conçus par des experts du marché algérien et international."
                  : "Modifiez vos filtres ou effectuez une recherche différente."}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href={`/${locale}/formations`}
                  className="rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-violet-700 transition shadow-sm shadow-violet-200"
                >
                  Découvrir les formations
                </Link>
                <Link
                  href={`/${locale}/ateliers`}
                  className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                >
                  Voir les ateliers
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100/50"
                >
                  <div>
                    {/* Cover Image & Category Badges */}
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      {course.image_url ? (
                        <img
                          src={course.image_url}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100 text-violet-400">
                          <Layers className="h-10 w-10" />
                        </div>
                      )}

                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {course.domain && (
                          <span className="rounded-full bg-white/90 border border-white/60 px-2.5 py-0.5 text-[10px] font-semibold text-gray-700 backdrop-blur-md shadow-sm">
                            {course.domain}
                          </span>
                        )}
                        {course.level && (
                          <span className="rounded-full bg-violet-600/90 border border-violet-500/40 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md shadow-sm">
                            {course.level}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3">
                        <span className="rounded-full bg-white/90 border border-white/60 px-2.5 py-0.5 text-[10px] font-mono text-gray-700 backdrop-blur-md flex items-center gap-1 shadow-sm">
                          <Clock className="h-3 w-3 text-violet-600" />
                          {course.duration || "Formation certifiante"}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-violet-700 transition-colors line-clamp-1">
                        {course.title}
                      </h3>

                      {course.description && (
                        <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      {/* Progress bar */}
                      <div className="mt-5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Progression</span>
                          <span className="font-mono font-bold text-violet-700">
                            {course.progressPercentage}%
                          </span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              course.isCompleted
                                ? "bg-emerald-500"
                                : "bg-gradient-to-r from-violet-600 to-purple-400"
                            }`}
                            style={{ width: `${course.progressPercentage}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span>{course.completedLessons} / {course.totalLessons} leçons</span>
                          {course.isCompleted && (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Validé
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-6 pt-0 border-t border-gray-100 mt-4">
                    {course.isCompleted ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCertificateCourse(course)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 py-2.5 text-xs font-bold text-purple-700 transition hover:bg-purple-100"
                        >
                          <Award className="h-3.5 w-3.5" />
                          <span>Attestation</span>
                        </button>
                        <Link
                          href={`/${locale}/courses/${course.id}`}
                          className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition shadow-sm"
                        >
                          Revoir
                        </Link>
                      </div>
                    ) : course.nextLesson ? (
                      <Link
                        href={`/${locale}/courses/${course.id}/lessons/${course.nextLesson.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white transition hover:bg-violet-700 active:scale-95 shadow-sm shadow-violet-200"
                      >
                        <Play className="h-3 w-3 fill-white" />
                        <span>Continuer ({course.nextLesson.order_index})</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/${locale}/courses/${course.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition shadow-sm"
                      >
                        <span>Ouvrir le cours</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* WORKSHOPS TAB */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Ateliers &amp; Masterclasses Disponibles</h3>
            <Link
              href={`/${locale}/ateliers`}
              className="text-xs font-semibold text-violet-700 hover:underline flex items-center gap-1"
            >
              Voir tout le calendrier <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingWorkshops.map((workshop) => (
              <div
                key={workshop.id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col justify-between hover:border-violet-200 hover:shadow-lg transition-all"
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-gray-100">
                    {workshop.image_url ? (
                      <img
                        src={workshop.image_url}
                        alt={workshop.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-sky-50 text-sky-400">
                        <Calendar className="h-8 w-8" />
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-white/90 border border-white/60 px-2.5 py-0.5 text-[10px] font-semibold text-gray-700 backdrop-blur-md shadow-sm">
                      {workshop.domain || "Atelier Pratique"}
                    </span>
                  </div>

                  <h4 className="mt-4 text-base font-bold text-gray-900">
                    {workshop.title}
                  </h4>

                  {workshop.description && (
                    <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">
                      {workshop.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-violet-600" /> {workshop.duration || "Samedi 10h"}
                    </span>
                    <span className="font-mono font-bold text-violet-700">
                      {workshop.price ? `${workshop.price.toLocaleString("fr-DZ")} DZD` : "Inclus"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100">
                  <Link
                    href={`/${locale}/ateliers`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-xs font-semibold text-gray-700 hover:bg-violet-600 hover:border-violet-600 hover:text-white transition shadow-sm"
                  >
                    Réserver ma place
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. RECOMMENDED COURSES */}
      {recommendedCourses.length > 0 && (
        <section className="mt-16 pt-10 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-700">
                  Progression continue
                </span>
              </div>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                Recommandé pour approfondir vos compétences
              </h3>
            </div>

            <Link
              href={`/${locale}/formations`}
              className="text-xs font-semibold text-gray-500 hover:text-violet-700 transition flex items-center gap-1"
            >
              Consulter tout le catalogue <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {recommendedCourses.map((rec) => (
              <div
                key={rec.id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm hover:border-violet-200 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-gray-100">
                    {rec.image_url ? (
                      <img
                        src={rec.image_url}
                        alt={rec.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-violet-50 text-violet-300">
                        <BookOpen className="h-8 w-8" />
                      </div>
                    )}
                    {rec.domain && (
                      <span className="absolute top-2.5 left-2.5 rounded-full bg-white/90 border border-white/60 px-2.5 py-0.5 text-[10px] text-gray-700 backdrop-blur-md shadow-sm">
                        {rec.domain}
                      </span>
                    )}
                  </div>

                  <h4 className="mt-4 text-base font-bold text-gray-900 line-clamp-1">
                    {rec.title}
                  </h4>

                  {rec.description && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {rec.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100">
                  <Link
                    href={`/${locale}/courses/${rec.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-xs font-semibold text-gray-700 hover:bg-violet-600 hover:border-violet-600 hover:text-white transition shadow-sm"
                  >
                    Découvrir le cursus
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. QUICK ACCESS TO COMMUNITY & MENTORS BANNER */}
      <section className="grid gap-6 md:grid-cols-2 mt-12">
        {/* Mentor direct contact */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:border-violet-200 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 border border-violet-100">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">Besoin d&apos;aide sur un exercice ?</h4>
              <p className="text-xs text-gray-500">
                Vos formateurs et tuteurs sont connectés pour répondre à vos questions.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-xs text-emerald-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Réponse moyenne : &lt; 2h
            </span>
            <Link
              href={`/${locale}/messages`}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-violet-600 hover:border-violet-600 hover:text-white transition shadow-sm"
            >
              Ouvrir la messagerie
            </Link>
          </div>
        </div>

        {/* Community showcase */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:border-sky-200 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 border border-sky-100">
              <Share2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">Partagez vos réalisations</h4>
              <p className="text-xs text-gray-500">
                Publiez vos projets dans la Communauté Evolve et recueillez les avis de vos pairs.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-xs text-sky-500">
              +350 projets partagés cette semaine
            </span>
            <Link
              href={`/${locale}/community`}
              className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition shadow-sm"
            >
              Voir la communauté
            </Link>
          </div>
        </div>
      </section>

      {/* 8. CERTIFICATE MODAL */}
      {certificateCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-violet-200 bg-white p-8 shadow-2xl text-gray-900">
            <button
              type="button"
              onClick={() => setCertificateCourse(null)}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Certificate Header */}
            <div className="text-center space-y-2 border-b border-gray-200 pb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1 text-xs font-bold text-violet-700 uppercase tracking-widest">
                <Award className="h-3.5 w-3.5" />
                Certificat Officiel Evolve Academy
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
                Attestation d&apos;Accomplissement
              </h2>
              <p className="text-xs text-gray-500">
                Programme de formation certifiant · Evolve Academy Algérie
              </p>
            </div>

            {/* Certificate Body */}
            <div className="py-8 text-center space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ce certificat atteste que
              </p>
              <h3 className="text-3xl font-extrabold text-violet-700 underline decoration-violet-200 underline-offset-8">
                {userName}
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                a complété avec succès 100% du cursus d&apos;apprentissage intensif et validé l&apos;ensemble des modules pratiques de :
              </p>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 max-w-lg mx-auto">
                <p className="text-lg font-bold text-gray-900">{certificateCourse.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {certificateCourse.domain || "Technologie & Design"} · {certificateCourse.totalLessons} leçons validées
                </p>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-gray-400">
              <div>
                <p className="font-mono text-[11px] text-gray-600">
                  ID de vérification : EVOLVE-{certificateCourse.id.substring(0, 8).toUpperCase()}-{Math.floor(Date.now() / 1000000)}
                </p>
                <p className="text-[10px] text-gray-400">Délivré par le Comité Académique Evolve Alger</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-700 transition shadow-sm shadow-violet-200"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Imprimer / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setCertificateCourse(null)}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition shadow-sm"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
