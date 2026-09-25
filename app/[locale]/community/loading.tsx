export default function CommunityLoading() {
  return (
    <div className="min-h-screen bg-black text-white px-6 pt-32 pb-16">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-10 w-72 rounded-xl bg-white/10" />
        <div className="mt-3 h-5 w-80 rounded-lg bg-white/5" />

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <div className="h-6 w-48 rounded bg-white/10" />
          <div className="mt-4 h-24 w-full rounded-xl bg-white/5" />
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 p-4"
            >
              <div className="h-44 w-full rounded-xl bg-white/10" />
              <div className="mt-4 flex justify-between">
                <div className="h-5 w-3/5 rounded bg-white/10" />
                <div className="h-5 w-16 rounded-full bg-white/5" />
              </div>
              <div className="mt-3 flex gap-2">
                <div className="h-6 w-6 rounded-full bg-white/10" />
                <div className="h-4 w-28 rounded bg-white/5" />
              </div>
              <div className="mt-4 h-10 w-full rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
