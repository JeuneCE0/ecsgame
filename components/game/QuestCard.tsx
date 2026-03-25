'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, Swords, Star, Zap } from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';

type QuestType = 'daily' | 'weekly' | 'main' | 'special';
type QuestStatus = 'available' | 'in_progress' | 'completed' | 'expired';

interface QuestCardProps {
  quest: {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    questType: QuestType;
    progress: number;
    requiredCount: number;
    status: QuestStatus;
  };
  onClaim?: (questId: string) => void;
}

const questTypeBadge: Record<QuestType, { label: string; className: string; icon: React.ReactNode }> = {
  daily: {
    label: 'Quotidien',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: <Clock className="h-3 w-3" />,
  },
  weekly: {
    label: 'Hebdo',
    className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    icon: <Star className="h-3 w-3" />,
  },
  main: {
    label: 'Principal',
    className: 'bg-ecs-amber/10 text-ecs-amber border-ecs-amber/20',
    icon: <Swords className="h-3 w-3" />,
  },
  special: {
    label: 'Spécial',
    className: 'bg-ecs-orange/10 text-ecs-orange border-ecs-orange/20',
    icon: <Zap className="h-3 w-3" />,
  },
};

export function QuestCard({ quest, onClaim }: QuestCardProps) {
  const badge = questTypeBadge[quest.questType];
  const progressPercent =
    quest.requiredCount > 0
      ? Math.min(100, Math.round((quest.progress / quest.requiredCount) * 100))
      : 0;
  const isCompleted = quest.status === 'completed';
  const isClaimed = quest.status === 'expired';

  return (
    <motion.div
      className={cn(
        'card-ecs relative overflow-hidden',
        isCompleted && 'border-ecs-amber/30'
      )}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                badge.className
              )}
            >
              {badge.icon}
              {badge.label}
            </span>
          </div>
          <h3 className="font-display font-bold text-white truncate">
            {quest.title}
          </h3>
          <p className="text-sm text-ecs-gray mt-1 line-clamp-2">
            {quest.description}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-sm font-bold text-ecs-amber">
            +{formatXP(quest.xpReward)}
          </span>
          <span className="text-xs text-ecs-gray">XP</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-ecs-gray">
          <span>
            {quest.progress} / {quest.requiredCount}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className="xp-bar">
          <motion.div
            className="xp-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
          />
        </div>
      </div>

      {isCompleted && onClaim && (
        <motion.button
          className="btn-primary mt-4 w-full flex items-center justify-center gap-2 text-sm"
          onClick={() => onClaim(quest.id)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CheckCircle className="h-4 w-4" />
          Réclamer
        </motion.button>
      )}

      {quest.status === 'in_progress' && (
        <button
          className="btn-secondary mt-4 w-full text-sm opacity-50 cursor-not-allowed"
          disabled
        >
          En cours...
        </button>
      )}

      {isClaimed && (
        <div className="mt-4 text-center text-sm text-ecs-gray">
          Expirée
        </div>
      )}
    </motion.div>
  );
}
