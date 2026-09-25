"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Structured error logging (in production this goes to logging service)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="flex min-h-dvh flex-col items-center justify-center bg-[#0b0b0b] px-6 text-center text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-xl font-bold">
            !
          </div>

          <h1 className="mt-4 text-2xl font-bold">Une erreur inattendue est survenue</h1>

          <p className="mt-2 text-sm text-white/60">
            Notre équipe technique a été notifiée. Veuillez recharger la page ou réessayer ultérieurement.
          </p>

          {process.env.NODE_ENV !== "production" && error?.digest && (
            <p className="mt-3 font-mono text-xs text-white/40">
              Digest: {error.digest}
            </p>
          )}

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black transition hover:bg-white/90"
            >
              Réessayer
            </button>
            <a
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
            >
              Retour à l&apos;accueil
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
