'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Tip definitions per context                                        */
/* ------------------------------------------------------------------ */

interface TipDefinition {
  id: string;
  context: string;
  text: string;
}

const TIPS: TipDefinition[] = [
  {
    id: 'dashboard-first',
    context: 'dashboard',
    text: 'Commence par logger ton premier XP !',
  },
  {
    id: 'quests-intro',
    context: 'quests',
    text: 'Compl\u00e8te des qu\u00eates pour gagner des bonus XP',
  },
  {
    id: 'leaderboard-refresh',
    context: 'leaderboard',
    text: 'Le classement se met \u00e0 jour toutes les 5 minutes',
  },
  {
    id: 'timer-intro',
    context: 'timer',
    text: 'Utilise le timer pour tracker tes sessions de travail',
  },
];

const STORAGE_KEY = 'echo-dismissed-tips';

function getDismissedTips(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((v): v is string => typeof v === 'string'));
    }
    return new Set();
  } catch {
    return new Set();
  }
}

function saveDismissedTip(id: string) {
  if (typeof window === 'undefined') return;
  const current = getDismissedTips();
  current.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(current)));
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ContextualTipProps {
  context: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ContextualTip({ context, className }: ContextualTipProps) {
  const [visibleTip, setVisibleTip] = useState<TipDefinition | null>(null);

  useEffect(() => {
    const dismissed = getDismissedTips();
    const tip = TIPS.find((t) => t.context === context && !dismissed.has(t.id));
    setVisibleTip(tip ?? null);
  }, [context]);

  const handleDismiss = useCallback(() => {
    if (!visibleTip) return;
    saveDismissedTip(visibleTip.id);
    setVisibleTip(null);
  }, [visibleTip]);

  return (
    <AnimatePresence>
      {visibleTip && (
        <motion.div
          className={cn(
            'relative rounded-xl px-4 py-3 flex items-start gap-3',
            className,
          )}
          style={{
            background: 'linear-gradient(135deg, rgba(26,26,26,0.85) 0%, rgba(12,12,12,0.9) 100%)',
            border: '1px solid rgba(255,191,0,0.15)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 12px rgba(255,191,0,0.06)',
            backdropFilter: 'blur(12px)',
          }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          {/* ECHO mini icon */}
          <div
            className="flex shrink-0 items-center justify-center h-7 w-7 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255,191,0,0.12), rgba(255,157,0,0.06))',
              border: '1px solid rgba(255,191,0,0.2)',
            }}
          >
            <Bot className="h-4 w-4 text-ecs-amber" />
          </div>

          {/* Tip text */}
          <p className="flex-1 text-xs text-ecs-gray font-body leading-relaxed pt-0.5">
            {visibleTip.text}
          </p>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="shrink-0 p-1 rounded hover:bg-ecs-gray-dark/40 transition-colors"
            aria-label="Fermer le conseil"
          >
            <X className="h-3.5 w-3.5 text-ecs-gray/60" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
