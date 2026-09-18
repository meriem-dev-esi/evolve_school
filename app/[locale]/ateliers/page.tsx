import Link from "next/link";
import AteliersBrowser from "./AteliersBrowser";
import { createClient } from "@/lib/supabase/server";

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

export default async function AteliersPage({
  params,
}: Props) {
  const { locale } = await params;

  const supabase = await createClient();

  const {
    data: workshops,
    error: workshopsError,
  } = await supabase
    .from("workshops")
    .select(
      "id, title, description, image_url, duration, level, domain, price",
    )
    .eq("is_published", true)
    .order("created_at", {
      ascending: false,
    });

  if (workshopsError) {
    console.error(
      "[Evolve] Workshops error:",
      workshopsError,
    );
  }

  const workshopData: Workshop[] = (
    workshops ?? []
  ).map((workshop) => ({
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
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <section className="border-b border-white/10 px-6 py-14 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-medium tracking-[0.2em] text-lime-400">
            EVOLVE LEARNING
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Ateliers
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
            Learn by doing through practical workshops
            designed to help you build real skills.
          </p>
        </div>
      </section>

      {/* ================================================= */}
      {/* SEARCH + CATEGORIES + WORKSHOPS */}
      {/* ================================================= */}

      <AteliersBrowser
        workshops={workshopData}
        locale={locale}
      />

      {/* ================================================= */}
      {/* COMMUNITY */}
      {/* ================================================= */}

      <section className="border-t border-white/10 px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
            Community
          </p>

          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Découvrir les travaux de notre communauté
          </h2>

          <p className="mt-4 max-w-2xl text-white/50">
            Explore projects created by learners
            and discover what you can build with
            the skills you learn on Evolve.
          </p>

          <Link
            href={`/${locale}/community`}
            className="mt-7 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/80"
          >
            Découvrir la communauté →
          </Link>
        </div>
      </section>
    </main>
  );
}