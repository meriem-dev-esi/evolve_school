export default function MessagesLoading() {
  return (
    <div className="min-h-screen bg-black text-white px-6 pt-28 pb-12">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-white/10" />
        <div className="mt-2 h-4 w-72 rounded-lg bg-white/5" />

        <div className="mt-6 grid h-[calc(100vh-14rem)] min-h-[550px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 md:grid-cols-12">
          <div className="p-4 border-r border-white/10 md:col-span-4 space-y-4">
            <div className="h-9 w-full rounded-xl bg-white/10" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-center p-2 rounded-xl bg-white/5"
                >
                  <div className="h-10 w-10 rounded-full bg-white/10 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-24 rounded bg-white/10" />
                    <div className="h-3 w-36 rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-8 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="h-10 w-10 rounded-full bg-white/10" />
              <div className="space-y-1">
                <div className="h-4 w-32 rounded bg-white/10" />
                <div className="h-3 w-20 rounded bg-white/5" />
              </div>
            </div>

            <div className="space-y-4 py-8">
              <div className="h-12 w-64 rounded-2xl bg-white/10" />
              <div className="h-12 w-80 rounded-2xl bg-white/5 ml-auto" />
              <div className="h-16 w-72 rounded-2xl bg-white/10" />
            </div>

            <div className="h-12 w-full rounded-xl bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
