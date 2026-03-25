'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, Swords, Star, Zap, Crown, Shield, Coins } from 'lucide-react';
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

const questTypeBadge: Record<QuestType, {
  label: string;
  bgClass: string;
  textClass: string;
  borderColor: string;
  glowColor: string;
  icon: React.ReactNode;
}> = {
  daily: {
    label: 'Quotidien',
    bgClass: 'bg-sky-500/10',
    textClass: 'text-sky-400',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    glowColor: 'rgba(56, 189, 248, 0.15)',
    icon: <Swords className="h-3.5 w-3.5" />,
  },
  weekly: {
    label: 'Hebdo',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    glowColor: 'rgba(168, 85, 247, 0.15)',
    icon: <Shield className="h-3.5 w-3.5" />,
  },
  main: {
    label: 'Principal',
    bgClass: 'bg-ecs-amber/10',
    textClass: 'text-ecs-amber',
    borderColor: 'rgba(255, 191, 0, 0.3)',
    glowColor: 'rgba(255, 191, 0, 0.15)',
    icon: <Crown className="h-3.5 w-3.5" />,
  },
  special: {
    label: 'Special',
    bgClass: 'bg-ecs-orange/10',
    textClass: 'text-ecs-orange',
    borderColor: 'rgba(255, 157, 0, 0.3)',
    glowColor: 'rgba(255, 157, 0, 0.15)',
    icon: <Zap className="h-3.5 w-3.5" />,
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
  const isInProgress = quest.status === 'in_progress';

  return (
    <motion.div
      className="relative group"
      whileHover={{ y: -6, rotateX: 2, rotateY: -1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ perspective: 800 }}
    >
      {/* Animated gradient border wrapper */}
      <div
        className="absolute -inset-[1px] rounded-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: isCompleted
            ? 'linear-gradient(135deg, #FFBF00, #FF9D00, #FFBF00)'
            : `linear-gradient(135deg, ${badge.borderColor}, transparent 40%, transparent 60%, ${badge.borderColor})`,
        }}
      />

      {/* Card body */}
      <div
        className={cn(
          'relative rounded-xl p-5 overflow-hidden transition-shadow duration-300',
          'bg-gradient-to-br from-ecs-black-card to-[#111111]',
          'group-hover:shadow-[0_8px_32px_rgba(255,191,0,0.12)]'
        )}
      >
        {/* Background glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${badge.glowColor} 0%, transparent 70%)`,
          }}
        />

        {/* Completed shimmer overlay */}
        {isCompleted && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            <div
              className="absolute inset-0 animate-shimmer-sweep"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 191, 0, 0.08) 50%, transparent 100%)',
                width: '50%',
              }}
            />
          </div>
        )}

        <div className="relative z-10">
          {/* Header: badge + XP reward */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              {/* Quest type badge */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-display font-bold uppercase tracking-wider',
                    badge.bgClass,
                    badge.textClass
                  )}
                  style={{ borderColor: badge.borderColor }}
                >
                  {badge.icon}
                  {badge.label}
                </span>

                {isCompleted && (
                  <motion.span
                    className="inline-flex items-center gap-1 text-xs font-display font-bold text-green-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Terminee
                  </motion.span>
                )}
              </div>

              {/* Quest title */}
              <h3 className="font-display font-bold text-white text-lg leading-tight">
                {quest.title}
              </h3>
              <p className="text-sm text-ecs-gray mt-1.5 line-clamp-2 leading-relaxed">
                {quest.description}
              </p>
            </div>

            {/* XP Reward coin */}
            <motion.div
              className="flex flex-col items-center gap-1 shrink-0"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
                  boxShadow: '0 0 12px rgba(255, 191, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                <Coins className="h-5 w-5 text-ecs-black" />
              </div>
              <span className="text-xs font-display font-bold text-gradient-amber">
                +{formatXP(quest.xpReward)}
              </span>
            </motion.div>
          </div>

          {/* Progress section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ecs-gray font-display">
                {quest.progress} / {quest.requiredCount}
              </span>
              <span className="font-display font-bold text-gradient-amber">
                {progressPercent}%
              </span>
            </div>

            {/* Progress bar with glow */}
            <div
              className="h-2 rounded-full overflow-hidden relative"
              style={{
                background: '#1A1A1A',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
              }}
            >
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  background: isCompleted
                    ? 'linear-gradient(90deg, #FFBF00, #FF9D00)'
                    : 'linear-gradient(90deg, #FFBF00, #FF9D00)',
                  boxShadow: progressPercent > 0
                    ? '0 0 8px rgba(255, 191, 0, 0.4)'
                    : 'none',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{
                  type: 'spring',
                  stiffness: 80,
                  damping: 18,
                }}
              >
                {/* Shimmer on progress bar */}
                <div
                  className="absolute inset-0 animate-shimmer-sweep"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                    width: '40%',
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Action buttons */}
          {isCompleted && onClaim && (
            <motion.button
              className="mt-5 w-full flex items-center justify-center gap-2 text-sm font-display font-bold uppercase tracking-wider
                         bg-gradient-amber text-ecs-black px-6 py-3 rounded-lg animate-pulse-glow"
              onClick={() => onClaim(quest.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <CheckCircle className="h-4 w-4" />
              Reclamer
            </motion.button>
          )}

          {isInProgress && (
            <div className="mt-5 w-full flex items-center justify-center gap-2 text-sm font-display uppercase tracking-wider text-ecs-gray border border-ecs-gray-border rounded-lg px-6 py-3">
              <Clock className="h-4 w-4" />
              En cours...
            </div>
          )}

          {isClaimed && (
            <div className="mt-5 text-center text-sm text-ecs-gray/50 font-display uppercase tracking-wider">
              <Star className="h-4 w-4 inline mr-1 opacity-50" />
              Expiree
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
