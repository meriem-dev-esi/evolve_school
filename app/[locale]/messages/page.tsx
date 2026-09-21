import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MessagingClient from "./MessagingClient";
import { getConversations, getConversationMessages } from "@/lib/data/messages";
import { createClient } from "@/lib/supabase/server";
import { MessageSquare, ShieldCheck, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Messagerie & Mentorat Direct — Evolve Academy",
  description:
    "Échangez en direct avec vos formateurs, tuteurs et camarades de promotion au sein d'Evolve Academy.",
  robots: {
    index: false,
    follow: false,
  },
};

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    recipient?: string;
    course?: string;
  }>;
};

export default async function MessagesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { recipient, course } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentUserId = user?.id || "me";

  const conversations = await getConversations(currentUserId);
  const firstConvId = conversations[0]?.id || "conv-1";
  const { messages } = await getConversationMessages(firstConvId);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-brand selection:text-black">
      <Navbar />

      <main className="flex-1 px-4 pt-28 pb-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full bg-brand/10 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="mx-auto max-w-7xl relative z-10">
          {/* Header & Status Strip */}
          <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1 text-xs font-bold text-brand uppercase tracking-wider">
                <MessageSquare className="h-3.5 w-3.5" />
                Mentorat & Échanges
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Messagerie Pédagogique
              </h1>

              <p className="mt-1 text-xs sm:text-sm text-white/60">
                Posez vos questions sur vos cours, demandez des revues de code et contactez les formateurs Evolve.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-white/70 backdrop-blur-md">
                <Clock className="h-3.5 w-3.5 text-brand" />
                <span>Réponse moyenne : &lt; 2h</span>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-emerald-400 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Formateurs en ligne</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-white/50 backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>Mentorat vérifié</span>
              </div>
            </div>
          </div>

          {/* Messaging Workspace Client */}
          <MessagingClient
            initialConversations={conversations}
            initialMessages={messages}
            currentUserId={currentUserId}
            recipientId={recipient}
            courseTitle={course}
            locale={locale}
          />
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
