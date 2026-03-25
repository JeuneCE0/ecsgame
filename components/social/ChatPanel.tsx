'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  ArrowLeft,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useChatStore } from '@/stores/useChatStore';
import type { ChatMessage } from '@/stores/useChatStore';
import { ChatBubble } from '@/components/social/ChatBubble';
import { soundEngine } from '@/lib/game/sound-engine';

const PAGE_SIZE = 50;

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "A l'instant";
  if (diffMin < 60) return `${diffMin}min`;
  if (diffHour < 24) return `${diffHour}h`;
  return `${diffDay}j`;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-white/30"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <span className="text-xs text-white/30 ml-2">en train d&apos;ecrire...</span>
    </div>
  );
}

export function ChatPanel() {
  const supabase = createClient();
  const {
    isPanelOpen,
    activeConversation,
    conversations,
    conversationPreviews,
    isTyping,
    togglePanel,
    openChat,
    closeChat,
    addMessage,
    setMessages,
    prependMessages,
    markRead,
    setConversationPreviews,
    updatePreview,
    incrementUnread,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    void getUser();
  }, [supabase]);

  // Load conversation list
  useEffect(() => {
    if (!currentUserId) return;

    const loadConversations = async () => {
      // Get recent message partners
      const { data: sentMessages } = await supabase
        .from('messages')
        .select('receiver_id, content, created_at')
        .eq('sender_id', currentUserId)
        .order('created_at', { ascending: false });

      const { data: receivedMessages } = await supabase
        .from('messages')
        .select('sender_id, content, created_at, read_at')
        .eq('receiver_id', currentUserId)
        .order('created_at', { ascending: false });

      const partnerMap = new Map<
        string,
        { lastMessage: string; lastMessageAt: string; unread: number }
      >();

      for (const msg of sentMessages ?? []) {
        const existing = partnerMap.get(msg.receiver_id);
        if (!existing || new Date(msg.created_at) > new Date(existing.lastMessageAt)) {
          partnerMap.set(msg.receiver_id, {
            lastMessage: msg.content,
            lastMessageAt: msg.created_at,
            unread: existing?.unread ?? 0,
          });
        }
      }

      for (const msg of receivedMessages ?? []) {
        const existing = partnerMap.get(msg.sender_id);
        const isUnread = !msg.read_at;
        const currentUnread = (existing?.unread ?? 0) + (isUnread ? 1 : 0);

        if (!existing || new Date(msg.created_at) > new Date(existing.lastMessageAt)) {
          partnerMap.set(msg.sender_id, {
            lastMessage: msg.content,
            lastMessageAt: msg.created_at,
            unread: currentUnread,
          });
        } else if (isUnread) {
          partnerMap.set(msg.sender_id, {
            ...existing,
            unread: currentUnread,
          });
        }
      }

      if (partnerMap.size === 0) {
        setConversationPreviews([]);
        return;
      }

      const partnerIds = Array.from(partnerMap.keys());
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, level')
        .in('id', partnerIds);

      const previews = (profiles ?? [])
        .map((p) => {
          const info = partnerMap.get(p.id);
          return {
            userId: p.id,
            fullName: p.full_name,
            avatarUrl: p.avatar_url,
            level: p.level,
            lastMessage: info?.lastMessage ?? '',
            lastMessageAt: info?.lastMessageAt ?? '',
            unreadCount: info?.unread ?? 0,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );

      setConversationPreviews(previews);
    };

    void loadConversations();
  }, [currentUserId, supabase, setConversationPreviews]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversation || !currentUserId) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, read_at, created_at')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${activeConversation}),and(sender_id.eq.${activeConversation},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true })
        .limit(PAGE_SIZE);

      if (data) {
        const messages: ChatMessage[] = data.map((m) => ({
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          content: m.content,
          readAt: m.read_at,
          createdAt: m.created_at,
        }));
        setMessages(activeConversation, messages);
        setHasMore(data.length === PAGE_SIZE);
      }

      // Mark received messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', activeConversation)
        .eq('receiver_id', currentUserId)
        .is('read_at', null);

      markRead(activeConversation);
    };

    void loadMessages();
  }, [activeConversation, currentUserId, supabase, setMessages, markRead]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            sender_id: string;
            receiver_id: string;
            content: string;
            read_at: string | null;
            created_at: string;
          };

          const message: ChatMessage = {
            id: row.id,
            senderId: row.sender_id,
            receiverId: row.receiver_id,
            content: row.content,
            readAt: row.read_at,
            createdAt: row.created_at,
          };

          addMessage(message);
          updatePreview(row.sender_id, row.content, row.created_at);

          // Play notification sound
          soundEngine.playClick();

          // Auto-read if conversation is open
          if (activeConversation === row.sender_id) {
            void supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', row.id);
          } else {
            incrementUnread();
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [
    currentUserId,
    activeConversation,
    supabase,
    addMessage,
    updatePreview,
    incrementUnread,
  ]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversation]);

  // Focus input when opening a conversation
  useEffect(() => {
    if (activeConversation) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeConversation]);

  const loadMore = useCallback(async () => {
    if (!activeConversation || !currentUserId || isLoadingMore || !hasMore) return;

    const existingMessages = conversations.get(activeConversation) ?? [];
    const oldestMessage = existingMessages[0];
    if (!oldestMessage) return;

    setIsLoadingMore(true);

    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, content, read_at, created_at')
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${activeConversation}),and(sender_id.eq.${activeConversation},receiver_id.eq.${currentUserId})`
      )
      .lt('created_at', oldestMessage.createdAt)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (data) {
      const messages: ChatMessage[] = data
        .map((m) => ({
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          content: m.content,
          readAt: m.read_at,
          createdAt: m.created_at,
        }))
        .reverse();

      prependMessages(activeConversation, messages);
      setHasMore(data.length === PAGE_SIZE);
    }

    setIsLoadingMore(false);
  }, [
    activeConversation,
    currentUserId,
    isLoadingMore,
    hasMore,
    conversations,
    supabase,
    prependMessages,
  ]);

  const handleSend = async () => {
    if (!input.trim() || !activeConversation || !currentUserId || isSending) return;

    const content = input.trim();
    setInput('');
    setIsSending(true);

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: activeConversation,
        content,
      })
      .select('id, sender_id, receiver_id, content, read_at, created_at')
      .single();

    if (data && !error) {
      const message: ChatMessage = {
        id: data.id,
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        content: data.content,
        readAt: data.read_at,
        createdAt: data.created_at,
      };
      addMessage(message);
      updatePreview(activeConversation, content, data.created_at);
      soundEngine.playClick();
    }

    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (container.scrollTop === 0 && hasMore) {
      void loadMore();
    }
  };

  const activeMessages = activeConversation
    ? conversations.get(activeConversation) ?? []
    : [];
  const activePartner = conversationPreviews.find(
    (p) => p.userId === activeConversation
  );
  const partnerIsTyping = activeConversation
    ? isTyping.get(activeConversation) ?? false
    : false;

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'fixed right-0 top-0 z-50 flex h-screen w-full max-w-[380px] flex-col',
            'bg-black/80 backdrop-blur-2xl',
            'border-l border-white/[0.06]',
            'shadow-[-8px_0_32px_rgba(0,0,0,0.5)]'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              {activeConversation && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeChat}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </motion.button>
              )}
              <div>
                <h2 className="font-display text-sm font-bold text-white/90">
                  {activePartner?.fullName ?? 'Messages'}
                </h2>
                {!activeConversation && (
                  <p className="text-[10px] text-white/40">
                    {conversationPreviews.length} conversation
                    {conversationPreviews.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePanel}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-white/60 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeConversation ? (
                /* Message view */
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex h-full flex-col"
                >
                  {/* Messages list */}
                  <div
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scroll-smooth"
                  >
                    {isLoadingMore && (
                      <div className="flex justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-white/30" />
                      </div>
                    )}

                    {activeMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                        <MessageSquare className="h-10 w-10 text-white/10" />
                        <p className="text-sm text-white/30">
                          Aucun message. Dites bonjour !
                        </p>
                      </div>
                    )}

                    {activeMessages.map((msg) => (
                      <ChatBubble
                        key={msg.id}
                        content={msg.content}
                        createdAt={msg.createdAt}
                        isSent={msg.senderId === currentUserId}
                        isRead={!!msg.readAt}
                      />
                    ))}

                    {partnerIsTyping && <TypingIndicator />}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t border-white/[0.06] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Envoyer un message..."
                        maxLength={500}
                        className={cn(
                          'flex-1 rounded-xl px-4 py-2.5 text-sm',
                          'bg-white/[0.04] border border-white/[0.06]',
                          'text-white/90 placeholder-white/25',
                          'focus:outline-none focus:border-ecs-amber/30',
                          'transition-colors'
                        )}
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => void handleSend()}
                        disabled={!input.trim() || isSending}
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          'bg-gradient-to-br from-ecs-amber to-ecs-orange',
                          'text-black transition-opacity',
                          (!input.trim() || isSending) && 'opacity-40 cursor-not-allowed'
                        )}
                      >
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Conversation list */
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full overflow-y-auto"
                >
                  {conversationPreviews.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                      <MessageSquare className="h-10 w-10 text-white/10" />
                      <p className="text-sm text-white/30">
                        Pas encore de conversations
                      </p>
                      <p className="text-xs text-white/20">
                        Cliquez sur un joueur pour envoyer un message
                      </p>
                    </div>
                  )}

                  {conversationPreviews.map((preview) => (
                    <motion.button
                      key={preview.userId}
                      type="button"
                      onClick={() => openChat(preview.userId)}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/[0.03]"
                    >
                      {/* Avatar */}
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ecs-black-card to-ecs-black-light border border-white/[0.06]">
                        {preview.avatarUrl ? (
                          <img
                            src={preview.avatarUrl}
                            alt={preview.fullName}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="font-display text-xs font-bold text-ecs-amber">
                            {preview.fullName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white/80 truncate">
                            {preview.fullName}
                          </span>
                          <span className="text-[10px] text-white/25 shrink-0 ml-2">
                            {formatRelativeTime(preview.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-xs text-white/35 truncate mt-0.5">
                          {preview.lastMessage}
                        </p>
                      </div>

                      {/* Unread badge */}
                      {preview.unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                          className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ecs-amber px-1.5 text-[10px] font-bold text-black"
                        >
                          {preview.unreadCount}
                        </motion.span>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
