'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, TrendingUp, TrendingDown, Trophy, Zap } from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';
import { AvatarDisplay } from '@/components/game/AvatarDisplay';
import { LevelBadge } from '@/components/game/LevelBadge';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RivalPlayer {
  id: string;
  name: string;
  avatarUrl?: string;
  level: number;
  totalXP: number;
  weeklyXP: number;
  rank: number;
}

interface RivalSystemProps {
  currentPlayer: RivalPlayer;
  rival: RivalPlayer;
  /** Whether the data is updating live */
  isLive?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Stat comparison row                                                */
/* ------------------------------------------------------------------ */

interface StatComparisonProps {
  label: string;
  playerValue: number;
  rivalValue: number;
  formatFn?: (v: number) => string;
}

function StatComparison({ label, playerValue, rivalValue, formatFn }: StatComparisonProps) {
  const format = formatFn ?? ((v: number) => String(v));
  const playerWins = playerValue > rivalValue;
  const tie = playerValue === rivalValue;

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Player value */}
      <motion.span
        className={cn(
          'w-16 text-right font-display font-bold tabular-nums',
          playerWins ? 'text-green-400' : tie ? 'text-ecs-gray' : 'text-white/70',
        )}
        style={playerWins ? { textShadow: '0 0 8px rgba(34, 197, 94, 0.3)' } : undefined}
      >
        {format(playerValue)}
      </motion.span>

      {/* Label */}
      <span className="flex-1 text-center text-[10px] text-ecs-gray font-display uppercase tracking-wider">
        {label}
      </span>

      {/* Rival value */}
      <motion.span
        className={cn(
          'w-16 text-left font-display font-bold tabular-nums',
          !playerWins && !tie ? 'text-red-400' : tie ? 'text-ecs-gray' : 'text-white/70',
        )}
        style={!playerWins && !tie ? { textShadow: '0 0 8px rgba(239, 68, 68, 0.3)' } : undefined}
      >
        {format(rivalValue)}
      </motion.span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Celebration overlay                                                */
/* ------------------------------------------------------------------ */

function OvertakeCelebration({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.12) 0%, rgba(12, 12, 12, 0.95) 100%)',
        backdropFilter: 'blur(8px)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <Trophy className="h-12 w-12 text-ecs-amber mb-3" style={{ filter: 'drop-shadow(0 0 12px rgba(255, 191, 0, 0.5))' }} />
      </motion.div>

      <motion.p
        className="font-display text-lg font-bold text-gradient-amber"
        style={{ textShadow: '0 0 20px rgba(255, 191, 0, 0.4)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        TU L&apos;AS DEPASSE !
      </motion.p>

      <motion.p
        className="text-xs text-ecs-gray font-body mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Continue comme ca, tu es inarretable !
      </motion.p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function RivalSystem({
  currentPlayer,
  rival,
  isLive = false,
  className,
}: RivalSystemProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevPlayerXP, setPrevPlayerXP] = useState(currentPlayer.totalXP);
  const gradientId = useId();

  const xpGap = rival.totalXP - currentPlayer.totalXP;
  const playerIsAhead = xpGap < 0;
  const absGap = Math.abs(xpGap);

  /* Detect overtake */
  useEffect(() => {
    const wasBelow = prevPlayerXP < rival.totalXP;
    const isNowAbove = currentPlayer.totalXP >= rival.totalXP;

    if (wasBelow && isNowAbove) {
      setShowCelebration(true);
    }

    setPrevPlayerXP(currentPlayer.totalXP);
  }, [currentPlayer.totalXP, rival.totalXP, prevPlayerXP]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
  }, []);

  /* XP gap bar percentage (capped at 100) */
  const maxXP = Math.max(currentPlayer.totalXP, rival.totalXP);
  const playerPercent = maxXP > 0 ? (currentPlayer.totalXP / maxXP) * 100 : 50;
  const rivalPercent = maxXP > 0 ? (rival.totalXP / maxXP) * 100 : 50;

  return (
    <div
      className={cn('relative rounded-xl border border-ecs-gray-border overflow-hidden', className)}
      style={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
      }}
    >
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <OvertakeCelebration onComplete={handleCelebrationComplete} />
        )}
      </AnimatePresence>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-ecs-amber" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white/80">
              Ton rival
            </h3>
          </div>

          {isLive && (
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[10px] font-display text-green-500/70 uppercase tracking-wider">
                Live
              </span>
            </div>
          )}
        </div>

        {/* VS layout: two player cards */}
        <div className="flex items-center gap-3 mb-5">
          {/* Current player */}
          <div className="flex-1 flex flex-col items-center gap-2 text-center">
            <div className="relative">
              <AvatarDisplay avatarUrl={currentPlayer.avatarUrl} name={currentPlayer.name} size="md" />
              {playerIsAhead && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
                    boxShadow: '0 0 8px rgba(255, 191, 0, 0.4)',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <TrendingUp className="h-3 w-3 text-ecs-black" />
                </motion.div>
              )}
            </div>
            <div>
              <p className="font-display text-sm font-bold text-ecs-amber truncate max-w-[100px]">
                Toi
              </p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <LevelBadge level={currentPlayer.level} size="sm" />
              </div>
            </div>
          </div>

          {/* VS badge */}
          <motion.div
            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.1), rgba(255, 157, 0, 0.05))',
              border: '1px solid rgba(255, 191, 0, 0.2)',
              boxShadow: '0 0 16px rgba(255, 191, 0, 0.1)',
            }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="font-display text-xs font-bold text-ecs-amber">VS</span>
          </motion.div>

          {/* Rival */}
          <div className="flex-1 flex flex-col items-center gap-2 text-center">
            <div className="relative">
              <AvatarDisplay avatarUrl={rival.avatarUrl} name={rival.name} size="md" />
              {!playerIsAhead && xpGap !== 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <TrendingDown className="h-3 w-3 text-white" />
                </motion.div>
              )}
            </div>
            <div>
              <p className="font-display text-sm font-bold text-white/80 truncate max-w-[100px]">
                {rival.name}
              </p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <LevelBadge level={rival.level} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* XP gap bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-display text-ecs-amber/60 tabular-nums">{formatXP(currentPlayer.totalXP)} XP</span>
            <span className="text-[10px] font-display text-white/40 tabular-nums">{formatXP(rival.totalXP)} XP</span>
          </div>

          {/* Dual progress bar */}
          <div className="relative h-2 rounded-full overflow-hidden bg-ecs-gray-dark/30">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`${gradientId}-player`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFBF00" />
                  <stop offset="100%" stopColor="#FF9D00" />
                </linearGradient>
              </defs>
            </svg>

            {/* Player bar */}
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #FFBF00, #FF9D00)',
                boxShadow: playerIsAhead ? '0 0 8px rgba(255, 191, 0, 0.4)' : undefined,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${playerPercent}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            />

            {/* Rival bar (from right) */}
            <motion.div
              className="absolute top-0 right-0 h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.25))',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${rivalPercent}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            />
          </div>
        </div>

        {/* Gap indicator */}
        <motion.div
          className={cn(
            'text-center rounded-lg py-2 px-3 mb-4 border',
            playerIsAhead
              ? 'border-green-500/20'
              : 'border-red-500/20',
          )}
          style={{
            background: playerIsAhead
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.06), transparent)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.06), transparent)',
          }}
        >
          {playerIsAhead ? (
            <p className="text-sm font-display font-bold text-green-400">
              Tu le devances de {formatXP(absGap)} XP
            </p>
          ) : xpGap === 0 ? (
            <p className="text-sm font-display font-bold text-ecs-amber">
              Egalite ! Un effort et tu passes devant
            </p>
          ) : (
            <p className="text-sm font-display font-bold text-red-400">
              Il te devance de {formatXP(absGap)} XP
            </p>
          )}
        </motion.div>

        {/* Stat comparisons */}
        <div className="space-y-2 mb-5 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <StatComparison
            label="XP Total"
            playerValue={currentPlayer.totalXP}
            rivalValue={rival.totalXP}
            formatFn={formatXP}
          />
          <StatComparison
            label="Niveau"
            playerValue={currentPlayer.level}
            rivalValue={rival.level}
          />
          <StatComparison
            label="XP Semaine"
            playerValue={currentPlayer.weeklyXP}
            rivalValue={rival.weeklyXP}
            formatFn={formatXP}
          />
          <StatComparison
            label="Rang"
            playerValue={rival.rank}
            rivalValue={currentPlayer.rank}
          />
        </div>

        {/* Motivation CTA */}
        {!playerIsAhead && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-ecs-gray font-body mb-3">
              <Zap className="inline h-3 w-3 text-ecs-amber mr-1" />
              Depasse-le aujourd&apos;hui !
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
