'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { formatXP } from '@/lib/utils';
import { LEVEL_TITLES } from '@/lib/constants';

type TabKey = 'global' | 'weekly' | 'organization';

interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  total_xp: number;
  weekly_xp: number;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'global', label: 'Global' },
  { key: 'weekly', label: 'Cette semaine' },
  { key: 'organization', label: 'Organisation' },
];

function getRankStyle(rank: number): string {
  if (rank === 1) return 'border-yellow-400/50 bg-yellow-400/5';
  if (rank === 2) return 'border-gray-300/50 bg-gray-300/5';
  if (rank === 3) return 'border-amber-600/50 bg-amber-600/5';
  return 'border-ecs-gray-border bg-ecs-black-card';
}

function getRankBadge(rank: number): React.ReactNode {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center">
        <span className="text-yellow-400 font-display font-bold text-sm">1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-300/20 border border-gray-300/40 flex items-center justify-center">
        <span className="text-gray-300 font-display font-bold text-sm">2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-600/20 border border-amber-600/40 flex items-center justify-center">
        <span className="text-amber-600 font-display font-bold text-sm">3</span>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 flex items-center justify-center">
      <span className="text-ecs-gray font-display font-bold text-sm">{rank}</span>
    </div>
  );
}

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
        .select('id, display_name, avatar_url, level, total_xp, weekly_xp');

      if (tab === 'weekly') {
        query = query.order('weekly_xp', { ascending: false });
      } else {
        query = query.order('total_xp', { ascending: false });
      }

      query = query.limit(50);

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setEntries((data as LeaderboardEntry[]) ?? []);
    } catch (err) {
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

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
          Classement
        </h1>
        <p className="text-ecs-gray text-sm mb-6">
          Comparez vos performances avec les autres joueurs.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-ecs-black-light border border-ecs-gray-border mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'relative flex-1 py-2.5 px-4 rounded-md text-sm font-display font-medium transition-colors',
              activeTab === tab.key
                ? 'text-ecs-black'
                : 'text-ecs-gray hover:text-white'
            )}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 rounded-md bg-gradient-amber"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {error && (
        <div className="card-ecs text-center text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="card-ecs animate-pulse flex items-center gap-4 p-4"
            >
              <div className="w-8 h-8 rounded-full bg-ecs-gray-dark" />
              <div className="w-10 h-10 rounded-full bg-ecs-gray-dark" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-ecs-gray-dark" />
                <div className="h-3 w-20 rounded bg-ecs-gray-dark" />
              </div>
              <div className="h-4 w-16 rounded bg-ecs-gray-dark" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="card-ecs text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ecs-gray-dark/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-ecs-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
            </svg>
          </div>
          <p className="text-ecs-gray font-display">Aucun joueur dans le classement.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[3rem_3rem_1fr_6rem_6rem_6rem] gap-3 px-4 py-2 text-xs font-display uppercase tracking-wider text-ecs-gray">
              <span>Rang</span>
              <span />
              <span>Joueur</span>
              <span className="text-right">Niveau</span>
              <span className="text-right">XP Total</span>
              <span className="text-right">XP Semaine</span>
            </div>

            {entries.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.id === currentUserId;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className={cn(
                    'rounded-lg border p-4 transition-colors',
                    getRankStyle(rank),
                    isCurrentUser && 'border-ecs-amber/50 ring-1 ring-ecs-amber/20'
                  )}
                >
                  {/* Mobile layout */}
                  <div className="flex items-center gap-3 md:hidden">
                    {getRankBadge(rank)}
                    <div className="w-10 h-10 rounded-full bg-ecs-gray-dark flex items-center justify-center overflow-hidden flex-shrink-0">
                      {entry.avatar_url ? (
                        <img
                          src={entry.avatar_url}
                          alt={entry.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-ecs-gray font-display font-bold text-sm">
                          {entry.display_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'font-display font-bold text-sm truncate',
                        isCurrentUser ? 'text-ecs-amber' : 'text-white'
                      )}>
                        {entry.display_name}
                        {isCurrentUser && <span className="text-xs ml-1 text-ecs-amber/70">(vous)</span>}
                      </p>
                      <p className="text-xs text-ecs-gray">
                        Niv. {entry.level} &middot; {LEVEL_TITLES[entry.level] ?? `Niveau ${entry.level}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-display font-bold text-sm text-white">{formatXP(entry.total_xp)} XP</p>
                      <p className="text-xs text-ecs-gray">+{formatXP(entry.weekly_xp)} /sem</p>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-[3rem_3rem_1fr_6rem_6rem_6rem] gap-3 items-center">
                    {getRankBadge(rank)}
                    <div className="w-10 h-10 rounded-full bg-ecs-gray-dark flex items-center justify-center overflow-hidden">
                      {entry.avatar_url ? (
                        <img
                          src={entry.avatar_url}
                          alt={entry.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-ecs-gray font-display font-bold text-sm">
                          {entry.display_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={cn(
                        'font-display font-bold text-sm truncate',
                        isCurrentUser ? 'text-ecs-amber' : 'text-white'
                      )}>
                        {entry.display_name}
                        {isCurrentUser && <span className="text-xs ml-1 text-ecs-amber/70">(vous)</span>}
                      </p>
                      <p className="text-xs text-ecs-gray">
                        {LEVEL_TITLES[entry.level] ?? `Niveau ${entry.level}`}
                      </p>
                    </div>
                    <p className="text-right font-display text-sm text-white">
                      {entry.level}
                    </p>
                    <p className="text-right font-display font-bold text-sm text-white">
                      {formatXP(entry.total_xp)}
                    </p>
                    <p className="text-right font-display text-sm text-ecs-amber">
                      +{formatXP(entry.weekly_xp)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
