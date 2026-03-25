'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, Shield, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type RewardType = 'bonus_xp' | 'limited_quest' | 'streak_protection';

interface ExpiringReward {
  id: string;
  type: RewardType;
  label: string;
  description: string;
  /** Expiration timestamp in ms */
  expiresAt: number;
  /** XP or token value */
  value: number;
}

interface ExpiringRewardsProps {
  rewards: ExpiringReward[];
  onClaim: (rewardId: string) => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Reward type config                                                 */
/* ------------------------------------------------------------------ */

interface RewardTypeConfig {
  icon: typeof Zap;
  color: string;
  bgColor: string;
  borderColor: string;
}

const REWARD_TYPE_MAP: Record<RewardType, RewardTypeConfig> = {
  bonus_xp: {
    icon: Zap,
    color: '#FFBF00',
    bgColor: 'rgba(255, 191, 0, 0.1)',
    borderColor: 'rgba(255, 191, 0, 0.25)',
  },
  limited_quest: {
    icon: Star,
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  streak_protection: {
    icon: Shield,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
};

/* ------------------------------------------------------------------ */
/*  Urgency levels                                                     */
/* ------------------------------------------------------------------ */

type UrgencyLevel = 'normal' | 'warning' | 'critical' | 'flash';

function getUrgencyLevel(msRemaining: number): UrgencyLevel {
  const minutes = msRemaining / (1000 * 60);
  if (minutes < 15) return 'flash';
  if (minutes < 60) return 'critical';
  if (minutes < 180) return 'warning';
  return 'normal';
}

const URGENCY_STYLES: Record<UrgencyLevel, { borderColor: string; textColor: string }> = {
  normal: { borderColor: 'rgba(255, 191, 0, 0.2)', textColor: 'text-ecs-amber' },
  warning: { borderColor: 'rgba(249, 115, 22, 0.35)', textColor: 'text-orange-400' },
  critical: { borderColor: 'rgba(239, 68, 68, 0.4)', textColor: 'text-red-400' },
  flash: { borderColor: 'rgba(239, 68, 68, 0.6)', textColor: 'text-red-400' },
};

/* ------------------------------------------------------------------ */
/*  Countdown hook                                                     */
/* ------------------------------------------------------------------ */

function useCountdown(expiresAt: number): { timeLeft: string; msRemaining: number; urgency: UrgencyLevel } {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const msRemaining = Math.max(0, expiresAt - now);
  const urgency = getUrgencyLevel(msRemaining);

  const totalSeconds = Math.floor(msRemaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let timeLeft: string;
  if (hours > 0) {
    timeLeft = `${hours}h${String(minutes).padStart(2, '0')}m`;
  } else if (minutes > 0) {
    timeLeft = `${minutes}m${String(seconds).padStart(2, '0')}s`;
  } else {
    timeLeft = `${seconds}s`;
  }

  return { timeLeft, msRemaining, urgency };
}

/* ------------------------------------------------------------------ */
/*  Single reward card                                                 */
/* ------------------------------------------------------------------ */

function RewardCard({
  reward,
  onClaim,
}: {
  reward: ExpiringReward;
  onClaim: (id: string) => void;
}) {
  const { timeLeft, msRemaining, urgency } = useCountdown(reward.expiresAt);
  const config = REWARD_TYPE_MAP[reward.type];
  const urgencyStyle = URGENCY_STYLES[urgency];
  const Icon = config.icon;
  const isExpired = msRemaining <= 0;

  return (
    <motion.div
      className={cn(
        'relative shrink-0 w-52 rounded-xl border overflow-hidden',
        isExpired && 'opacity-40 pointer-events-none',
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(12, 12, 12, 0.98) 100%)',
        border: `1px solid ${urgency === 'flash' || urgency === 'critical' ? urgencyStyle.borderColor : config.borderColor}`,
        backdropFilter: 'blur(12px)',
      }}
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {/* Urgency flash effect for < 15min */}
      {urgency === 'flash' && !isExpired && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            boxShadow: 'inset 0 0 20px rgba(239, 68, 68, 0.15)',
          }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Top border pulse for critical/flash */}
      {(urgency === 'critical' || urgency === 'flash') && !isExpired && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, #EF4444, transparent)' }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: urgency === 'flash' ? 0.5 : 1.2, repeat: Infinity }}
        />
      )}

      <div className="p-4">
        {/* Header: icon + countdown */}
        <div className="flex items-center justify-between mb-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{
              background: config.bgColor,
              border: `1px solid ${config.borderColor}`,
            }}
          >
            <Icon className="h-4 w-4" style={{ color: config.color }} />
          </div>

          <div className="flex items-center gap-1">
            <Clock className={cn('h-3 w-3', urgencyStyle.textColor)} />
            <motion.span
              className={cn('text-xs font-display font-bold tabular-nums', urgencyStyle.textColor)}
              animate={
                urgency === 'flash'
                  ? { opacity: [1, 0.3, 1] }
                  : urgency === 'critical'
                    ? { opacity: [1, 0.6, 1] }
                    : undefined
              }
              transition={
                urgency === 'flash'
                  ? { duration: 0.5, repeat: Infinity }
                  : urgency === 'critical'
                    ? { duration: 1, repeat: Infinity }
                    : undefined
              }
            >
              {isExpired ? 'Expire' : timeLeft}
            </motion.span>
          </div>
        </div>

        {/* Label */}
        <p className="font-display text-sm font-bold text-white/90 mb-1 truncate">
          {reward.label}
        </p>
        <p className="text-[11px] text-ecs-gray font-body leading-snug line-clamp-2 mb-3">
          {reward.description}
        </p>

        {/* Value badge */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-display font-bold"
            style={{ color: config.color }}
          >
            +{reward.value} {reward.type === 'streak_protection' ? 'token' : 'XP'}
          </span>

          <motion.button
            className="px-3 py-1.5 rounded-lg text-[11px] font-display font-bold uppercase tracking-wider text-ecs-black"
            style={{
              background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
              boxShadow: '0 0 8px rgba(255, 191, 0, 0.2)',
            }}
            onClick={() => onClaim(reward.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reclamer
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ExpiringRewards({ rewards, onClaim, className }: ExpiringRewardsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeRewards = rewards.filter((r) => r.expiresAt > Date.now());
  const soonestExpiry = activeRewards.reduce<number>(
    (min, r) => Math.min(min, r.expiresAt),
    Infinity,
  );

  const { timeLeft: soonestTimeLeft, urgency: soonestUrgency } = useCountdown(
    soonestExpiry === Infinity ? Date.now() : soonestExpiry,
  );

  const toggleExpand = useCallback(() => setIsExpanded((prev) => !prev), []);

  if (activeRewards.length === 0) return null;

  const urgencyStyle = URGENCY_STYLES[soonestUrgency];

  return (
    <div className={cn('relative', className)}>
      {/* Compact banner */}
      <motion.button
        className="w-full flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(12, 12, 12, 0.98) 100%)',
          border: `1px solid ${urgencyStyle.borderColor}`,
          backdropFilter: 'blur(12px)',
        }}
        onClick={toggleExpand}
        whileTap={{ scale: 0.99 }}
      >
        {/* Pulsing clock */}
        <motion.div
          animate={
            soonestUrgency !== 'normal'
              ? { scale: [1, 1.15, 1] }
              : undefined
          }
          transition={{
            duration: soonestUrgency === 'flash' ? 0.6 : 1.5,
            repeat: Infinity,
          }}
        >
          <Clock className={cn('h-4 w-4', urgencyStyle.textColor)} />
        </motion.div>

        <div className="flex-1 text-left">
          <span className="text-sm font-display font-bold text-white/90">
            {activeRewards.length} recompense{activeRewards.length > 1 ? 's' : ''} expire{activeRewards.length > 1 ? 'nt' : ''}
          </span>
          <span className={cn('ml-2 text-xs font-display font-bold tabular-nums', urgencyStyle.textColor)}>
            Prochaine dans {soonestTimeLeft}
          </span>
        </div>

        {/* Badge count */}
        <motion.span
          className="flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-display font-bold text-ecs-black"
          style={{
            background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {activeRewards.length}
        </motion.span>

        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-ecs-gray" />
        ) : (
          <ChevronDown className="h-4 w-4 text-ecs-gray" />
        )}
      </motion.button>

      {/* Expanded: horizontal scroll of reward cards */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="overflow-hidden"
          >
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto py-3 px-1 scrollbar-hide"
              style={{ scrollbarWidth: 'none' }}
            >
              {activeRewards
                .sort((a, b) => a.expiresAt - b.expiresAt)
                .map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 22 }}
                  >
                    <RewardCard reward={reward} onClaim={onClaim} />
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
