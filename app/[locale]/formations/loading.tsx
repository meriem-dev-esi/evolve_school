export default function FormationsLoading() {
  return (
    <div className="min-h-screen bg-black text-white px-6 pt-32 pb-16">
      <div className="mx-auto max-w-7xl animate-pulse">
        {/* Title skeleton */}
        <div className="h-10 w-64 rounded-xl bg-white/10" />
        <div className="mt-3 h-5 w-96 rounded-lg bg-white/5" />

        {/* Filter bars skeleton */}
        <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-28 shrink-0 rounded-full bg-white/10" />
          ))}
        </div>

        {/* Course card skeletons */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 p-4"
            >
              <div className="h-44 w-full rounded-xl bg-white/10" />
              <div className="mt-4 h-6 w-3/4 rounded-lg bg-white/10" />
              <div className="mt-2 h-4 w-1/2 rounded bg-white/5" />
              <div className="mt-6 flex justify-between items-center pt-4 border-t border-white/5">
                <div className="h-4 w-16 rounded bg-white/10" />
                <div className="h-7 w-20 rounded-full bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
