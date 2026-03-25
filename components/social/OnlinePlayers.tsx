'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { LEVEL_TITLES } from '@/lib/constants';
import { useChatStore } from '@/stores/useChatStore';

interface OnlinePlayer {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  level: number;
  status: 'online' | 'idle' | 'offline';
  currentPage: string | null;
}

const STATUS_CONFIG: Record<
  string,
  { color: string; bgColor: string; label: string }
> = {
  online: { color: 'bg-emerald-400', bgColor: 'bg-emerald-400/20', label: 'En ligne' },
  idle: { color: 'bg-yellow-400', bgColor: 'bg-yellow-400/20', label: 'Inactif' },
  offline: { color: 'bg-white/20', bgColor: 'bg-white/[0.06]', label: 'Hors ligne' },
};

function getPageLabel(page: string | null): string {
  if (!page) return '';
  const labels: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/quests': 'Quetes',
    '/dashboard/leaderboard': 'Classement',
    '/dashboard/formations': 'Formations',
    '/dashboard/rewards': 'Recompenses',
    '/dashboard/timer': 'Timer',
    '/dashboard/profile': 'Profil',
  };
  return labels[page] ?? '';
}

interface PlayerPopupTriggerProps {
  player: OnlinePlayer;
}

function PlayerPopupTrigger({ player }: PlayerPopupTriggerProps) {
  const openChat = useChatStore((s) => s.openChat);
  const statusConfig = STATUS_CONFIG[player.status] ?? STATUS_CONFIG.offline;
  const pageLabel = getPageLabel(player.currentPage);

  return (
    <motion.button
      type="button"
      onClick={() => openChat(player.userId)}
      initial={{ opacity: 0, x: -12, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -12, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors"
    >
      {/* Avatar */}
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ecs-black-card to-ecs-black-light border border-white/[0.08]">
        {player.avatarUrl ? (
          <img
            src={player.avatarUrl}
            alt={player.fullName}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="font-display text-[10px] font-bold text-ecs-amber">
            {player.fullName.charAt(0).toUpperCase()}
          </span>
        )}

        {/* Status dot */}
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ecs-black',
            statusConfig.color
          )}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-white/80 truncate">
            {player.fullName}
          </span>
          <span className="shrink-0 rounded bg-ecs-amber/10 px-1 py-0.5 text-[9px] font-display font-bold text-ecs-amber">
            {player.level}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          {pageLabel && (
            <span className="text-[10px] text-white/25 truncate">{pageLabel}</span>
          )}
          {!pageLabel && (
            <span className="text-[10px] text-white/20">
              {LEVEL_TITLES[player.level] ?? ''}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export function OnlinePlayers() {
  const supabase = createClient();
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  const loadPlayers = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('presence')
      .select(
        'user_id, status, current_page, last_seen'
      )
      .neq('user_id', user.id)
      .in('status', ['online', 'idle']);

    if (!data || data.length === 0) {
      setPlayers([]);
      return;
    }

    const userIds = data.map((p) => p.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, level')
      .in('id', userIds);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p])
    );

    const onlinePlayers: OnlinePlayer[] = data
      .map((p) => {
        const profile = profileMap.get(p.user_id);
        if (!profile) return null;
        return {
          userId: p.user_id,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          level: profile.level,
          status: p.status as 'online' | 'idle' | 'offline',
          currentPage: p.current_page,
        };
      })
      .filter((p): p is OnlinePlayer => p !== null)
      .sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        return a.fullName.localeCompare(b.fullName);
      });

    setPlayers(onlinePlayers);
  }, [supabase]);

  // Initial load
  useEffect(() => {
    void loadPlayers();
  }, [loadPlayers]);

  // Subscribe to realtime presence changes
  useEffect(() => {
    const channel = supabase
      .channel('presence-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'presence',
        },
        () => {
          void loadPlayers();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, loadPlayers]);

  const totalVisible = players.length;

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden',
        'bg-black/40 backdrop-blur-xl',
        'border border-white/[0.04]'
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Users className="h-4 w-4 text-ecs-gray" />
          </div>
          <span className="text-xs font-display font-semibold text-white/70">
            {totalVisible} joueur{totalVisible !== 1 ? 's' : ''} en ligne
          </span>
          {/* Animated green dot */}
          <motion.div
            className="h-2 w-2 rounded-full bg-emerald-400"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {isExpanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-white/30" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-white/30" />
        )}
      </button>

      {/* Player list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-2 max-h-[300px] overflow-y-auto space-y-0.5">
              {players.length === 0 && (
                <p className="px-2.5 py-4 text-center text-xs text-white/20">
                  Aucun joueur en ligne
                </p>
              )}

              <AnimatePresence mode="popLayout">
                {players.map((player) => (
                  <PlayerPopupTrigger key={player.userId} player={player} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
