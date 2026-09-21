import Navbar from "@/components/Navbar";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 px-5 pt-28 pb-20 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl animate-pulse space-y-10">
          {/* Welcome banner skeleton */}
          <div className="h-44 w-full rounded-3xl border border-gray-200 bg-white shadow-sm p-8 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl bg-gray-100 shrink-0" />
              <div className="space-y-3">
                <div className="h-5 w-32 rounded-full bg-gray-100" />
                <div className="h-8 w-64 rounded-lg bg-gray-200" />
                <div className="h-4 w-48 rounded bg-gray-100" />
              </div>
            </div>
            <div className="hidden md:block h-12 w-48 rounded-2xl bg-violet-100" />
          </div>

          {/* 4 Metrics cards skeleton */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 w-20 rounded bg-gray-100" />
                  <div className="h-8 w-8 rounded-xl bg-gray-100" />
                </div>
                <div className="h-8 w-16 rounded-lg bg-gray-200" />
                <div className="h-3 w-28 rounded bg-gray-100" />
              </div>
            ))}
          </div>

          {/* Spotlight resume card skeleton */}
          <div className="h-36 rounded-3xl border border-gray-200 bg-white shadow-sm p-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="h-24 w-36 rounded-2xl bg-gray-100 shrink-0" />
              <div className="space-y-2">
                <div className="h-4 w-28 rounded-full bg-gray-100" />
                <div className="h-6 w-56 rounded-lg bg-gray-200" />
                <div className="h-3 w-40 rounded bg-gray-100" />
              </div>
            </div>
            <div className="h-11 w-40 rounded-2xl bg-violet-100 shrink-0" />
          </div>

          {/* Course cards grid skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                <div className="h-48 w-full bg-gray-100" />
                <div className="p-6 space-y-3">
                  <div className="h-6 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-100" />
                  <div className="h-2 w-full rounded-full bg-gray-100 mt-4" />
                  <div className="h-10 w-full rounded-xl bg-gray-100 mt-6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
