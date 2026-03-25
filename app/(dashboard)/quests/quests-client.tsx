'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatXP } from '@/lib/utils';

type QuestType = 'daily' | 'weekly' | 'main' | 'special';

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

const TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  daily: { label: 'Quotidienne', color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/20' },
  weekly: { label: 'Hebdomadaire', color: 'text-purple-400', bgColor: 'bg-purple-400/10', borderColor: 'border-purple-400/20' },
  main: { label: 'Principale', color: 'text-ecs-amber', bgColor: 'bg-ecs-amber/10', borderColor: 'border-ecs-amber/20' },
  special: { label: 'Sp\u00e9ciale', color: 'text-green-400', bgColor: 'bg-green-400/10', borderColor: 'border-green-400/20' },
};

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

export default function QuestsClient({ quests, userId }: QuestsClientProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const dailyQuests = quests.filter((q) => q.quest_type === 'daily');
  const weeklyQuests = quests.filter((q) => q.quest_type === 'weekly');
  const mainQuests = quests.filter((q) => q.quest_type === 'main' || q.quest_type === 'special');

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  function renderQuestCard(quest: QuestWithProgress) {
    const typeConfig = TYPE_CONFIG[quest.quest_type] ?? TYPE_CONFIG.main;
    const statusInfo = getStatusInfo(quest);
    const progress = quest.user_quest?.progress ?? 0;
    const progressPercent = Math.min(100, (progress / quest.required_count) * 100);

    return (
      <motion.div
        key={quest.id}
        variants={itemVariants}
        className="card-ecs flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-display font-medium border',
                  typeConfig.bgColor,
                  typeConfig.color,
                  typeConfig.borderColor
                )}
              >
                {typeConfig.label}
              </span>
              {statusInfo.actionVariant === 'claimed' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-display font-medium bg-green-400/10 text-green-400 border border-green-400/20">
                  &#x2713;
                </span>
              )}
            </div>
            <h3 className="font-display font-bold text-white text-sm mb-1 truncate">
              {quest.title}
            </h3>
            <p className="text-xs text-ecs-gray line-clamp-2">
              {quest.description}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <span className="font-display font-bold text-ecs-amber text-sm">
              +{formatXP(quest.xp_reward)} XP
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-ecs-gray mb-1">
            <span>{statusInfo.label}</span>
            <span>{progress}/{quest.required_count}</span>
          </div>
          <div className="xp-bar">
            <div
              className="xp-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
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
              'mt-auto w-full py-2 rounded-lg text-sm font-display font-bold uppercase tracking-wider transition-all',
              statusInfo.actionVariant === 'primary'
                ? 'btn-primary'
                : 'btn-secondary',
              actionLoading === quest.id && 'opacity-50 cursor-not-allowed'
            )}
          >
            {actionLoading === quest.id ? 'Chargement...' : statusInfo.actionLabel}
          </button>
        )}
      </motion.div>
    );
  }

  function renderSection(title: string, sectionQuests: QuestWithProgress[]) {
    if (sectionQuests.length === 0) return null;

    return (
      <section className="mb-8">
        <h2 className="font-display text-lg font-bold text-white mb-4">
          {title}
        </h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {sectionQuests.map(renderQuestCard)}
        </motion.div>
      </section>
    );
  }

  const hasQuests = quests.length > 0;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
          Qu&ecirc;tes
        </h1>
        <p className="text-ecs-gray text-sm mb-6">
          Accomplissez des qu&ecirc;tes pour gagner de l&apos;XP et progresser.
        </p>
      </motion.div>

      {!hasQuests ? (
        <div className="card-ecs text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-ecs-gray-dark/30 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-ecs-gray"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
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
          <p className="text-ecs-gray text-sm max-w-md mx-auto">
            De nouvelles qu&ecirc;tes seront bient&ocirc;t disponibles. Revenez r&eacute;guli&egrave;rement pour ne rien manquer.
          </p>
        </div>
      ) : (
        <>
          {renderSection('Qu\u00eates du jour', dailyQuests)}
          {renderSection('Qu\u00eates de la semaine', weeklyQuests)}
          {renderSection('Qu\u00eates principales', mainQuests)}
        </>
      )}
    </div>
  );
}
