export default function AteliersLoading() {
  return (
    <div className="min-h-screen bg-black text-white px-6 pt-32 pb-16">
      <div className="mx-auto max-w-7xl animate-pulse space-y-8">
        <div className="h-10 w-64 rounded-xl bg-white/10" />
        <div className="h-5 w-96 rounded-lg bg-white/5" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl border border-white/10 bg-zinc-950/60 p-6 space-y-4"
            >
              <div className="h-36 rounded-xl bg-white/10" />
              <div className="h-6 w-3/4 rounded bg-white/10" />
              <div className="h-4 w-1/2 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
