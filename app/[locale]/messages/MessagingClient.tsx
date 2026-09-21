"use client";

import { useState, useEffect, useRef } from "react";
import type { Conversation, DirectMessage } from "@/lib/data/messages";
import {
  Search,
  Send,
  CheckCheck,
  Clock,
  Sparkles,
  Paperclip,
  Smile,
  Code2,
  ShieldCheck,
} from "lucide-react";

interface MessagingClientProps {
  initialConversations: Conversation[];
  initialMessages: DirectMessage[];
  currentUserId?: string;
  recipientId?: string;
  courseTitle?: string;
  locale: string;
}

const QUICK_PROMPTS = [
  "Question sur un exercice",
  "Revue de code & Bonnes pratiques",
  "Aide au déploiement",
  "Ressources complémentaires",
];

export default function MessagingClient({
  initialConversations,
  initialMessages,
  currentUserId = "me",
  recipientId,
  courseTitle,
  locale,
}: MessagingClientProps) {
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [activeConvId, setActiveConvId] = useState<string>(
    initialConversations[0]?.id || "conv-1",
  );
  const [messages, setMessages] = useState<DirectMessage[]>(initialMessages);
  const [newMessageText, setNewMessageText] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConvId]);

  // Handle course-linked pre-fill message if recipientId was passed in query param
  useEffect(() => {
    if (courseTitle && recipientId) {
      setNewMessageText(
        `Bonjour, j'ai une question concernant le cours "${courseTitle}" : `,
      );
    }
  }, [courseTitle, recipientId]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  const filteredConversations = conversations.filter(
    (c) =>
      c.participant.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.participant.role.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessageText.trim();
    if (!trimmed) return;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: activeConvId,
      sender_id: currentUserId,
      receiver_id: activeConversation?.participant.id || "support",
      content: trimmed,
      created_at: new Date().toISOString(),
      is_read: true,
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, newMsg]);
    setNewMessageText("");

    // Update conversation snippet
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              last_message: {
                content: trimmed,
                created_at: new Date().toISOString(),
                sender_id: currentUserId,
                is_read: true,
              },
            }
          : c,
      ),
    );

    // Simulate teacher automated response after 2.5 seconds if this is a demo
    setTimeout(() => {
      const replyMsg: DirectMessage = {
        id: `reply-${Date.now()}`,
        conversation_id: activeConvId,
        sender_id: activeConversation?.participant.id || "teacher",
        receiver_id: currentUserId,
        content: `Merci pour votre message ! Je regarde cela avec attention et reviens vers vous rapidement. Bon travail sur vos projets !`,
        created_at: new Date().toISOString(),
        is_read: true,
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 2500);
  };

  const handleQuickPromptClick = (prompt: string) => {
    setNewMessageText((prev) => (prev ? `${prev} - ${prompt}` : prompt));
  };

  return (
    <div className="grid h-[calc(100vh-14rem)] min-h-[580px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-2xl md:grid-cols-12">
      {/* Sidebar: Conversations */}
      <aside className="flex flex-col border-b border-white/10 md:col-span-5 lg:col-span-4 md:border-b-0 md:border-r">
        {/* Header & Search */}
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Discussions</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/20 text-[10px] font-bold text-brand">
                {conversations.length}
              </span>
            </h2>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Rechercher un formateur ou contact..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:border-brand focus:outline-none transition"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-white/40">
              Aucune conversation trouvée.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = c.id === activeConvId;
              const formattedTime = new Date(
                c.last_message.created_at,
              ).toLocaleTimeString(locale === "ar" ? "ar-DZ" : "fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveConvId(c.id)}
                  className={`group relative w-full flex items-start gap-3.5 p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-white/[0.06] before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-brand"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="relative shrink-0">
                    {c.participant.avatar_url ? (
                      <img
                        src={c.participant.avatar_url}
                        alt={c.participant.name}
                        className="h-11 w-11 rounded-2xl object-cover border border-white/15"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/15 text-sm font-bold text-brand border border-brand/30">
                        {c.participant.name.charAt(0)}
                      </div>
                    )}
                    {c.participant.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="truncate text-xs sm:text-sm font-bold text-white group-hover:text-brand transition-colors">
                        {c.participant.name}
                      </span>
                      <span className="shrink-0 text-[10px] text-white/40 font-mono">
                        {formattedTime}
                      </span>
                    </div>

                    <div className="text-[11px] text-brand/80 truncate font-medium mt-0.5">
                      {c.participant.role}
                    </div>

                    <p className="mt-1 truncate text-xs text-white/60">
                      {c.last_message.content}
                    </p>
                  </div>

                  {c.unread_count > 0 && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-black text-black shadow-md shadow-brand/30">
                      {c.unread_count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Thread */}
      <section className="flex flex-col md:col-span-7 lg:col-span-8 bg-zinc-950/40">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              {activeConversation?.participant.avatar_url ? (
                <img
                  src={activeConversation.participant.avatar_url}
                  alt={activeConversation.participant.name}
                  className="h-10 w-10 rounded-2xl object-cover border border-white/20"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/20 text-sm font-bold text-brand">
                  {activeConversation?.participant.name.charAt(0) || "U"}
                </div>
              )}
              {activeConversation?.participant.online && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-emerald-500" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {activeConversation?.participant.name || "Discussion"}
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-brand">
                  <ShieldCheck className="h-3 w-3" />
                  Formateur certifié
                </span>
              </div>
              <p className="text-xs text-white/50">
                {activeConversation?.participant.role}
                {activeConversation?.participant.online
                  ? " · En ligne"
                  : " · Absent"}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              <Clock className="h-3 w-3 text-brand" />
              Réponse rapide
            </span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {messages.map((m) => {
            const isMe = m.sender_id === currentUserId;
            const time = new Date(m.created_at).toLocaleTimeString(
              locale === "ar" ? "ar-DZ" : "fr-FR",
              { hour: "2-digit", minute: "2-digit" },
            );

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-md rounded-3xl px-5 py-3 text-xs sm:text-sm shadow-md leading-relaxed ${
                    isMe
                      ? "rounded-br-xs bg-brand text-black font-semibold shadow-[0_4px_20px_rgba(95,236,107,0.2)]"
                      : "rounded-bl-xs border border-white/10 bg-zinc-900/90 text-white backdrop-blur-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-white/40 px-1 font-mono">
                  <span>{time}</span>
                  {isMe && <CheckCheck className="h-3 w-3 text-brand" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-6 py-2 border-t border-white/5 bg-zinc-950/60 overflow-x-auto scrollbar-none flex items-center gap-2">
          <span className="text-[10px] text-white/40 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-brand" />
            Suggestions :
          </span>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleQuickPromptClick(prompt)}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 hover:border-brand/40 hover:text-brand transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Composer */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-white/10 p-4 bg-zinc-950/80"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/30 transition">
            <button
              type="button"
              title="Joindre un fichier"
              className="p-2 text-white/40 hover:text-white transition rounded-xl hover:bg-white/5"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <button
              type="button"
              title="Insérer du code"
              onClick={() =>
                setNewMessageText((prev) => prev + "```\n// Votre code\n```")
              }
              className="p-2 text-white/40 hover:text-white transition rounded-xl hover:bg-white/5"
            >
              <Code2 className="h-4 w-4" />
            </button>

            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Posez votre question à votre formateur..."
              className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none"
            />

            <button
              type="button"
              title="Emoji"
              onClick={() => setNewMessageText((prev) => prev + " 💡")}
              className="p-2 text-white/40 hover:text-white transition rounded-xl hover:bg-white/5"
            >
              <Smile className="h-4 w-4" />
            </button>

            <button
              type="submit"
              disabled={!newMessageText.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-black shadow-md shadow-brand/20 transition hover:opacity-90 disabled:opacity-40 active:scale-95"
            >
              <span>Envoyer</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
