'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  ListChecks,
  Flame,
  TrendingUp,
  GraduationCap,
  Gift,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/usePlayerStore';

/* ------------------------------------------------------------------ */
/*  Suggestion types                                                   */
/* ------------------------------------------------------------------ */

type SuggestionUrgency = 'low' | 'medium' | 'high';

interface Suggestion {
  id: string;
  icon: React.ReactNode;
  message: string;
  cta: string;
  href: string;
  urgency: SuggestionUrgency;
}

interface NextActionSuggesterProps {
  xpToday: number;
  pendingQuests: number;
  xpToNextLevel: number;
  nextLevel: number;
  hasFormations: boolean;
  hasRewardsToClaim: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Urgency styles                                                     */
/* ------------------------------------------------------------------ */

const urgencyStyles: Record<SuggestionUrgency, {
  borderColor: string;
  glowColor: string;
  pulse: boolean;
}> = {
  low: {
    borderColor: 'rgba(255,191,0,0.15)',
    glowColor: 'rgba(255,191,0,0.05)',
    pulse: false,
  },
  medium: {
    borderColor: 'rgba(255,191,0,0.3)',
    glowColor: 'rgba(255,191,0,0.08)',
    pulse: false,
  },
  high: {
    borderColor: 'rgba(255,157,0,0.5)',
    glowColor: 'rgba(255,157,0,0.12)',
    pulse: true,
  },
};

/* ------------------------------------------------------------------ */
/*  Suggestion card                                                    */
/* ------------------------------------------------------------------ */

function SuggestionCard({ suggestion, index }: { suggestion: Suggestion; index: number }) {
  const style = urgencyStyles[suggestion.urgency];

  return (
    <motion.a
      href={suggestion.href}
      className={cn(
        'group relative block rounded-xl p-4 overflow-hidden transition-all duration-300',
        style.pulse && 'animate-pulse-border',
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(26,26,26,0.85) 0%, rgba(12,12,12,0.9) 100%)',
        border: `1px solid ${style.borderColor}`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 16px ${style.glowColor}`,
        backdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: index * 0.08 }}
      whileHover={{ y: -2, scale: 1.01 }}
    >
      {/* Background glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${style.glowColor} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex items-center gap-3">
        {/* Icon */}
        <div
          className="flex shrink-0 items-center justify-center h-10 w-10 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(255,191,0,0.12), rgba(255,157,0,0.06))',
            border: '1px solid rgba(255,191,0,0.2)',
          }}
        >
          {suggestion.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-display font-bold leading-snug">
            {suggestion.message}
          </p>
        </div>

        {/* CTA */}
        <div
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider text-ecs-black transition-transform group-hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
            boxShadow: '0 0 8px rgba(255,191,0,0.2)',
          }}
        >
          {suggestion.cta}
        </div>
      </div>

      {/* Urgency indicator bar */}
      {suggestion.urgency === 'high' && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent, #FF9D00, transparent)',
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.a>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function NextActionSuggester({
  xpToday,
  pendingQuests,
  xpToNextLevel,
  nextLevel,
  hasFormations,
  hasRewardsToClaim,
  className,
}: NextActionSuggesterProps) {
  const currentStreak = usePlayerStore((s) => s.currentStreak);

  const suggestions = useMemo(() => {
    const result: Suggestion[] = [];

    /* No XP today — most urgent for engagement */
    if (xpToday === 0) {
      result.push({
        id: 'first-xp',
        icon: <Zap className="h-5 w-5 text-ecs-amber" />,
        message: 'Log ta premiere action du jour !',
        cta: 'Logger',
        href: '/dashboard',
        urgency: 'high',
      });
    }

    /* Streak about to break */
    if (currentStreak > 0 && xpToday === 0) {
      const hour = new Date().getHours();
      const urgency: SuggestionUrgency = hour >= 22 ? 'high' : hour >= 18 ? 'medium' : 'low';
      result.push({
        id: 'streak-danger',
        icon: <Flame className="h-5 w-5 text-ecs-orange" />,
        message: `Maintiens ton streak de ${currentStreak} jours ! Log une action`,
        cta: 'Sauver',
        href: '/dashboard',
        urgency,
      });
    }

    /* Pending quests */
    if (pendingQuests > 0) {
      result.push({
        id: 'pending-quests',
        icon: <ListChecks className="h-5 w-5 text-sky-400" />,
        message: `Tu as ${pendingQuests} quete${pendingQuests > 1 ? 's' : ''} en attente`,
        cta: 'Voir',
        href: '/dashboard/quests',
        urgency: pendingQuests >= 3 ? 'medium' : 'low',
      });
    }

    /* Close to level up */
    if (xpToNextLevel > 0 && xpToNextLevel <= 100) {
      result.push({
        id: 'level-up-close',
        icon: <TrendingUp className="h-5 w-5 text-green-400" />,
        message: `Plus que ${xpToNextLevel} XP pour le niveau ${nextLevel} !`,
        cta: 'Go !',
        href: '/dashboard',
        urgency: 'medium',
      });
    }

    /* No formations started */
    if (!hasFormations) {
      result.push({
        id: 'start-formation',
        icon: <GraduationCap className="h-5 w-5 text-purple-400" />,
        message: 'Commence ta premiere formation',
        cta: 'Decouvrir',
        href: '/dashboard/formations',
        urgency: 'low',
      });
    }

    /* Rewards to claim */
    if (hasRewardsToClaim) {
      result.push({
        id: 'claim-rewards',
        icon: <Gift className="h-5 w-5 text-ecs-amber" />,
        message: 'Tu as assez d\'XP pour une recompense !',
        cta: 'Reclamer',
        href: '/dashboard/rewards',
        urgency: 'medium',
      });
    }

    return result.slice(0, 4);
  }, [xpToday, currentStreak, pendingQuests, xpToNextLevel, nextLevel, hasFormations, hasRewardsToClaim]);

  if (suggestions.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="flex shrink-0 items-center justify-center h-6 w-6 rounded-md"
          style={{
            background: 'linear-gradient(135deg, rgba(255,191,0,0.12), rgba(255,157,0,0.06))',
            border: '1px solid rgba(255,191,0,0.2)',
          }}
        >
          <Bot className="h-3.5 w-3.5 text-ecs-amber" />
        </div>
        <h3 className="text-xs font-display font-bold uppercase tracking-[0.15em] text-gradient-amber">
          Que faire maintenant ?
        </h3>
      </div>

      {/* Suggestion list */}
      <AnimatePresence mode="popLayout">
        {suggestions.map((suggestion, i) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} index={i} />
        ))}
      </AnimatePresence>
    </div>
  );
}
