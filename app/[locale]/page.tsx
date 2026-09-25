import { getTranslations, setRequestLocale } from "next-intl/server";
import ContinueLearningCard from "@/components/ContinueLearningCard";
import Hero from "@/components/Hero";
import HorizontalCourseSection from "@/components/HorizontalCourseSection";
import IntroGate from "@/components/IntroGate";
import IntroPreloader from "@/components/IntroPreloader";
import Navbar from "@/components/Navbar";
import SeriesCard from "@/components/SeriesCard";
import {
  type ContinueLearning,
  type Course,
  type EnrollmentSeries,
  getContinueLearning,
  getHomePagePublicCourses,
  getUserDashboardData,
} from "@/lib/data/dashboard";
import { getRecommendedCourses } from "@/lib/data/recommendations";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tHome = await getTranslations("home");
  const supabase = await createClient();

  const [
    publicCourses,
    {
      data: { user },
    },
  ] = await Promise.all([getHomePagePublicCourses(), supabase.auth.getUser()]);

  let recommendedCourses: Course[] = [];
  let watchlistCourses: Course[] = [];
  let becauseYouCompleted: Course[] = [];
  let mostSearchedCourses: Course[] = [];
  let enrollmentPaths: EnrollmentSeries[] = [];
  let continueLearning: ContinueLearning | null = null;

  if (user) {
    const [recommendations, userData, continueData] = await Promise.all([
      getRecommendedCourses(10),
      getUserDashboardData(user.id),
      getContinueLearning(user.id),
    ]);

    recommendedCourses = recommendations.map((c) => ({
      ...c,
      price: null,
      practice_percentage: null,
    }));
    watchlistCourses = userData.watchlistCourses;
    becauseYouCompleted = userData.becauseYouCompleted;
    enrollmentPaths = userData.enrollmentPaths;
    mostSearchedCourses = userData.mostSearchedCourses;
    continueLearning = continueData;
  }

  return (
    <main className="min-h-dvh bg-transparent text-white">
      <IntroPreloader />

      <IntroGate>
        <Navbar />
        <Hero />
      </IntroGate>

      <div className="bg-transparent">
        {/* 1. RECOMMENDED FOR YOU */}
        <HorizontalCourseSection
          title={tHome("recommendedForYou")}
          courses={recommendedCourses}
          locale={locale}
          locked={!user}
        />

        {/* 2. YOUR ENROLLMENT PATH */}
        {user && enrollmentPaths.length > 0 ? (
          <section className="bg-transparent px-6 py-12 lg:px-10">
            <div className="mx-auto max-w-7xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white md:text-3xl">
                  {tHome("yourEnrollmentPath")}
                </h2>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-4">
                {enrollmentPaths.map((series) => (
                  <SeriesCard
                    key={series.id}
                    series={series}
                    courseCount={series.courseIds.length}
                    completedCourses={series.completedCourses}
                    progress={series.progress}
                    locale={locale}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <HorizontalCourseSection
            title={tHome("yourEnrollmentPath")}
            courses={[]}
            locale={locale}
            locked={!user}
          />
        )}

        {/* 3. CONTINUE LEARNING */}
        {user && continueLearning ? (
          <section className="bg-transparent px-6 py-12 lg:px-10">
            <div className="mx-auto max-w-7xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white md:text-3xl">
                  {tHome("continueLearning")}
                </h2>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-4">
                <ContinueLearningCard
                  data={continueLearning}
                  labels={{
                    inProgress: tHome("inProgress"),
                    progress: tHome("progress"),
                    continueButton: tHome("continueButton"),
                  }}
                />
              </div>
            </div>
          </section>
        ) : (
          <HorizontalCourseSection
            title={tHome("continueLearning")}
            courses={[]}
            locale={locale}
            locked={!user}
          />
        )}

        {/* 4. BECAUSE YOU COMPLETED */}
        <HorizontalCourseSection
          title={tHome("becauseYouCompleted")}
          courses={becauseYouCompleted}
          locale={locale}
          locked={!user}
        />

        {/* 5. BEGINNER STARTER PACK */}
        <HorizontalCourseSection
          title={tHome("beginnerStarterPack")}
          courses={publicCourses.beginnerCourses}
          locale={locale}
        />

        {/* 6. PARTNER COURSES ZONE */}
        <HorizontalCourseSection
          title={tHome("partnerCoursesZone")}
          courses={publicCourses.partnerCourses}
          locale={locale}
        />

        {/* 7. WATCHLIST */}
        <HorizontalCourseSection
          title={tHome("watchlist")}
          courses={watchlistCourses}
          locale={locale}
          locked={!user}
        />

        {/* 8. MOST SEARCHED THIS WEEK */}
        <HorizontalCourseSection
          title={tHome("mostSearchedThisWeek")}
          courses={mostSearchedCourses}
          locale={locale}
          locked={!user}
        />

        {/* 9. EXCLUSIVE TO EVOLVE */}
        <HorizontalCourseSection
          title={tHome("exclusiveToEvolve")}
          courses={publicCourses.exclusiveCourses}
          locale={locale}
        />

        {/* 10. TRENDING */}
        <HorizontalCourseSection
          title={tHome("trending")}
          courses={publicCourses.trendingCourses}
          locale={locale}
        />

        {/* 11. COMING SOON */}
        <HorizontalCourseSection
          title={tHome("comingSoon")}
          courses={publicCourses.comingSoonCourses}
          locale={locale}
        />
      </div>
    </main>
  );
}
