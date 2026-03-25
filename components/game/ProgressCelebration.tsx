'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Trophy, Target, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Celebration types                                                  */
/* ------------------------------------------------------------------ */

type CelebrationType =
  | 'first_action'
  | 'five_actions'
  | 'quest_completed'
  | 'streak_milestone'
  | 'close_to_levelup';

interface CelebrationConfig {
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  borderColor: string;
  bgGradient: string;
}

const CELEBRATION_STYLES: Record<CelebrationType, CelebrationConfig> = {
  first_action: {
    icon: <Sparkles className="h-5 w-5" />,
    color: 'text-ecs-amber',
    glowColor: 'rgba(255,191,0,0.15)',
    borderColor: 'rgba(255,191,0,0.3)',
    bgGradient: 'linear-gradient(135deg, rgba(255,191,0,0.08) 0%, rgba(12,12,12,0.97) 100%)',
  },
  five_actions: {
    icon: <Flame className="h-5 w-5" />,
    color: 'text-orange-400',
    glowColor: 'rgba(249,115,22,0.15)',
    borderColor: 'rgba(249,115,22,0.3)',
    bgGradient: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(12,12,12,0.97) 100%)',
  },
  quest_completed: {
    icon: <Trophy className="h-5 w-5" />,
    color: 'text-yellow-400',
    glowColor: 'rgba(234,179,8,0.15)',
    borderColor: 'rgba(234,179,8,0.3)',
    bgGradient: 'linear-gradient(135deg, rgba(234,179,8,0.08) 0%, rgba(12,12,12,0.97) 100%)',
  },
  streak_milestone: {
    icon: <Target className="h-5 w-5" />,
    color: 'text-green-400',
    glowColor: 'rgba(74,222,128,0.15)',
    borderColor: 'rgba(74,222,128,0.3)',
    bgGradient: 'linear-gradient(135deg, rgba(74,222,128,0.08) 0%, rgba(12,12,12,0.97) 100%)',
  },
  close_to_levelup: {
    icon: <Zap className="h-5 w-5" />,
    color: 'text-purple-400',
    glowColor: 'rgba(168,85,247,0.15)',
    borderColor: 'rgba(168,85,247,0.3)',
    bgGradient: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(12,12,12,0.97) 100%)',
  },
};

/* ------------------------------------------------------------------ */
/*  Celebration item interface                                         */
/* ------------------------------------------------------------------ */

interface CelebrationItem {
  id: string;
  type: CelebrationType;
  message: string;
}

/* ------------------------------------------------------------------ */
/*  Single celebration banner                                          */
/* ------------------------------------------------------------------ */

function CelebrationBanner({
  celebration,
  onDismiss,
}: {
  celebration: CelebrationItem;
  onDismiss: () => void;
}) {
  const config = CELEBRATION_STYLES[celebration.type];

  return (
    <motion.div
      className="w-full max-w-lg mx-auto rounded-xl overflow-hidden relative"
      style={{
        background: config.bgGradient,
        border: `1px solid ${config.borderColor}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${config.glowColor}`,
        backdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0, y: -40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      layout
    >
      {/* Top accent line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${config.borderColor}, transparent)`,
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Animated icon */}
        <motion.div
          className={cn('shrink-0', config.color)}
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.15 }}
        >
          {config.icon}
        </motion.div>

        {/* Message */}
        <motion.p
          className="flex-1 text-sm font-display font-bold text-white"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {celebration.message}
        </motion.p>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 rounded hover:bg-ecs-gray-dark/40 transition-colors"
          aria-label="Fermer la celebration"
        >
          <X className="h-3.5 w-3.5 text-ecs-gray/60" />
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      <div className="h-[2px] bg-transparent">
        <motion.div
          className="h-full"
          style={{
            background: `linear-gradient(90deg, ${config.borderColor}, transparent)`,
          }}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 4, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Celebration queue manager                                          */
/* ------------------------------------------------------------------ */

export function ProgressCelebration() {
  const [queue, setQueue] = useState<CelebrationItem[]>([]);
  const [current, setCurrent] = useState<CelebrationItem | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processedRef = useRef(new Set<string>());

  /* Process queue: show one celebration at a time */
  useEffect(() => {
    if (current !== null) return;
    if (queue.length === 0) return;

    const next = queue[0];
    setCurrent(next);
    setQueue((prev) => prev.slice(1));

    /* Auto-dismiss after 4 seconds */
    timerRef.current = setTimeout(() => {
      setCurrent(null);
    }, 4000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, queue]);

  /* Dismiss current celebration and move to next */
  const handleDismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent(null);
  }, []);

  /* Public method to add celebrations — expose via window event */
  useEffect(() => {
    const handleCelebration = (e: CustomEvent<CelebrationItem>) => {
      const item = e.detail;

      /* Deduplicate */
      if (processedRef.current.has(item.id)) return;
      processedRef.current.add(item.id);

      /* Clean up old IDs after 60 seconds */
      setTimeout(() => {
        processedRef.current.delete(item.id);
      }, 60000);

      setQueue((prev) => [...prev, item]);
    };

    window.addEventListener(
      'ecs:celebration' as keyof WindowEventMap,
      handleCelebration as EventListener,
    );

    return () => {
      window.removeEventListener(
        'ecs:celebration' as keyof WindowEventMap,
        handleCelebration as EventListener,
      );
    };
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-lg px-4">
      <AnimatePresence mode="wait">
        {current && (
          <CelebrationBanner
            key={current.id}
            celebration={current}
            onDismiss={handleDismiss}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper to trigger celebrations from anywhere in the app            */
/* ------------------------------------------------------------------ */

export function triggerCelebration(
  type: CelebrationType,
  message: string,
  id?: string,
): void {
  if (typeof window === 'undefined') return;

  const celebrationId = id ?? `celebration-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const event = new CustomEvent('ecs:celebration', {
    detail: {
      id: celebrationId,
      type,
      message,
    } satisfies CelebrationItem,
  });

  window.dispatchEvent(event);
}
