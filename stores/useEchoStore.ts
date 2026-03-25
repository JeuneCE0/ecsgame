import { create } from 'zustand';

export type EchoMessageType = 'tip' | 'achievement' | 'warning' | 'greeting';

export interface EchoMessage {
  id: string;
  text: string;
  type: EchoMessageType;
  createdAt: number;
}

interface EchoState {
  messages: EchoMessage[];
  isExpanded: boolean;
  isMinimized: boolean;
  lastShownAt: number;

  addMessage: (text: string, type: EchoMessageType) => void;
  dismissMessage: (id: string) => void;
  toggleExpand: () => void;
  minimize: () => void;
}

const MIN_INTERVAL_MS = 5000;

export const useEchoStore = create<EchoState>((set, get) => ({
  messages: [],
  isExpanded: false,
  isMinimized: false,
  lastShownAt: 0,

  addMessage: (text, type) => {
    const now = Date.now();
    const { lastShownAt, messages } = get();

    if (now - lastShownAt < MIN_INTERVAL_MS && type === 'tip') {
      return;
    }

    const isDuplicate = messages.some((m) => m.text === text);
    if (isDuplicate) return;

    const id = `echo-${now}-${Math.random().toString(36).slice(2, 8)}`;

    set({
      messages: [...messages, { id, text, type, createdAt: now }],
      lastShownAt: now,
    });
  },

  dismissMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    })),

  toggleExpand: () =>
    set((state) => ({
      isExpanded: !state.isExpanded,
      isMinimized: false,
    })),

  minimize: () =>
    set({
      isMinimized: true,
      isExpanded: false,
    }),
}));
