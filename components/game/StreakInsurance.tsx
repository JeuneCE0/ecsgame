'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/usePlayerStore';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StreakInsuranceProps {
  /** Number of shield tokens available */
  shieldTokens: number;
  /** Current streak in days */
  currentStreak: number;
  /** Whether the streak is at risk (no XP logged today) */
  isStreakAtRisk: boolean;
  /** Minutes left until midnight */
  minutesToMidnight?: number;
  /** Callback when user activates a shield */
  onUseShield: () => void;
  /** Callback to navigate to earn tokens */
  onEarnTokens?: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Shield token earned milestones                                     */
/* ------------------------------------------------------------------ */

const SHIELD_MILESTONES = [7, 14, 21, 28, 35, 42, 49, 56, 63, 70] as const;

function getNextMilestone(streak: number): number | null {
  for (const milestone of SHIELD_MILESTONES) {
    if (streak < milestone) return milestone;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Countdown to midnight                                              */
/* ------------------------------------------------------------------ */

function MidnightCountdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="h-3 w-3 text-red-400" />
      <span className="text-xs font-display font-bold tabular-nums text-red-400">
        {timeLeft}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shield icon with glow                                              */
/* ------------------------------------------------------------------ */

function ShieldIcon({ isAtRisk, tokenCount }: { isAtRisk: boolean; tokenCount: number }) {
  const hasTokens = tokenCount > 0;

  return (
    <motion.div
      className="relative"
      animate={isAtRisk ? { scale: [1, 1.1, 1] } : undefined}
      transition={isAtRisk ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {/* Glow behind */}
      {isAtRisk && hasTokens && (
        <motion.div
          className="absolute inset-0 blur-md rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255, 191, 0, 0.4) 0%, transparent 70%)' }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <div
        className={cn(
          'relative flex items-center justify-center w-12 h-12 rounded-xl',
        )}
        style={{
          background: hasTokens
            ? 'linear-gradient(135deg, rgba(255, 191, 0, 0.12), rgba(255, 157, 0, 0.06))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(12, 12, 12, 0.95))',
          border: hasTokens
            ? '1px solid rgba(255, 191, 0, 0.25)'
            : '1px solid rgba(239, 68, 68, 0.2)',
          boxShadow: hasTokens
            ? '0 0 12px rgba(255, 191, 0, 0.15)'
            : undefined,
        }}
      >
        {hasTokens ? (
          <ShieldCheck className="h-6 w-6 text-ecs-amber" />
        ) : isAtRisk ? (
          <ShieldAlert className="h-6 w-6 text-red-400" />
        ) : (
          <Shield className="h-6 w-6 text-ecs-gray/50" />
        )}
      </div>

      {/* Token count badge */}
      {hasTokens && (
        <motion.div
          className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-display font-bold text-ecs-black"
          style={{
            background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
            boxShadow: '0 0 6px rgba(255, 191, 0, 0.5)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          {tokenCount}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Milestone progress                                                 */
/* ------------------------------------------------------------------ */

function MilestoneProgress({ currentStreak }: { currentStreak: number }) {
  const nextMilestone = getNextMilestone(currentStreak);
  if (!nextMilestone) return null;

  const prevMilestone = SHIELD_MILESTONES[SHIELD_MILESTONES.indexOf(nextMilestone as typeof SHIELD_MILESTONES[number]) - 1] ?? 0;
  const progress = ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
  const daysLeft = nextMilestone - currentStreak;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-display uppercase tracking-[0.15em] text-ecs-gray">
          Prochain bouclier
        </span>
        <span className="text-[10px] font-display text-ecs-amber/70">
          {daysLeft}j restant{daysLeft > 1 ? 's' : ''}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 rounded-full bg-ecs-gray-dark/30 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #FFBF00, #FF9D00)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 20 }}
        />
      </div>

      <div className="flex items-center justify-between text-[9px] text-ecs-gray/50">
        <span>{prevMilestone}j</span>
        <div className="flex items-center gap-1">
          <Shield className="h-2.5 w-2.5 text-ecs-amber/50" />
          <span className="text-ecs-amber/60 font-bold">{nextMilestone}j</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function StreakInsurance({
  shieldTokens,
  currentStreak,
  isStreakAtRisk,
  onUseShield,
  onEarnTokens,
  className,
}: StreakInsuranceProps) {
  const [shieldUsed, setShieldUsed] = useState(false);
  const playerStreak = usePlayerStore((s) => s.currentStreak);
  const effectiveStreak = currentStreak || playerStreak;

  const handleUseShield = useCallback(() => {
    if (shieldTokens <= 0 || shieldUsed) return;
    setShieldUsed(true);
    onUseShield();
  }, [shieldTokens, shieldUsed, onUseShield]);

  const showUrgent = isStreakAtRisk && !shieldUsed;

  return (
    <div
      className={cn('relative rounded-xl border overflow-hidden', className)}
      style={{
        background: showUrgent
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.04) 0%, #1A1A1A 40%, #0F0F0F 100%)'
          : 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
        border: showUrgent
          ? '1px solid rgba(239, 68, 68, 0.25)'
          : '1px solid rgba(42, 42, 42, 1)',
      }}
    >
      {/* Pulsing border on urgency */}
      {showUrgent && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, #EF4444, transparent)' }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <ShieldIcon isAtRisk={showUrgent} tokenCount={shieldTokens} />

          <div className="flex-1">
            <h3 className="font-display text-sm font-bold text-white/90 uppercase tracking-wider">
              Bouclier de Streak
            </h3>
            <p className="text-xs text-ecs-gray font-body mt-0.5">
              Protege ton streak de{' '}
              <span className="font-bold text-ecs-amber">{effectiveStreak} jours</span>
            </p>
          </div>

          {showUrgent && <MidnightCountdown />}
        </div>

        {/* Shield used confirmation */}
        <AnimatePresence>
          {shieldUsed && (
            <motion.div
              className="rounded-lg p-4 mb-4 text-center border border-green-500/20"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(12, 12, 12, 0.95))',
              }}
              initial={{ opacity: 0, scale: 0.9, height: 0 }}
              animate={{ opacity: 1, scale: 1, height: 'auto' }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <ShieldCheck className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="font-display text-sm font-bold text-green-400">
                Bouclier active !
              </p>
              <p className="text-xs text-ecs-gray mt-1">
                Ton streak est protege pour aujourd&apos;hui
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warning message */}
        {showUrgent && shieldTokens > 0 && !shieldUsed && (
          <motion.div
            className="flex items-start gap-2 rounded-lg p-3 mb-4"
            style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400/80 font-body leading-relaxed">
              Sans bouclier, ton streak sera perdu a minuit.
              Tu as <span className="font-bold text-red-400">{shieldTokens}</span> bouclier{shieldTokens > 1 ? 's' : ''} disponible{shieldTokens > 1 ? 's' : ''}.
            </p>
          </motion.div>
        )}

        {/* No tokens warning */}
        {showUrgent && shieldTokens === 0 && !shieldUsed && (
          <motion.div
            className="flex items-start gap-2 rounded-lg p-3 mb-4"
            style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400/80 font-body leading-relaxed">
              Tu n&apos;as aucun bouclier ! Ton streak de{' '}
              <span className="font-bold text-red-400">{effectiveStreak} jours</span>{' '}
              sera perdu a minuit si tu ne logues pas d&apos;XP.
            </p>
          </motion.div>
        )}

        {/* Token inventory */}
        <div className="flex items-center gap-3 mb-4 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(shieldTokens, 5) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 400, damping: 15 }}
              >
                <Shield
                  className="h-5 w-5"
                  style={{
                    color: '#FFBF00',
                    filter: 'drop-shadow(0 0 4px rgba(255, 191, 0, 0.3))',
                  }}
                />
              </motion.div>
            ))}
            {shieldTokens > 5 && (
              <span className="text-xs font-display font-bold text-ecs-amber">
                +{shieldTokens - 5}
              </span>
            )}
            {shieldTokens === 0 && (
              <span className="text-xs text-ecs-gray/50 font-display">Aucun bouclier</span>
            )}
          </div>

          <div className="flex-1" />

          <span className="text-[10px] font-display text-ecs-gray uppercase tracking-wider">
            {shieldTokens} bouclier{shieldTokens !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Milestone progress */}
        <div className="mb-5">
          <MilestoneProgress currentStreak={effectiveStreak} />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {showUrgent && shieldTokens > 0 && !shieldUsed ? (
            <motion.button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-display font-bold uppercase tracking-wider text-sm text-ecs-black"
              style={{
                background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
                boxShadow: '0 0 16px rgba(255, 191, 0, 0.3)',
              }}
              onClick={handleUseShield}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: [
                  '0 0 16px rgba(255, 191, 0, 0.2)',
                  '0 0 28px rgba(255, 191, 0, 0.4)',
                  '0 0 16px rgba(255, 191, 0, 0.2)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="h-4 w-4" />
              Utiliser un bouclier
            </motion.button>
          ) : !shieldUsed && onEarnTokens ? (
            <motion.button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-display text-sm font-bold uppercase tracking-wider text-white border border-ecs-gray-border hover:border-ecs-amber/30 transition-colors"
              style={{ background: 'rgba(26,26,26,0.8)' }}
              onClick={onEarnTokens}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Shield className="h-4 w-4 text-ecs-amber" />
              Gagner des boucliers
            </motion.button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
