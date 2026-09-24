import { ArrowRight, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import AteliersBrowser from "./AteliersBrowser";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

type Workshop = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  duration: string | null;
  level: string | null;
  domain: string | null;
  price: number;
};

export default async function AteliersPage({ params }: Props) {
  const { locale } = await params;

  const supabase = await createClient();

  const { data: workshops, error: workshopsError } = await supabase
    .from("workshops")
    .select("id, title, description, image_url, duration, level, domain, price")
    .eq("is_published", true)
    .order("created_at", {
      ascending: false,
    });

  if (workshopsError) {
    console.error("[Evolve] Workshops error:", workshopsError);
  }

  const workshopData: Workshop[] = (workshops ?? []).map((workshop) => ({
    id: workshop.id,
    title: workshop.title,
    description: workshop.description,
    image_url: workshop.image_url,
    duration: workshop.duration,
    level: workshop.level,
    domain: workshop.domain,
    price: Number(workshop.price ?? 0),
  }));

  return (
    <div className="min-h-dvh bg-canvas text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* ================================================= */}
        {/* HERO HEADER */}
        {/* ================================================= */}
        <section className="relative overflow-hidden border-b border-white/10 px-6 py-16 lg:px-10">
          {/* Ambient Lighting Glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-sky-500/10 blur-[120px]" />
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-400">
                <Zap className="h-3.5 w-3.5" />
                Ateliers Pratiques & Masterclasses
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Les Ateliers{" "}
              <span className="bg-gradient-to-r from-sky-400 via-white to-brand bg-clip-text text-transparent">
                Evolve
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              Pratiquez en direct avec des experts du secteur. Des sessions
              intensives et interactives conçues pour accélérer votre maîtrise
              des outils du futur.
            </p>
          </div>
        </section>

        {/* ================================================= */}
        {/* SEARCH + CATEGORIES + WORKSHOPS BROWSER */}
        {/* ================================================= */}
        <AteliersBrowser workshops={workshopData} locale={locale} />

        {/* ================================================= */}
        {/* COMMUNITY STRIP */}
        {/* ================================================= */}
        <section className="border-t border-white/10 px-6 py-20 lg:px-10 relative overflow-hidden">
          <div className="pointer-events-none absolute -bottom-10 left-10 h-72 w-72 rounded-full bg-sky-500/5 blur-[90px]" />

          <div className="relative mx-auto max-w-7xl">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              Rejoignez le réseau
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
              Proposez un Atelier ou Partagez vos Travaux
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              Vous êtes formateur ou expert ? Rejoignez l'équipe d'animateurs
              d'ateliers Evolve ou proposez une masterclass à notre communauté.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/community"
                className="group inline-flex items-center gap-2.5 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(95,236,107,0.5)]"
              >
                <span>Rejoindre la communauté</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
