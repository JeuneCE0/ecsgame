import { create } from 'zustand';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

interface ConversationPreview {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  level: number;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface ChatState {
  conversations: Map<string, ChatMessage[]>;
  conversationPreviews: ConversationPreview[];
  activeConversation: string | null;
  unreadCount: number;
  isPanelOpen: boolean;
  isTyping: Map<string, boolean>;

  openChat: (userId: string) => void;
  closeChat: () => void;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (userId: string, messages: ChatMessage[]) => void;
  prependMessages: (userId: string, messages: ChatMessage[]) => void;
  markRead: (userId: string) => void;
  setConversationPreviews: (previews: ConversationPreview[]) => void;
  updatePreview: (userId: string, lastMessage: string, lastMessageAt: string) => void;
  setTyping: (userId: string, typing: boolean) => void;
  incrementUnread: () => void;
  decrementUnread: (count: number) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: new Map(),
  conversationPreviews: [],
  activeConversation: null,
  unreadCount: 0,
  isPanelOpen: false,
  isTyping: new Map(),

  openChat: (userId) =>
    set({
      activeConversation: userId,
      isPanelOpen: true,
    }),

  closeChat: () =>
    set({
      activeConversation: null,
    }),

  togglePanel: () =>
    set((state) => ({
      isPanelOpen: !state.isPanelOpen,
      activeConversation: state.isPanelOpen ? null : state.activeConversation,
    })),

  setPanelOpen: (open) =>
    set({
      isPanelOpen: open,
      activeConversation: open ? get().activeConversation : null,
    }),

  addMessage: (message) =>
    set((state) => {
      const otherUserId =
        message.senderId === get().activeConversation
          ? message.senderId
          : message.receiverId === get().activeConversation
            ? message.receiverId
            : message.senderId;

      const conversationKey = otherUserId;
      const existing = state.conversations.get(conversationKey) ?? [];
      const alreadyExists = existing.some((m) => m.id === message.id);

      if (alreadyExists) return state;

      const updated = new Map(state.conversations);
      updated.set(conversationKey, [...existing, message]);

      return { conversations: updated };
    }),

  setMessages: (userId, messages) =>
    set((state) => {
      const updated = new Map(state.conversations);
      updated.set(userId, messages);
      return { conversations: updated };
    }),

  prependMessages: (userId, messages) =>
    set((state) => {
      const existing = state.conversations.get(userId) ?? [];
      const existingIds = new Set(existing.map((m) => m.id));
      const newMessages = messages.filter((m) => !existingIds.has(m.id));
      const updated = new Map(state.conversations);
      updated.set(userId, [...newMessages, ...existing]);
      return { conversations: updated };
    }),

  markRead: (userId) =>
    set((state) => {
      const previews = state.conversationPreviews.map((p) =>
        p.userId === userId ? { ...p, unreadCount: 0 } : p
      );
      const totalUnread = previews.reduce((acc, p) => acc + p.unreadCount, 0);
      return { conversationPreviews: previews, unreadCount: totalUnread };
    }),

  setConversationPreviews: (previews) =>
    set({
      conversationPreviews: previews,
      unreadCount: previews.reduce((acc, p) => acc + p.unreadCount, 0),
    }),

  updatePreview: (userId, lastMessage, lastMessageAt) =>
    set((state) => {
      const exists = state.conversationPreviews.find((p) => p.userId === userId);
      if (!exists) return state;

      const previews = state.conversationPreviews
        .map((p) =>
          p.userId === userId ? { ...p, lastMessage, lastMessageAt } : p
        )
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );

      return { conversationPreviews: previews };
    }),

  setTyping: (userId, typing) =>
    set((state) => {
      const updated = new Map(state.isTyping);
      updated.set(userId, typing);
      return { isTyping: updated };
    }),

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  decrementUnread: (count) =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - count),
    })),
}));

export type { ChatMessage, ConversationPreview };
