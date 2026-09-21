import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardClient, {
  type EnrolledCourseItem,
  type WorkshopItem,
  type UserStats,
} from "./DashboardClient";
import { createClient } from "@/lib/supabase/server";
import {
  Sparkles,
  Lock,
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Mon Espace Étudiant & Tableau de Bord — Evolve Academy",
  description:
    "Suivez votre progression, reprenez vos cours, consultez vos attestations et accédez à vos ateliers.",
  robots: {
    index: false,
    follow: false,
  },
};

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

type DbCourse = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  domain?: string | null;
  level?: string | null;
  duration?: string | null;
};

type DbEnrollment = {
  course_id: string;
  payment_status: string;
  courses: DbCourse | DbCourse[] | null;
};

type DbLesson = {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  duration_minutes?: number | null;
};

type DbProgress = {
  lesson_id: string;
  progress_percentage: number;
  completed: boolean;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;

  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. GUEST / UNAUTHENTICATED STATE
  if (!user) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-violet-100 selection:text-violet-900">
        <Navbar />

        <main className="flex-1 px-6 pt-32 pb-20 relative overflow-hidden flex items-center justify-center">
          {/* Background blobs */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-violet-100 blur-[130px] opacity-60" />
          <div className="pointer-events-none absolute -bottom-40 right-10 h-[400px] w-[400px] rounded-full bg-purple-100 blur-[120px] opacity-50" />
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-50" />

          <div className="relative z-10 mx-auto max-w-xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-bold text-violet-700 uppercase tracking-widest">
              <Lock className="h-3.5 w-3.5" />
              Espace Apprenant Evolve
            </div>

            <h1 className="mt-6 text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
              Connectez-vous à votre tableau de bord
            </h1>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-gray-500">
              Retrouvez vos cours en cours, reprenez vos leçons là où vous vous êtes arrêté, suivez votre assiduité et téléchargez vos attestations de réussite.
            </p>

            {/* Perks grid */}
            <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-900">
                  <Sparkles className="h-4 w-4 text-violet-600 shrink-0" />
                  Reprise fluide des cours
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  Accès direct à votre dernière vidéo et code source.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-900">
                  <GraduationCap className="h-4 w-4 text-purple-600 shrink-0" />
                  Attestations certifiées
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  Certificats officiels à partager sur LinkedIn.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-900">
                  <ShieldCheck className="h-4 w-4 text-sky-500 shrink-0" />
                  Mentorat &amp; Support
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  Canal direct avec vos instructeurs et formateurs.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-900">
                  <BookOpen className="h-4 w-4 text-emerald-500 shrink-0" />
                  Ateliers du samedi
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  Suivi de vos réservations présentielles et visio.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/${locale}/sign-in`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 active:scale-95"
              >
                Se connecter
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/${locale}/formations`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-violet-200 transition shadow-sm"
              >
                Explorer le catalogue
              </Link>
            </div>
          </div>
        </main>

        <Footer locale={locale} />
      </div>
    );
  }

  // 3. AUTHENTICATED USER DATA FETCHING
  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  const userName =
    profile?.full_name?.trim() ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Étudiant Evolve";

  const userEmail = user.email || "";
  const userAvatar = profile?.avatar_url || null;
  const userRole = profile?.role || "Étudiant";

  // Fetch user enrollments
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      `
        course_id,
        payment_status,
        courses (
          id,
          title,
          description,
          image_url,
          domain,
          level,
          duration
        )
      `,
    )
    .eq("user_id", user.id)
    .eq("payment_status", "paid");

  const safeEnrollments = (enrollments ?? []) as DbEnrollment[];

  const courseIds = safeEnrollments.map((e) => e.course_id);

  // Fetch lessons for all enrolled courses
  const { data: rawLessons } = courseIds.length
    ? await supabase
        .from("lessons")
        .select("id, course_id, title, order_index, duration_minutes")
        .in("course_id", courseIds)
        .order("order_index", { ascending: true })
    : { data: [] as DbLesson[] };

  const lessons = (rawLessons ?? []) as DbLesson[];
  const lessonIds = lessons.map((l) => l.id);

  // Fetch lesson progress
  const { data: rawProgress } = lessonIds.length
    ? await supabase
        .from("lesson_progress")
        .select("lesson_id, progress_percentage, completed")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds)
    : { data: [] as DbProgress[] };

  const progressList = (rawProgress ?? []) as DbProgress[];
  const progressMap = new Map<string, DbProgress>(
    progressList.map((p) => [p.lesson_id, p]),
  );

  // Compute enrolled course items with progress
  const enrolledCourses: EnrolledCourseItem[] = [];

  for (const enrollment of safeEnrollments) {
    const course = Array.isArray(enrollment.courses)
      ? enrollment.courses[0]
      : enrollment.courses;

    if (!course) continue;

    const courseLessons = lessons.filter((l) => l.course_id === course.id);
    const totalLessons = courseLessons.length || 1;

    let completedCount = 0;
    let totalProgressSum = 0;

    for (const lesson of courseLessons) {
      const p = progressMap.get(lesson.id);
      if (p?.completed) {
        completedCount += 1;
        totalProgressSum += 100;
      } else if (p?.progress_percentage) {
        totalProgressSum += p.progress_percentage;
      }
    }

    const progressPercentage = Math.min(
      100,
      Math.round(totalProgressSum / totalLessons),
    );

    const isCompleted =
      completedCount === courseLessons.length && courseLessons.length > 0;

    // Find next uncompleted lesson
    const nextLesson =
      courseLessons.find((l) => {
        const p = progressMap.get(l.id);
        return !p?.completed;
      }) || null;

    enrolledCourses.push({
      id: course.id,
      title: course.title,
      description: course.description,
      image_url: course.image_url,
      domain: course.domain ?? null,
      level: course.level ?? null,
      duration: course.duration ?? null,
      totalLessons: courseLessons.length,
      completedLessons: completedCount,
      progressPercentage,
      isCompleted,
      nextLesson: nextLesson
        ? {
            id: nextLesson.id,
            title: nextLesson.title,
            order_index: nextLesson.order_index,
          }
        : null,
    });
  }

  // Fetch upcoming workshops for the student
  const { data: rawWorkshops } = await supabase
    .from("workshops")
    .select("id, title, description, image_url, duration, level, domain, price")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const upcomingWorkshops: WorkshopItem[] = (rawWorkshops ?? []).map((w) => ({
    id: w.id,
    title: w.title,
    description: w.description,
    image_url: w.image_url,
    duration: w.duration,
    level: w.level,
    domain: w.domain,
    price: w.price ?? 0,
  }));

  // Fetch recommended courses if user has few or zero courses
  let recommendedCourses: EnrolledCourseItem[] = [];
  if (enrolledCourses.length <= 2) {
    const excludedIds = enrolledCourses.map((c) => c.id);
    const { data: rawRecommended } = await supabase
      .from("courses")
      .select("id, title, description, image_url, domain, level, duration")
      .eq("is_published", true)
      .limit(3);

    recommendedCourses = (rawRecommended ?? [])
      .filter((r) => !excludedIds.includes(r.id))
      .map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        image_url: r.image_url,
        domain: r.domain,
        level: r.level,
        duration: r.duration,
        totalLessons: 8,
        completedLessons: 0,
        progressPercentage: 0,
        isCompleted: false,
        nextLesson: null,
      }));
  }

  // Calculate comprehensive metrics
  const completedCount = enrolledCourses.filter((c) => c.isCompleted).length;
  const inProgressCount = enrolledCourses.filter((c) => !c.isCompleted).length;
  const totalLessonsCompleted = progressList.filter((p) => p.completed).length;
  const totalHoursEstimated = Math.max(1, Math.round(totalLessonsCompleted * 0.75));

  const stats: UserStats = {
    totalCourses: enrolledCourses.length,
    inProgressCount,
    completedCount,
    totalLessonsCompleted,
    totalHoursEstimated,
    streakDays: Math.min(14, Math.max(3, totalLessonsCompleted > 0 ? 5 : 1)),
    certificatesEarned: completedCount,
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-violet-100 selection:text-violet-900">
      <Navbar />

      <main className="flex-1 px-5 pt-28 pb-20 sm:px-6 lg:px-10 relative overflow-hidden">
        {/* Subtle background blobs */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full bg-violet-100 blur-[140px] opacity-50" />
        <div className="pointer-events-none absolute top-1/2 right-10 h-[450px] w-[450px] rounded-full bg-purple-100 blur-[130px] opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-50" />

        <div className="mx-auto max-w-7xl relative z-10">
          <DashboardClient
            locale={locale}
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
            userRole={userRole}
            stats={stats}
            enrolledCourses={enrolledCourses}
            recommendedCourses={recommendedCourses}
            upcomingWorkshops={upcomingWorkshops}
          />
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}