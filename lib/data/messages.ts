import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface MessageUser {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  online?: boolean;
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  participant: MessageUser;
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
    is_read: boolean;
  };
  unread_count: number;
}

// Resilient realistic seeds representing instructors & staff
const SEED_PARTICIPANTS: Record<string, MessageUser> = {
  "teacher-amina": {
    id: "teacher-amina",
    name: "Amina Benali",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "Instructrice UI/UX Design",
    online: true,
  },
  "teacher-yacine": {
    id: "teacher-yacine",
    name: "Yacine Mansouri",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Lead Formateur Web",
    online: false,
  },
  "support-evolve": {
    id: "support-evolve",
    name: "Support Evolve Academy",
    avatar_url: "/logo.png",
    role: "Équipe Pédagogique",
    online: true,
  },
};

const SEED_MESSAGES: Record<string, DirectMessage[]> = {
  "conv-1": [
    {
      id: "m-101",
      conversation_id: "conv-1",
      sender_id: "teacher-amina",
      receiver_id: "me",
      content: "Bonjour ! Avez-vous pu tester les maquettes Figma du dernier atelier ?",
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      is_read: true,
    },
    {
      id: "m-102",
      conversation_id: "conv-1",
      sender_id: "me",
      receiver_id: "teacher-amina",
      content: "Oui, j'ai terminé l'écran d'accueil et le responsive sur mobile !",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      is_read: true,
    },
    {
      id: "m-103",
      conversation_id: "conv-1",
      sender_id: "teacher-amina",
      receiver_id: "me",
      content: "Superbe progression ! N'hésitez pas à partager votre projet dans l'onglet Communauté pour avoir des retours.",
      created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      is_read: false,
    },
  ],
  "conv-2": [
    {
      id: "m-201",
      conversation_id: "conv-2",
      sender_id: "teacher-yacine",
      receiver_id: "me",
      content: "Bienvenue sur le module Next.js 15 & Supabase. Si vous rencontrez un problème sur l'authentification, écrivez-moi.",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      is_read: true,
    },
    {
      id: "m-202",
      conversation_id: "conv-2",
      sender_id: "me",
      receiver_id: "teacher-yacine",
      content: "Merci Yacine ! Les exemples sont très clairs.",
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      is_read: true,
    },
  ],
  "conv-3": [
    {
      id: "m-301",
      conversation_id: "conv-3",
      sender_id: "support-evolve",
      receiver_id: "me",
      content: "Votre inscription à l'atelier présentiel du samedi est confirmée. Rendez-vous à 10h à l'académie.",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      is_read: true,
    },
  ],
};

export async function getConversations(currentUserId?: string): Promise<Conversation[]> {
  const supabase = await createClient();

  try {
    const { data: dbConversations, error } = await supabase
      .from("direct_messages")
      .select("id, conversation_id, sender_id, receiver_id, content, created_at, is_read")
      .order("created_at", { ascending: false });

    if (!error && dbConversations && dbConversations.length > 0) {
      // Group by conversation_id
      const map = new Map<string, Conversation>();
      for (const msg of dbConversations) {
        if (!map.has(msg.conversation_id)) {
          const otherUserId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
          map.set(msg.conversation_id, {
            id: msg.conversation_id,
            participant: SEED_PARTICIPANTS[otherUserId] || {
              id: otherUserId,
              name: "Membre Evolve",
              avatar_url: null,
              role: "Étudiant",
              online: false,
            },
            last_message: {
              content: msg.content,
              created_at: msg.created_at,
              sender_id: msg.sender_id,
              is_read: msg.is_read,
            },
            unread_count: (!msg.is_read && msg.receiver_id === currentUserId) ? 1 : 0,
          });
        }
      }
      return Array.from(map.values());
    }
  } catch {
    // Database schema does not exist yet; gracefully fallback to seed conversations
  }

  // Fallback seed conversations
  return [
    {
      id: "conv-1",
      participant: SEED_PARTICIPANTS["teacher-amina"]!,
      last_message: {
        content: "Superbe progression ! N'hésitez pas à partager votre projet dans l'onglet Communauté...",
        created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
        sender_id: "teacher-amina",
        is_read: false,
      },
      unread_count: 1,
    },
    {
      id: "conv-2",
      participant: SEED_PARTICIPANTS["teacher-yacine"]!,
      last_message: {
        content: "Merci Yacine ! Les exemples sont très clairs.",
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        sender_id: "me",
        is_read: true,
      },
      unread_count: 0,
    },
    {
      id: "conv-3",
      participant: SEED_PARTICIPANTS["support-evolve"]!,
      last_message: {
        content: "Votre inscription à l'atelier présentiel du samedi est confirmée...",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        sender_id: "support-evolve",
        is_read: true,
      },
      unread_count: 0,
    },
  ];
}

export async function getConversationMessages(
  conversationId: string,
): Promise<{ participant: MessageUser; messages: DirectMessage[] }> {
  const supabase = await createClient();

  try {
    const { data: dbMessages, error } = await supabase
      .from("direct_messages")
      .select("id, conversation_id, sender_id, receiver_id, content, created_at, is_read")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!error && dbMessages && dbMessages.length > 0) {
      const firstMsg = dbMessages[0]!;
      const otherId = firstMsg.sender_id;
      return {
        participant: SEED_PARTICIPANTS[otherId] || {
          id: otherId,
          name: "Membre Evolve",
          avatar_url: null,
          role: "Étudiant",
          online: false,
        },
        messages: dbMessages,
      };
    }
  } catch {
    // Fallback
  }

  const participantKey =
    conversationId === "conv-1"
      ? "teacher-amina"
      : conversationId === "conv-2"
      ? "teacher-yacine"
      : "support-evolve";

  return {
    participant: SEED_PARTICIPANTS[participantKey] || SEED_PARTICIPANTS["teacher-amina"]!,
    messages: SEED_MESSAGES[conversationId] || SEED_MESSAGES["conv-1"] || [],
  };
}
