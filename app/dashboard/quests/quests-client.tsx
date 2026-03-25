'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatXP } from '@/lib/utils';

type FilterKey = 'all' | 'daily' | 'weekly' | 'main';

interface QuestWithProgress {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  xp_reward: number;
  required_count: number;
  source_filter: string | null;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  user_quest: {
    id: string;
    progress: number;
    status: string;
    completed_at: string | null;
    claimed_at: string | null;
  } | null;
}

interface QuestsClientProps {
  quests: QuestWithProgress[];
  userId: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; gradient: string }> = {
  daily: { label: 'Quotidienne', color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/20', gradient: 'from-blue-400 to-blue-600' },
  weekly: { label: 'Hebdomadaire', color: 'text-purple-400', bgColor: 'bg-purple-400/10', borderColor: 'border-purple-400/20', gradient: 'from-purple-400 to-purple-600' },
  main: { label: 'Principale', color: 'text-[#FFBF00]', bgColor: 'bg-[#FFBF00]/10', borderColor: 'border-[#FFBF00]/20', gradient: 'from-[#FFBF00] to-[#FF9D00]' },
  special: { label: 'Sp\u00e9ciale', color: 'text-green-400', bgColor: 'bg-green-400/10', borderColor: 'border-green-400/20', gradient: 'from-green-400 to-emerald-600' },
};

const FILTERS: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
  {
    key: 'all',
    label: 'Toutes',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    key: 'daily',
    label: 'Quotidiennes',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
  },
  {
    key: 'weekly',
    label: 'Hebdomadaires',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    key: 'main',
    label: 'Principales',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
      </svg>
    ),
  },
];

function SwordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
    </svg>
  );
}

function getStatusInfo(quest: QuestWithProgress): {
  label: string;
  actionLabel: string | null;
  actionVariant: 'primary' | 'secondary' | 'disabled' | 'claimed';
} {
  if (!quest.user_quest) {
    return { label: 'Disponible', actionLabel: 'Commencer', actionVariant: 'primary' };
  }
  if (quest.user_quest.claimed_at) {
    return { label: 'R\u00e9compense r\u00e9clam\u00e9e', actionLabel: null, actionVariant: 'claimed' };
  }
  if (quest.user_quest.status === 'completed') {
    return { label: 'Termin\u00e9e', actionLabel: 'R\u00e9clamer', actionVariant: 'secondary' };
  }
  if (quest.user_quest.status === 'in_progress') {
    return { label: 'En cours', actionLabel: null, actionVariant: 'disabled' };
  }
  if (quest.user_quest.status === 'expired') {
    return { label: 'Expir\u00e9e', actionLabel: null, actionVariant: 'disabled' };
  }
  return { label: 'Disponible', actionLabel: 'Commencer', actionVariant: 'primary' };
}

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.08 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
};

export default function QuestsClient({ quests, userId }: QuestsClientProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filteredQuests = quests.filter((q) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'main') return q.quest_type === 'main' || q.quest_type === 'special';
    return q.quest_type === activeFilter;
  });

  const dailyQuests = filteredQuests.filter((q) => q.quest_type === 'daily');
  const weeklyQuests = filteredQuests.filter((q) => q.quest_type === 'weekly');
  const mainQuests = filteredQuests.filter((q) => q.quest_type === 'main' || q.quest_type === 'special');

  async function handleStartQuest(questId: string) {
    setActionLoading(questId);
    try {
      await fetch('/api/quests/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      });
      window.location.reload();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  }

  async function handleClaimReward(questId: string) {
    setActionLoading(questId);
    try {
      await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      });
      window.location.reload();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  }

  function renderQuestCard(quest: QuestWithProgress) {
    const typeConfig = TYPE_CONFIG[quest.quest_type] ?? TYPE_CONFIG.main;
    const statusInfo = getStatusInfo(quest);
    const progress = quest.user_quest?.progress ?? 0;
    const progressPercent = Math.min(100, (progress / quest.required_count) * 100);
    const isCompleted = statusInfo.actionVariant === 'claimed';

    return (
      <motion.div
        key={quest.id}
        variants={cardVariants}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className={cn(
          'group relative rounded-2xl border p-5 flex flex-col',
          'bg-black/40 backdrop-blur-sm border-white/5',
          'hover:border-white/10 transition-all duration-300',
          isCompleted && 'opacity-70'
        )}
      >
        {/* Animated gradient border on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
          <div className={cn('absolute inset-[-1px] rounded-2xl bg-gradient-to-r opacity-30', typeConfig.gradient.replace('from-', 'from-').replace('to-', 'via-transparent to-'))} />
        </div>

        <div className="relative z-10 flex flex-col flex-1">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-display font-semibold border',
                  typeConfig.bgColor,
                  typeConfig.color,
                  typeConfig.borderColor
                )}
              >
                {typeConfig.label}
              </span>
              {isCompleted && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-400/10 border border-green-400/20">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFBF00]/10 border border-[#FFBF00]/20">
              <svg className="w-3.5 h-3.5 text-[#FFBF00]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              <span className="font-display font-bold text-[#FFBF00] text-xs">
                +{formatXP(quest.xp_reward)}
              </span>
            </div>
          </div>

          {/* Quest info */}
          <h3 className="font-display font-bold text-white text-sm mb-1.5 line-clamp-1">
            {quest.title}
          </h3>
          <p className="text-xs text-white/40 line-clamp-2 mb-4 leading-relaxed">
            {quest.description}
          </p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className={cn(
                'font-display font-medium',
                statusInfo.actionVariant === 'claimed' ? 'text-green-400' :
                statusInfo.actionVariant === 'secondary' ? 'text-[#FFBF00]' :
                'text-white/40'
              )}>
                {statusInfo.label}
              </span>
              <span className="text-white/30 tabular-nums">{progress}/{quest.required_count}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full relative',
                  progressPercent === 100
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : `bg-gradient-to-r ${typeConfig.gradient}`
                )}
              >
                {/* Glow effect */}
                {progressPercent > 0 && progressPercent < 100 && (
                  <div className={cn(
                    'absolute right-0 top-0 bottom-0 w-8 rounded-full blur-sm animate-pulse',
                    `bg-gradient-to-r ${typeConfig.gradient}`
                  )} />
                )}
              </motion.div>
            </div>
          </div>

          {/* Action button */}
          {statusInfo.actionLabel && (
            <button
              onClick={() => {
                if (statusInfo.actionVariant === 'primary') {
                  handleStartQuest(quest.id);
                } else if (statusInfo.actionVariant === 'secondary') {
                  handleClaimReward(quest.id);
                }
              }}
              disabled={actionLoading === quest.id}
              className={cn(
                'mt-auto w-full py-2.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider transition-all duration-300',
                statusInfo.actionVariant === 'primary'
                  ? 'bg-gradient-to-r from-[#FFBF00] to-[#FF9D00] text-[#0C0C0C] hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] hover:scale-[1.02]'
                  : 'bg-gradient-to-r from-green-400 to-emerald-500 text-[#0C0C0C] hover:shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:scale-[1.02] animate-pulse',
                actionLoading === quest.id && 'opacity-50 cursor-not-allowed animate-none'
              )}
            >
              {actionLoading === quest.id ? 'Chargement...' : statusInfo.actionLabel}
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  function renderSection(
    title: string,
    icon: React.ReactNode,
    sectionQuests: QuestWithProgress[],
    accentColor: string
  ) {
    if (sectionQuests.length === 0) return null;

    return (
      <motion.section variants={childVariants} className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center',
            accentColor
          )}>
            {icon}
          </div>
          <h2 className="font-display text-lg font-bold text-white">
            {title}
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          <span className="text-xs text-white/30 font-display">
            {sectionQuests.length} qu&ecirc;te{sectionQuests.length > 1 ? 's' : ''}
          </span>
        </div>
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          animate="visible"
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {sectionQuests.map(renderQuestCard)}
        </motion.div>
      </motion.section>
    );
  }

  const hasQuests = quests.length > 0;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={childVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFBF00] to-[#FF9D00] flex items-center justify-center shadow-[0_0_20px_rgba(255,191,0,0.3)]">
            <svg className="w-5 h-5 text-[#0C0C0C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
              Qu&ecirc;tes
            </h1>
            <p className="text-white/40 text-sm">
              Accomplissez des qu&ecirc;tes pour gagner de l&apos;XP et progresser.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <motion.div variants={childVariants}>
        <div className="flex gap-1 p-1 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5 mb-8 overflow-x-auto">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                'relative flex-1 min-w-[100px] py-2.5 px-3 rounded-lg text-sm font-display font-medium transition-colors flex items-center justify-center gap-2',
                activeFilter === filter.key
                  ? 'text-[#0C0C0C]'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              {activeFilter === filter.key && (
                <motion.div
                  layoutId="active-quest-filter"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FFBF00] to-[#FF9D00]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {filter.icon}
                <span className="hidden md:inline">{filter.label}</span>
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {!hasQuests || filteredQuests.length === 0 ? (
        <motion.div
          variants={childVariants}
          className="rounded-2xl bg-black/40 backdrop-blur-sm border border-white/5 text-center py-20"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white/10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-2">
            Aucune qu&ecirc;te disponible
          </h2>
          <p className="text-white/30 text-sm max-w-md mx-auto">
            De nouvelles qu&ecirc;tes seront bient&ocirc;t disponibles. Revenez r&eacute;guli&egrave;rement pour ne rien manquer.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {(activeFilter === 'all' || activeFilter === 'daily') &&
              renderSection(
                'Qu\u00eates du jour',
                <SwordIcon className="w-5 h-5 text-blue-400" />,
                dailyQuests,
                'bg-blue-400/10 border border-blue-400/20'
              )}
            {(activeFilter === 'all' || activeFilter === 'weekly') &&
              renderSection(
                'Qu\u00eates de la semaine',
                <ShieldIcon className="w-5 h-5 text-purple-400" />,
                weeklyQuests,
                'bg-purple-400/10 border border-purple-400/20'
              )}
            {(activeFilter === 'all' || activeFilter === 'main') &&
              renderSection(
                'Qu\u00eates principales',
                <CrownIcon className="w-5 h-5 text-[#FFBF00]" />,
                mainQuests,
                'bg-[#FFBF00]/10 border border-[#FFBF00]/20'
              )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
