import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <div className="glass-card relative max-w-lg rounded-3xl border border-white/10 p-8 shadow-2xl sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand/30 bg-brand/10 text-brand">
          <Compass className="h-8 w-8 animate-spin" style={{ animationDuration: "12s" }} />
        </div>

        <span className="mt-6 inline-block font-mono text-xs font-bold tracking-widest text-brand uppercase">
          Erreur 404 · Page Introuvable
        </span>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Page non trouvée
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-white/60">
          La ressource que vous recherchez n&apos;existe pas ou a été déplacée. Vérifiez l&apos;URL ou retournez à l&apos;accueil.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-black transition-all hover:shadow-[0_0_20px_rgba(95,236,107,0.4)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>
          <Link
            href="/formations"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/10"
          >
            <span>Explorer les formations</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
