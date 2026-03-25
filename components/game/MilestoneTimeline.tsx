'use client';

import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Lock,
  Zap,
  Sword,
  Flame,
  TrendingUp,
  Award,
  Handshake,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type MilestoneStatus = 'completed' | 'next' | 'locked';

interface Milestone {
  id: string;
  label: string;
  description: string;
  date: string | null;
  icon: React.ReactNode;
  xpEarned: number | null;
  status: MilestoneStatus;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Default milestone templates (used if no data passed)               */
/* ------------------------------------------------------------------ */

const DEFAULT_MILESTONES: Milestone[] = [
  {
    id: 'first-xp',
    label: 'Premier XP',
    description: 'Log ta premiere action business',
    date: null,
    icon: <Zap className="h-4 w-4" />,
    xpEarned: null,
    status: 'next',
  },
  {
    id: 'first-quest',
    label: 'Premiere Quete',
    description: 'Complete ta premiere quete',
    date: null,
    icon: <Sword className="h-4 w-4" />,
    xpEarned: null,
    status: 'locked',
  },
  {
    id: 'streak-3',
    label: 'Streak 3 jours',
    description: '3 jours consecutifs d\'activite',
    date: null,
    icon: <Flame className="h-4 w-4" />,
    xpEarned: null,
    status: 'locked',
  },
  {
    id: 'level-3',
    label: 'Niveau 3 — Vendeur',
    description: 'Atteins le rang de Vendeur',
    date: null,
    icon: <TrendingUp className="h-4 w-4" />,
    xpEarned: null,
    status: 'locked',
  },
  {
    id: 'streak-7',
    label: 'Streak 7 jours',
    description: '1 semaine sans lacher',
    date: null,
    icon: <Flame className="h-4 w-4" />,
    xpEarned: null,
    status: 'locked',
  },
  {
    id: 'first-badge',
    label: 'Premier Badge',
    description: 'Debloque ton premier badge',
    date: null,
    icon: <Award className="h-4 w-4" />,
    xpEarned: null,
    status: 'locked',
  },
  {
    id: 'streak-14',
    label: 'Streak 14 jours',
    description: '2 semaines de discipline',
    date: null,
    icon: <Flame className="h-4 w-4" />,
    xpEarned: null,
    status: 'locked',
  },
  {
    id: 'first-deal',
    label: 'Premier Deal',
    description: 'Ferme ton premier deal',
    date: null,
    icon: <Handshake className="h-4 w-4" />,
    xpEarned: null,
    status: 'locked',
  },
  {
    id: 'streak-30',
    label: 'Streak 30 jours',
    description: '1 mois de constance absolue',
    date: null,
    icon: <Star className="h-4 w-4" />,
    xpEarned: null,
    status: 'locked',
  },
];

/* ------------------------------------------------------------------ */
/*  Single milestone node                                              */
/* ------------------------------------------------------------------ */

function MilestoneNode({ milestone, index }: { milestone: Milestone; index: number }) {
  const isCompleted = milestone.status === 'completed';
  const isNext = milestone.status === 'next';
  const isLocked = milestone.status === 'locked';

  return (
    <motion.div
      className="flex flex-col items-center shrink-0 snap-center"
      style={{ width: 140 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
    >
      {/* Circle node */}
      <div className="relative">
        {/* Pulsing glow for next milestone */}
        {isNext && (
          <motion.div
            className="absolute -inset-3 rounded-full pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(255,191,0,0)',
                '0 0 0 8px rgba(255,191,0,0.15)',
                '0 0 0 0 rgba(255,191,0,0)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300',
            isCompleted && 'border-ecs-amber/60',
            isNext && 'border-ecs-amber',
            isLocked && 'border-ecs-gray-dark bg-ecs-black-light',
          )}
          style={
            isCompleted
              ? {
                  background: 'linear-gradient(135deg, rgba(255,191,0,0.15), rgba(255,157,0,0.08))',
                  boxShadow: '0 0 12px rgba(255,191,0,0.2)',
                }
              : isNext
                ? {
                    background: 'linear-gradient(135deg, rgba(255,191,0,0.1), rgba(255,157,0,0.05))',
                    boxShadow: '0 0 16px rgba(255,191,0,0.25)',
                  }
                : undefined
          }
        >
          {isCompleted ? (
            <Check className="h-5 w-5 text-ecs-amber" />
          ) : isLocked ? (
            <Lock className="h-4 w-4 text-ecs-gray/40" />
          ) : (
            <span className={cn(isNext ? 'text-ecs-amber' : 'text-ecs-gray/40')}>
              {milestone.icon}
            </span>
          )}
        </div>
      </div>

      {/* "Prochaine etape" label for next milestone */}
      {isNext && (
        <motion.span
          className="mt-2 px-2 py-0.5 rounded text-[9px] font-display font-bold uppercase tracking-wider text-ecs-amber"
          style={{
            background: 'rgba(255,191,0,0.1)',
            border: '1px solid rgba(255,191,0,0.2)',
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Prochaine etape
        </motion.span>
      )}

      {/* Label */}
      <p
        className={cn(
          'mt-2 text-xs font-display font-bold text-center leading-snug',
          isCompleted ? 'text-white' : isNext ? 'text-ecs-amber' : 'text-ecs-gray/40',
        )}
      >
        {milestone.label}
      </p>

      {/* Description */}
      <p
        className={cn(
          'mt-1 text-[10px] text-center font-body leading-snug',
          isCompleted ? 'text-ecs-gray' : isNext ? 'text-ecs-gray/70' : 'text-ecs-gray/30',
        )}
      >
        {milestone.description}
      </p>

      {/* Date */}
      {milestone.date && isCompleted && (
        <p className="mt-1 text-[9px] font-display uppercase tracking-wider text-ecs-amber/50">
          {milestone.date}
        </p>
      )}

      {/* XP earned badge */}
      {milestone.xpEarned !== null && isCompleted && (
        <span
          className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-display font-bold text-ecs-amber"
          style={{
            background: 'rgba(255,191,0,0.08)',
          }}
        >
          +{milestone.xpEarned} XP
        </span>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function MilestoneTimeline({ milestones, className }: MilestoneTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const data = milestones.length > 0 ? milestones : DEFAULT_MILESTONES;

  /* Find the index of the first incomplete milestone to auto-scroll */
  const nextIndex = useMemo(() => {
    const idx = data.findIndex((m) => m.status === 'next');
    return idx >= 0 ? idx : 0;
  }, [data]);

  /* Auto-scroll to the "next" milestone on mount */
  const scrollToNext = useMemo(() => {
    return () => {
      if (!scrollRef.current) return;
      const target = nextIndex * 156; /* 140px width + ~16px gap */
      scrollRef.current.scrollTo({ left: Math.max(0, target - 60), behavior: 'smooth' });
    };
  }, [nextIndex]);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-display font-bold uppercase tracking-[0.15em] text-gradient-amber">
          Ton Parcours
        </h3>
        <span className="text-[10px] text-ecs-gray font-display">
          {data.filter((m) => m.status === 'completed').length}/{data.length} etapes
        </span>
      </div>

      {/* Scrollable timeline */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-none pb-2"
        style={{
          scrollSnapType: 'x mandatory',
        }}
        onLoad={scrollToNext}
      >
        <div className="relative flex items-start gap-4 px-2" style={{ minWidth: 'max-content' }}>
          {/* Connection line */}
          <div className="absolute top-6 left-8 right-8 flex items-center" style={{ height: 2 }}>
            {data.map((milestone, i) => {
              if (i === data.length - 1) return null;
              const isCompletedSegment = milestone.status === 'completed';
              return (
                <div
                  key={`line-${milestone.id}`}
                  className="flex-1 h-full mx-[54px]"
                  style={{
                    background: isCompletedSegment
                      ? 'linear-gradient(90deg, #FFBF00, #FF9D00)'
                      : 'rgba(42,42,42,0.6)',
                    boxShadow: isCompletedSegment
                      ? '0 0 6px rgba(255,191,0,0.3)'
                      : 'none',
                  }}
                />
              );
            })}
          </div>

          {/* Milestone nodes */}
          {data.map((milestone, i) => (
            <MilestoneNode key={milestone.id} milestone={milestone} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
