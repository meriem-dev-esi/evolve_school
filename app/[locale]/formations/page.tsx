import Link from "next/link";
import FormationsBrowser from "./FormationsBrowser";
import { createClient } from "@/lib/supabase/server";

type Props = {
params: Promise<{
locale: string;
}>;
searchParams: Promise<{
completed?: string;
formation?: string;
}>;
};

type Course = {
id: string;
title: string;
description: string | null;
image_url: string | null;
duration: string | null;
level: string | null;
domain: string | null;
progress: number;
completed: boolean;
nextLessonId: string | null;
};

type Formation = {
id: string;
title: string;
description: string | null;
image_url: string | null;
level: string | null;
domain: string | null;
courses: Course[];
};

export default async function FormationsPage({
params,
searchParams,
}: Props) {
const { locale } = await params;

const {
completed: completedParam,
formation: completedFormationParam,
} = await searchParams;

const supabase = await createClient();

// =====================================================
// AUTHENTICATED USER
// =====================================================

const {
data: { user },
} = await supabase.auth.getUser();

// =====================================================
// USER PROGRESS
// =====================================================

const { data: progressRows } = user
? await supabase
.from("lesson_progress")
.select(
"lesson_id, completed, progress_percentage",
)
.eq("user_id", user.id)
: { data: [] };

// =====================================================
// 1. GET FORMATIONS
// =====================================================

const {
data: formations,
error: formationsError,
} = await supabase
.from("course_series")
.select(
"id, title, description, image_url, level, domain, is_published",
)
.eq("is_published", true)
.order("created_at", {
ascending: false,
});

if (formationsError) {
console.error(
"[Evolve] Formations error:",
formationsError,
);
}

// =====================================================
// 2. GET FORMATION → COURSE RELATIONSHIPS
// =====================================================

const formationIds = (formations ?? []).map(
(formation) => formation.id,
);

const {
data: seriesCourses,
error: seriesCoursesError,
} =
formationIds.length > 0
? await supabase
.from("series_courses")
.select(
"series_id, course_id, order_index",
)
.in("series_id", formationIds)
.order("order_index", {
ascending: true,
})
: {
data: [],
error: null,
};

if (seriesCoursesError) {
console.error(
"[Evolve] Series courses error:",
seriesCoursesError,
);
}

// =====================================================
// 3. GET COURSES
// =====================================================

const courseIds = [
...new Set(
(seriesCourses ?? []).map(
(item) => item.course_id,
),
),
];

const {
data: courses,
error: coursesError,
} =
courseIds.length > 0
? await supabase
.from("courses")
.select(
"id, title, description, image_url, level, domain, duration",
)
.in("id", courseIds)
.eq("is_published", true)
: {
data: [],
error: null,
};

if (coursesError) {
console.error(
"[Evolve] Courses error:",
coursesError,
);
}

// =====================================================
// 4. GET LESSONS
// =====================================================

const { data: lessons } =
courseIds.length > 0
? await supabase
.from("lessons")
.select(
"id, course_id, order_index",
)
.in("course_id", courseIds)
.order("order_index", {
ascending: true,
})
: { data: [] };

// =====================================================
// 5. CREATE COURSE MAP WITH PROGRESS
// =====================================================

const courseMap = new Map<string, Course>();

for (const course of courses ?? []) {
const courseLessons = (lessons ?? [])
.filter(
(lesson) =>
lesson.course_id === course.id,
)
.sort(
(a, b) =>
a.order_index - b.order_index,
);


const completedLessons =
  courseLessons.filter((lesson) =>
    (progressRows ?? []).some(
      (progress) =>
        progress.lesson_id === lesson.id &&
        progress.completed === true,
    ),
  ).length;

const progress =
  courseLessons.length > 0
    ? Math.round(
        (completedLessons /
          courseLessons.length) *
          100,
      )
    : 0;

const completed =
  courseLessons.length > 0 &&
  completedLessons ===
    courseLessons.length;

const nextLesson =
  courseLessons.find(
    (lesson) =>
      !(progressRows ?? []).some(
        (progress) =>
          progress.lesson_id === lesson.id &&
          progress.completed === true,
      ),
  ) ??
  courseLessons[0] ??
  null;

courseMap.set(course.id, {
  ...course,
  progress,
  completed,
  nextLessonId:
    nextLesson?.id ?? null,
});


}

// =====================================================
// 6. BUILD FORMATION DATA
// =====================================================

const formationData: Formation[] = (
formations ?? []
).map((formation) => {
const formationCourses = (
seriesCourses ?? []
)
.filter(
(item) =>
item.series_id === formation.id,
)
.sort(
(a, b) =>
a.order_index - b.order_index,
)
.map((item) =>
courseMap.get(item.course_id),
)
.filter(
(course): course is Course =>
Boolean(course),
);


return {
  id: formation.id,
  title: formation.title,
  description: formation.description,
  image_url: formation.image_url,
  level: formation.level,
  domain: formation.domain,
  courses: formationCourses,
};

});

// =====================================================
// 7. COMPLETED FORMATIONS
// =====================================================

const completedFormationIds =
formationData
.filter(
(formation) =>
formation.courses.length > 0 &&
formation.courses.every(
(course) => course.completed,
),
)
.map(
(formation) => formation.id,
);

// =====================================================
// 8. GLOBAL PROGRESS
// =====================================================

const totalFormationCourses =
formationData.reduce(
(total, formation) =>
total + formation.courses.length,
0,
);

const completedFormationCourses =
formationData.reduce(
(total, formation) =>
total +
formation.courses.filter(
(course) => course.completed,
).length,
0,
);

const globalProgress =
totalFormationCourses > 0
? Math.round(
(completedFormationCourses /
totalFormationCourses) *
100,
)
: 0;

// =====================================================
// 9. COMPLETION MESSAGE
// =====================================================

const formationWasCompleted =
completedParam === "1" &&
completedFormationParam &&
completedFormationIds.includes(
completedFormationParam,
);

const completedFormation =
completedFormationParam
? formationData.find(
(formation) =>
formation.id ===
completedFormationParam,
)
: null;

// =====================================================
// 10. RENDER
// =====================================================

return ( <main className="min-h-screen bg-[#0f0f0f] text-white">


  {/* ================================================= */}
  {/* HEADER */}
  {/* ================================================= */}

  <section className="border-b border-white/10 px-6 py-14 lg:px-10">
    <div className="mx-auto max-w-7xl">

      <p className="mb-3 text-sm font-medium tracking-[0.2em] text-lime-400">
        EVOLVE LEARNING
      </p>

      <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
        Formations
      </h1>

      <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
        Follow structured learning paths and
        build your skills step by step.
      </p>

      {/* Global progress */}

      {user &&
        totalFormationCourses > 0 && (
          <div className="mt-8 max-w-xl">

            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-white/60">
                Your learning progress
              </span>

              <span className="font-semibold text-lime-400">
                {globalProgress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-lime-400 transition-all"
                style={{
                  width: `${globalProgress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-white/35">
              {completedFormationCourses} of{" "}
              {totalFormationCourses} courses
              completed
            </p>

          </div>
        )}

    </div>
  </section>

  {/* ================================================= */}
  {/* COMPLETION MESSAGE */}
  {/* ================================================= */}

  {formationWasCompleted && (
    <section className="px-6 pt-8 lg:px-10">
      <div className="mx-auto max-w-7xl">

        <div className="rounded-3xl border border-lime-400/20 bg-lime-400/10 p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-400 text-xl text-black">
              ✓
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Formation completed 🎓
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/60">
                Congratulations! You completed{" "}
                {completedFormation?.title
                  ? `"${completedFormation.title}"`
                  : "all the courses in this learning path"}
                .
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  )}

  {/* ================================================= */}
  {/* SEARCH + CATEGORIES + FORMATIONS */}
  {/* ================================================= */}

  <FormationsBrowser
    formations={formationData}
    locale={locale}
    completedFormationIds={
      completedFormationIds
    }
  />

  {/* ================================================= */}
  {/* COMMUNITY */}
  {/* ================================================= */}

  <section className="border-t border-white/10 px-6 py-20 lg:px-10">
    <div className="mx-auto max-w-7xl">

      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
        Community
      </p>

      <h2 className="mt-3 text-3xl font-bold md:text-4xl">
        Découvrir les travaux de notre communauté
      </h2>

      <p className="mt-4 max-w-2xl text-white/50">
        Explore projects created by learners
        and discover what you can build with
        the skills you learn on Evolve.
      </p>

      <Link
        href={`/${locale}/community`}
        className="mt-7 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/80"
      >
        Découvrir la communauté →
      </Link>

    </div>
  </section>

</main>


);
}
