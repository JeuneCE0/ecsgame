'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { formatXP } from '@/lib/utils';
import { LEVEL_TITLES } from '@/lib/constants';

type TabKey = 'global' | 'weekly' | 'organization';

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
  total_xp: number;
  weekly_xp: number;
}

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: 'global',
    label: 'Global',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    key: 'weekly',
    label: 'Cette semaine',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    key: 'organization',
    label: 'Organisation',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
];

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
    </svg>
  );
}

function MedalIcon({ rank, className }: { rank: number; className?: string }) {
  if (rank === 1) return <CrownIcon className={className} />;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="9" r="6" />
      <path d="M7 15l-2 7 3.5-2L12 22l3.5-2L19 22l-2-7" />
    </svg>
  );
}

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LeaderboardPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabKey>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (tab: TabKey) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      let query = supabase
        .from('leaderboard_view')
        .select('user_id, full_name, avatar_url, level, total_xp, weekly_xp');

      if (tab === 'weekly') {
        query = query.order('weekly_xp', { ascending: false });
      } else {
        query = query.order('total_xp', { ascending: false });
      }

      query = query.limit(50);

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setEntries((data as LeaderboardEntry[]) ?? []);
    } catch {
      setError('Erreur lors du chargement du classement.');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchLeaderboard(activeTab);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, fetchLeaderboard, supabase]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  function renderPodiumEntry(entry: LeaderboardEntry, rank: number) {
    const isCurrentUser = entry.user_id === currentUserId;
    const isFirst = rank === 1;
    const isSecond = rank === 2;

    const podiumColors = {
      1: { glow: 'shadow-[0_0_40px_rgba(255,191,0,0.3)]', border: 'border-yellow-400/60', ring: 'ring-yellow-400/30', text: 'text-yellow-400', bg: 'from-yellow-400/20 to-yellow-400/5' },
      2: { glow: 'shadow-[0_0_30px_rgba(192,192,192,0.2)]', border: 'border-gray-300/50', ring: 'ring-gray-300/20', text: 'text-gray-300', bg: 'from-gray-300/15 to-gray-300/5' },
      3: { glow: 'shadow-[0_0_30px_rgba(205,127,50,0.2)]', border: 'border-amber-600/50', ring: 'ring-amber-600/20', text: 'text-amber-600', bg: 'from-amber-600/15 to-amber-600/5' },
    };

    const colors = podiumColors[rank as keyof typeof podiumColors];

    return (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: rank === 1 ? 0.1 : rank === 2 ? 0.2 : 0.3, type: 'spring', bounce: 0.3 }}
        className={cn(
          'relative flex flex-col items-center',
          isFirst ? 'order-2 md:-mt-6' : isSecond ? 'order-1 md:mt-4' : 'order-3 md:mt-4'
        )}
      >
        {/* Glow background */}
        <div className={cn(
          'absolute inset-0 rounded-2xl opacity-50 blur-xl',
          rank === 1 && 'bg-yellow-400/10',
          rank === 2 && 'bg-gray-300/10',
          rank === 3 && 'bg-amber-600/10',
        )} />

        <div className={cn(
          'relative rounded-2xl border p-4 md:p-6 w-full',
          'bg-gradient-to-b backdrop-blur-sm',
          colors.bg,
          colors.border,
          colors.glow,
          isCurrentUser && 'ring-2 ring-[#FFBF00]/40'
        )}>
          {/* Crown/Medal */}
          <div className="flex justify-center mb-3">
            <div className={cn(
              'relative',
              isFirst && 'animate-pulse'
            )}>
              <MedalIcon
                rank={rank}
                className={cn('w-8 h-8 md:w-10 md:h-10', colors.text)}
              />
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center mb-3">
            <div className={cn(
              'relative rounded-full p-0.5',
              rank === 1 && 'bg-gradient-to-b from-yellow-400 to-yellow-600',
              rank === 2 && 'bg-gradient-to-b from-gray-300 to-gray-500',
              rank === 3 && 'bg-gradient-to-b from-amber-500 to-amber-700',
            )}>
              <div className={cn(
                'rounded-full bg-[#0C0C0C] flex items-center justify-center overflow-hidden',
                isFirst ? 'w-16 h-16 md:w-20 md:h-20' : 'w-14 h-14 md:w-16 md:h-16'
              )}>
                {entry.avatar_url ? (
                  <img src={entry.avatar_url} alt={entry.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className={cn('font-display font-bold', colors.text, isFirst ? 'text-2xl' : 'text-xl')}>
                    {entry.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <p className={cn(
            'font-display font-bold text-center truncate mb-0.5',
            isFirst ? 'text-base md:text-lg' : 'text-sm md:text-base',
            isCurrentUser ? 'text-[#FFBF00]' : 'text-white'
          )}>
            {entry.full_name}
            {isCurrentUser && <span className="text-[10px] ml-1 text-[#FFBF00]/60">(vous)</span>}
          </p>

          {/* Level badge */}
          <div className="flex justify-center mb-2">
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-medium border',
              colors.text,
              'bg-black/30 border-current/20'
            )}>
              Niv. {entry.level}
            </span>
          </div>

          {/* XP */}
          <div className="text-center">
            <span className={cn('font-display font-bold text-lg md:text-xl', colors.text)}>
              {formatXP(activeTab === 'weekly' ? entry.weekly_xp : entry.total_xp)}
            </span>
            <span className="text-[10px] text-white/40 ml-1">XP</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={childVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFBF00] to-[#FF9D00] flex items-center justify-center shadow-[0_0_20px_rgba(255,191,0,0.3)]">
            <svg className="w-5 h-5 text-[#0C0C0C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
              Classement
            </h1>
            <p className="text-white/40 text-sm">
              Comparez vos performances avec les autres joueurs.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={childVariants}>
        <div className="flex gap-1 p-1 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'relative flex-1 py-3 px-4 rounded-lg text-sm font-display font-medium transition-colors flex items-center justify-center gap-2',
                activeTab === tab.key
                  ? 'text-[#0C0C0C]'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="active-leaderboard-tab"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FFBF00] to-[#FF9D00]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm p-4 text-center text-red-400 text-sm mb-6"
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-4">
          {/* Podium skeleton */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-2xl bg-black/40 backdrop-blur-sm border border-white/5 p-6 animate-pulse',
                  i === 0 ? 'order-2' : i === 1 ? 'order-1 mt-4' : 'order-3 mt-4'
                )}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5" />
                  <div className="w-16 h-16 rounded-full bg-white/5" />
                  <div className="h-4 w-20 rounded bg-white/5" />
                  <div className="h-6 w-16 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
          {/* Table skeleton */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-black/40 backdrop-blur-sm border border-white/5 animate-pulse flex items-center gap-4 p-4"
            >
              <div className="w-8 h-8 rounded-full bg-white/5" />
              <div className="w-10 h-10 rounded-full bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-white/5" />
                <div className="h-3 w-20 rounded bg-white/5" />
              </div>
              <div className="h-4 w-16 rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-black/40 backdrop-blur-sm border border-white/5 text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
            </svg>
          </div>
          <p className="text-white/40 font-display text-lg">Aucun joueur dans le classement.</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Podium - Top 3 */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10 px-2">
                {/* Render in order: 2nd, 1st, 3rd for visual podium */}
                {renderPodiumEntry(top3[1], 2)}
                {renderPodiumEntry(top3[0], 1)}
                {renderPodiumEntry(top3[2], 3)}
              </div>
            )}

            {/* If less than 3 entries, show all in table */}
            {top3.length < 3 && top3.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {top3.map((entry, index) => renderPodiumEntry(entry, index + 1))}
              </div>
            )}

            {/* Rest of leaderboard - Sleek table */}
            {rest.length > 0 && (
              <div className="space-y-2">
                {/* Table header */}
                <div className="hidden md:grid grid-cols-[3rem_3rem_1fr_5rem_6rem_6rem] gap-3 px-5 py-2.5 text-[11px] font-display uppercase tracking-widest text-white/30">
                  <span>Rang</span>
                  <span />
                  <span>Joueur</span>
                  <span className="text-right">Niveau</span>
                  <span className="text-right">XP Total</span>
                  <span className="text-right">XP Semaine</span>
                </div>

                {rest.map((entry, index) => {
                  const rank = index + 4;
                  const isCurrentUser = entry.user_id === currentUserId;

                  return (
                    <motion.div
                      key={entry.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      className={cn(
                        'group relative rounded-xl border p-4 transition-all duration-300',
                        'bg-black/40 backdrop-blur-sm border-white/5',
                        'hover:bg-white/[0.03] hover:border-white/10',
                        isCurrentUser && 'border-[#FFBF00]/40 bg-[#FFBF00]/[0.03] ring-1 ring-[#FFBF00]/20 shadow-[0_0_20px_rgba(255,191,0,0.1)]'
                      )}
                    >
                      {/* Animated gradient border on hover */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-[-1px] rounded-xl bg-gradient-to-r from-[#FFBF00]/20 via-transparent to-[#FF9D00]/20" />
                      </div>

                      {/* Mobile layout */}
                      <div className="flex items-center gap-3 md:hidden relative z-10">
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                          <span className={cn(
                            'font-display font-bold text-sm',
                            isCurrentUser ? 'text-[#FFBF00]' : 'text-white/30'
                          )}>
                            {rank}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                          {entry.avatar_url ? (
                            <img src={entry.avatar_url} alt={entry.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white/40 font-display font-bold text-sm">
                              {entry.full_name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'font-display font-bold text-sm truncate',
                            isCurrentUser ? 'text-[#FFBF00]' : 'text-white'
                          )}>
                            {entry.full_name}
                            {isCurrentUser && <span className="text-xs ml-1 text-[#FFBF00]/50">(vous)</span>}
                          </p>
                          <p className="text-xs text-white/30">
                            Niv. {entry.level} &middot; {LEVEL_TITLES[entry.level] ?? `Niveau ${entry.level}`}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-display font-bold text-sm text-white">{formatXP(entry.total_xp)} XP</p>
                          <p className="text-xs text-[#FFBF00]/60">+{formatXP(entry.weekly_xp)} /sem</p>
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <div className="hidden md:grid grid-cols-[3rem_3rem_1fr_5rem_6rem_6rem] gap-3 items-center relative z-10">
                        <div className="w-8 h-8 flex items-center justify-center">
                          <span className={cn(
                            'font-display font-bold text-sm tabular-nums',
                            isCurrentUser ? 'text-[#FFBF00]' : 'text-white/30'
                          )}>
                            {rank}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                          {entry.avatar_url ? (
                            <img src={entry.avatar_url} alt={entry.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white/40 font-display font-bold text-sm">
                              {entry.full_name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={cn(
                            'font-display font-bold text-sm truncate',
                            isCurrentUser ? 'text-[#FFBF00]' : 'text-white'
                          )}>
                            {entry.full_name}
                            {isCurrentUser && <span className="text-xs ml-1 text-[#FFBF00]/50">(vous)</span>}
                          </p>
                          <p className="text-xs text-white/30">
                            {LEVEL_TITLES[entry.level] ?? `Niveau ${entry.level}`}
                          </p>
                        </div>
                        <p className="text-right font-display text-sm text-white/50 tabular-nums">
                          {entry.level}
                        </p>
                        <p className="text-right font-display font-bold text-sm text-white tabular-nums">
                          {formatXP(entry.total_xp)}
                        </p>
                        <p className="text-right font-display text-sm text-[#FFBF00]/70 tabular-nums">
                          +{formatXP(entry.weekly_xp)}
                        </p>
                      </div>

                      {/* Real-time glow pulse for current user */}
                      {isCurrentUser && (
                        <div className="absolute inset-0 rounded-xl animate-pulse opacity-20 pointer-events-none">
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FFBF00]/10 to-[#FF9D00]/10" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
