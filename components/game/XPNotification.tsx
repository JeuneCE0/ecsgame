'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/stores/usePlayerStore';

export function XPNotification() {
  const xpNotification = usePlayerStore((s) => s.xpNotification);
  const clearXPNotification = usePlayerStore((s) => s.clearXPNotification);

  const handleClear = useCallback(() => {
    clearXPNotification();
  }, [clearXPNotification]);

  useEffect(() => {
    if (!xpNotification) return;

    const timer = setTimeout(handleClear, 3000);
    return () => clearTimeout(timer);
  }, [xpNotification, handleClear]);

  return (
    <AnimatePresence>
      {xpNotification && (
        <motion.div
          className="fixed right-4 top-4 z-50 rounded-lg border border-ecs-amber/20 bg-ecs-black-card p-4 shadow-amber-glow"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
          <p className="font-display text-xl font-bold text-gradient-amber">
            +{xpNotification.amount} XP
          </p>
          <p className="mt-0.5 text-xs text-ecs-gray">
            {xpNotification.source}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
