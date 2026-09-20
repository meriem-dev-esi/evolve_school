import { getRecommendedCourses } from "@/lib/data/recommendations";

export default async function RecommendationsDebugPage() {
  const recommendations =
    await getRecommendedCourses(20);

  return (
    <main className="min-h-dvh bg-canvas px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">
          Recommendation Debug
        </h1>

        <p className="mt-3 text-white/50">
          Temporary page for testing the recommendation engine.
        </p>

        <div className="mt-10 space-y-5">
          {recommendations.map((course) => (
            <div
              key={course.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {course.title}
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    {course.domain} · {course.level}
                  </p>
                </div>

                <div className="rounded-full bg-brand px-4 py-2 font-bold text-black">
                  {course.score}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-white/60">
                  Reasons
                </p>

                <ul className="space-y-2">
                  {course.reasons.map((reason) => (
                    <li
                      key={reason}
                      className="text-sm text-brand"
                    >
                      ✓ {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 p-8 text-center text-white/50">
            No recommendations found.
          </div>
        )}
      </div>
    </main>
  );
}