"use client";

/**
 * The error boundary the data functions throw into.
 *
 * `lib/data/*` throws on a failed query rather than returning an empty array,
 * so a broken database connection shows up here as an error instead of on the
 * page as "no disciplines yet". The distinction matters: one of those is a
 * sentence about content, the other is a sentence about the system.
 *
 * OWNER: the layout-shell track — this needs the real chrome and copy in three
 * languages. It is left plain on purpose so it is obvious it is unfinished.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      {/* In production Next replaces the message with a digest, so this shows
          the real text only in development — which is where it is useful. */}
      <p className="text-sm text-ink-muted">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="w-fit rounded-pill border border-border px-5 py-2"
      >
        Try again
      </button>
    </main>
  );
}
