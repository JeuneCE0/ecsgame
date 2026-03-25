'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock } from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';
import { AvatarDisplay } from '@/components/game/AvatarDisplay';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  actionText: string;
  xpAmount: number | null;
  createdAt: string;
}

interface ActivityFeedProps {
  organizationId: string;
  initialItems?: ActivityItem[];
  autoFadeMs?: number;
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 10) return "à l'instant";
  if (diffSeconds < 60) return `il y a ${diffSeconds}s`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `il y a ${diffMinutes}min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `il y a ${diffDays}j`;
}

function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative mb-4"
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.08), rgba(255, 157, 0, 0.04))',
            border: '1px solid rgba(255, 191, 0, 0.1)',
          }}
        >
          <Clock className="h-6 w-6 text-ecs-gray/50" />
        </div>
      </motion.div>
      <p className="text-sm font-display text-ecs-gray/60 text-center">
        Aucune activité récente
      </p>
      <p className="text-xs text-ecs-gray/40 mt-1">
        Les actions de votre équipe apparaîtront ici
      </p>
    </motion.div>
  );
}

function ActivityRow({
  item,
  onFade,
}: {
  item: ActivityItem;
  onFade: (id: string) => void;
}) {
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fadeTimerRef.current = setTimeout(() => {
      onFade(item.id);
    }, 30_000);

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [item.id, onFade]);

  return (
    <motion.div
      layout
      className={cn(
        'flex items-center gap-3 rounded-xl border border-white/[0.04] p-3',
        'bg-ecs-black-card/60 backdrop-blur-sm'
      )}
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}
      initial={{ opacity: 0, y: -40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 25,
      }}
    >
      <AvatarDisplay
        avatarUrl={item.avatarUrl}
        name={item.userName}
        size="sm"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <span className="font-display font-bold text-white">
            {item.userName}
          </span>{' '}
          <span className="text-ecs-gray">{item.actionText}</span>
        </p>
        <p className="text-[10px] text-ecs-gray/60 mt-0.5 font-display uppercase tracking-wider">
          {timeAgo(item.createdAt)}
        </p>
      </div>

      {item.xpAmount !== null && item.xpAmount > 0 && (
        <motion.div
          className="shrink-0 flex items-center gap-1 rounded-lg px-2 py-1"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.12), rgba(255, 157, 0, 0.06))',
            border: '1px solid rgba(255, 191, 0, 0.15)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 18,
            delay: 0.15,
          }}
        >
          <Sparkles className="h-3 w-3 text-ecs-amber" />
          <span className="text-xs font-display font-bold text-ecs-amber">
            +{formatXP(item.xpAmount)}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

export function ActivityFeed({
  organizationId,
  initialItems = [],
  autoFadeMs = 30_000,
}: ActivityFeedProps) {
  const [items, setItems] = useState<ActivityItem[]>(initialItems);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handleFade = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    const supabase = createClient();

    channelRef.current = supabase
      .channel(`activity-feed-${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'xp_events',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          const record = payload.new as {
            id: string;
            user_id: string;
            user_name: string;
            avatar_url?: string;
            action_text: string;
            xp_amount: number | null;
            created_at: string;
          };

          const newItem: ActivityItem = {
            id: record.id,
            userId: record.user_id,
            userName: record.user_name,
            avatarUrl: record.avatar_url,
            actionText: record.action_text,
            xpAmount: record.xp_amount,
            createdAt: record.created_at,
          };

          setItems((prev) => [newItem, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [organizationId, autoFadeMs]);

  return (
    <div
      className="rounded-xl border border-ecs-gray-border p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="flex h-2 w-2 rounded-full"
            style={{
              background: '#22C55E',
              boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)',
            }}
          />
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white/80">
            Activité en direct
          </h3>
        </div>
        <span className="text-[10px] font-display text-ecs-gray/60 uppercase tracking-widest">
          {items.length} récent{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Feed list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            items.map((item) => (
              <ActivityRow
                key={item.id}
                item={item}
                onFade={handleFade}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Bottom fade gradient */}
      {items.length > 4 && (
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent, #0F0F0F)',
          }}
        />
      )}
    </div>
  );
}
