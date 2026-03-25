'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/stores/usePlayerStore';

interface FloatingNumber {
  id: number;
  amount: number;
  source: string;
  x: number;
  y: number;
  wobbleX: number;
}

const SOURCE_COLORS: Record<string, string> = {
  quest_completion: '#A855F7',
  call_booked: '#3B82F6',
  deal_closed: '#FFBF00',
  lead_generated: '#22C55E',
  formation_completed: '#06B6D4',
  streak_bonus: '#FF9D00',
  manual_log: '#FFBF00',
  referral: '#EC4899',
  badge_earned: '#F59E0B',
  admin_grant: '#8B5CF6',
};

let floatingIdCounter = 0;

export function FloatingXP() {
  const xpNotification = usePlayerStore((s) => s.xpNotification);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);

  const addFloating = useCallback((amount: number, source: string) => {
    const id = ++floatingIdCounter;

    // Position near center-right area where XP notifications usually appear
    const baseX = typeof window !== 'undefined' ? window.innerWidth - 180 : 800;
    const baseY = 80;

    const entry: FloatingNumber = {
      id,
      amount,
      source,
      x: baseX + (Math.random() - 0.5) * 80,
      y: baseY + Math.random() * 20,
      wobbleX: (Math.random() - 0.5) * 60,
    };

    setFloatingNumbers((prev) => [...prev, entry]);

    // Remove after animation completes
    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((n) => n.id !== id));
    }, 1800);
  }, []);

  useEffect(() => {
    if (xpNotification) {
      addFloating(xpNotification.amount, xpNotification.source);
    }
  }, [xpNotification, addFloating]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {floatingNumbers.map((num) => {
          const color = SOURCE_COLORS[num.source] ?? '#FFBF00';

          return (
            <motion.div
              key={num.id}
              className="absolute font-display font-bold select-none"
              style={{
                left: num.x,
                top: num.y,
                color,
                textShadow: `0 0 12px ${color}80, 0 2px 4px rgba(0,0,0,0.5)`,
                fontSize: Math.min(18 + num.amount / 8, 36),
              }}
              initial={{ opacity: 1, y: 0, x: 0, scale: 1.3 }}
              animate={{
                opacity: [1, 1, 0],
                y: -120,
                x: num.wobbleX,
                scale: [1.3, 1, 0.8],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.6,
                ease: 'easeOut',
                opacity: { times: [0, 0.6, 1] },
                scale: { times: [0, 0.3, 1] },
              }}
            >
              +{num.amount} XP
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
