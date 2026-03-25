'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingDown, Clock, Gift, Swords, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AbsenceStat {
  id: string;
  icon: 'ranking' | 'xp' | 'rewards' | 'rival';
  text: string;
  value: string;
  sentiment: 'loss' | 'opportunity';
}

interface WhileYouWereGoneProps {
  /** Hours since last activity */
  hoursAway: number;
  /** Stats to reveal one by one */
  stats: AbsenceStat[];
  /** Rival name (for the rival line) */
  rivalName?: string;
  /** Callback when user taps the CTA */
  onCatchUp: () => void;
  /** Callback when dismissed */
  onDismiss: () => void;
}

/* ------------------------------------------------------------------ */
/*  ECHO mini avatar for the message                                   */
/* ------------------------------------------------------------------ */

function EchoMiniAvatar() {
  return (
    <div
      className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.15), rgba(255, 157, 0, 0.08))',
        border: '1px solid rgba(255, 191, 0, 0.25)',
      }}
    >
      <span className="text-xs font-display font-bold text-ecs-amber">E</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */

function AnimatedValue({ value, delay }: { value: string; delay: number }) {
  const [displayed, setDisplayed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!displayed) return <span className="opacity-0">{value}</span>;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
    >
      {value}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat icon map                                                      */
/* ------------------------------------------------------------------ */

function StatIcon({ type, sentiment }: { type: AbsenceStat['icon']; sentiment: AbsenceStat['sentiment'] }) {
  const colorClass = sentiment === 'loss' ? 'text-red-400' : 'text-ecs-amber';
  const iconProps = { className: cn('h-4 w-4', colorClass) };

  switch (type) {
    case 'ranking':
      return <TrendingDown {...iconProps} />;
    case 'xp':
      return <Clock {...iconProps} />;
    case 'rewards':
      return <Gift {...iconProps} />;
    case 'rival':
      return <Swords {...iconProps} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const MIN_HOURS_THRESHOLD = 6;
const STAT_STAGGER_MS = 600;

export function WhileYouWereGone({
  hoursAway,
  stats,
  onCatchUp,
  onDismiss,
}: WhileYouWereGoneProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const borderId = useId();

  /* Only show if away > threshold */
  useEffect(() => {
    if (hoursAway >= MIN_HOURS_THRESHOLD) {
      setIsVisible(true);
    }
  }, [hoursAway]);

  /* Stagger reveal stats one by one */
  useEffect(() => {
    if (!isVisible || revealedCount >= stats.length) return;

    const timer = setTimeout(() => {
      setRevealedCount((prev) => prev + 1);
    }, STAT_STAGGER_MS);

    return () => clearTimeout(timer);
  }, [isVisible, revealedCount, stats.length]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    onDismiss();
  }, [onDismiss]);

  const handleCatchUp = useCallback(() => {
    setIsVisible(false);
    onCatchUp();
  }, [onCatchUp]);

  const formattedHours = hoursAway >= 24
    ? `${Math.floor(hoursAway / 24)}j ${hoursAway % 24}h`
    : `${hoursAway}h`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 backdrop-blur-md"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 191, 0, 0.03) 0%, rgba(0,0,0,0.88) 70%)',
            }}
            onClick={handleDismiss}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(26, 26, 26, 0.96) 0%, rgba(12, 12, 12, 0.99) 100%)',
              border: '1px solid rgba(255, 191, 0, 0.15)',
              boxShadow: '0 0 60px rgba(255, 191, 0, 0.08), 0 0 120px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
            initial={{ scale: 0.6, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pulsing amber border top */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: 'linear-gradient(90deg, transparent, #FFBF00, #FF9D00, transparent)',
              }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Pulsing amber border sides */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <defs>
                <linearGradient id={borderId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFBF00" />
                  <stop offset="100%" stopColor="#FF9D00" />
                </linearGradient>
              </defs>
              <motion.rect
                x="0.5"
                y="0.5"
                width="calc(100% - 1px)"
                height="calc(100% - 1px)"
                rx="16"
                fill="none"
                stroke={`url(#${borderId})`}
                strokeWidth="1.5"
                strokeDasharray="8 4"
                animate={{ strokeDashoffset: [0, -24] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                opacity={0.3}
              />
            </svg>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full border border-ecs-gray-border/50 bg-ecs-black-card/50 text-ecs-gray hover:text-white hover:border-ecs-gray/50 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 pt-8">
              {/* Header */}
              <div className="text-center mb-6">
                <motion.p
                  className="text-[10px] font-display uppercase tracking-[0.3em] text-ecs-gray mb-2"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Absent depuis {formattedHours}
                </motion.p>
                <motion.h2
                  className="font-display text-2xl font-bold text-white"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                >
                  Pendant ton absence...
                </motion.h2>
              </div>

              {/* Stats reveal */}
              <div className="space-y-3 mb-6">
                {stats.map((stat, index) => (
                  <AnimatePresence key={stat.id}>
                    {index < revealedCount && (
                      <motion.div
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-4 py-3 border',
                          stat.sentiment === 'loss'
                            ? 'border-red-500/20'
                            : 'border-ecs-amber/20',
                        )}
                        style={{
                          background: stat.sentiment === 'loss'
                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(12, 12, 12, 0.95) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 191, 0, 0.06) 0%, rgba(12, 12, 12, 0.95) 100%)',
                        }}
                        initial={{ opacity: 0, x: -30, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 22,
                        }}
                      >
                        <StatIcon type={stat.icon} sentiment={stat.sentiment} />
                        <p
                          className={cn(
                            'flex-1 text-sm font-body',
                            stat.sentiment === 'loss' ? 'text-red-400/90' : 'text-ecs-amber/90',
                          )}
                        >
                          {stat.text}
                        </p>
                        <AnimatedValue
                          value={stat.value}
                          delay={200}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>

              {/* ECHO message */}
              <AnimatePresence>
                {revealedCount >= stats.length && (
                  <motion.div
                    className="flex items-start gap-3 mb-6 rounded-lg p-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 191, 0, 0.1)',
                    }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  >
                    <EchoMiniAvatar />
                    <div>
                      <p className="text-[10px] font-display font-bold uppercase tracking-wider text-ecs-amber/60 mb-1">
                        Echo
                      </p>
                      <p className="text-xs text-ecs-gray font-body leading-relaxed">
                        T&apos;inquiete, tout n&apos;est pas perdu. Mais faut s&apos;y mettre{' '}
                        <span className="font-bold text-white">MAINTENANT</span>.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <AnimatePresence>
                {revealedCount >= stats.length && (
                  <motion.button
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-display font-bold uppercase tracking-wider text-sm text-ecs-black"
                    style={{
                      background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
                      boxShadow: '0 0 20px rgba(255, 191, 0, 0.25), 0 0 40px rgba(255, 191, 0, 0.1)',
                    }}
                    onClick={handleCatchUp}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    Rattrape ton retard
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
