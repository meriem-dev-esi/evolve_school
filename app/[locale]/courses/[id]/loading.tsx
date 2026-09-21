export default function CourseLoading() {
  return (
    <div className="min-h-screen bg-black text-white px-6 pt-32 pb-16">
      <div className="mx-auto max-w-6xl animate-pulse space-y-8">
        <div className="h-6 w-36 rounded bg-white/10" />

        <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-8 space-y-4">
          <div className="h-10 w-2/3 rounded-xl bg-white/10" />
          <div className="h-5 w-full rounded bg-white/5" />
          <div className="h-5 w-4/5 rounded bg-white/5" />
          <div className="pt-4 flex gap-6">
            <div className="h-6 w-28 rounded bg-white/10" />
            <div className="h-6 w-36 rounded bg-white/10" />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="h-8 w-44 rounded bg-white/10" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-950/40 p-5"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <div className="h-5 w-48 rounded bg-white/10" />
                  <div className="h-3 w-28 rounded bg-white/5" />
                </div>
              </div>
              <div className="h-8 w-24 rounded-xl bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
