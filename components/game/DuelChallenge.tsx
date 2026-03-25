'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Crown, Flame, Swords } from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';
import { AvatarDisplay } from '@/components/game/AvatarDisplay';
import { LevelBadge } from '@/components/game/LevelBadge';

interface DuelPlayer {
  id: string;
  name: string;
  avatarUrl?: string;
  level: number;
  score: number;
}

interface DuelChallengeProps {
  playerA: DuelPlayer;
  playerB: DuelPlayer;
  title?: string;
  isFinished?: boolean;
}

function FireParticle({ side, delay }: { side: 'left' | 'right'; delay: number }) {
  const xBase = side === 'left' ? -8 : 8;
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 3,
        height: 3,
        background: '#FF9D00',
        boxShadow: '0 0 4px rgba(255, 157, 0, 0.8)',
      }}
      animate={{
        y: [0, -24],
        x: [xBase, xBase + (Math.random() - 0.5) * 12],
        opacity: [0.9, 0],
        scale: [1, 0.2],
      }}
      transition={{
        duration: 0.9 + Math.random() * 0.4,
        delay,
        repeat: Infinity,
        repeatDelay: 0.4 + Math.random() * 0.6,
        ease: 'easeOut' as const,
      }}
    />
  );
}

function VSBadge() {
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        side: (i % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
        delay: i * 0.12,
      })),
    []
  );

  return (
    <div className="relative flex items-center justify-center">
      {/* Fire particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {particles.map((p) => (
          <FireParticle key={p.id} side={p.side} delay={p.delay} />
        ))}
      </div>

      {/* Outer glow ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 56,
          height: 56,
        }}
        animate={{
          boxShadow: [
            '0 0 12px rgba(255, 157, 0, 0.3), 0 0 24px rgba(255, 191, 0, 0.1)',
            '0 0 20px rgba(255, 157, 0, 0.5), 0 0 40px rgba(255, 191, 0, 0.2)',
            '0 0 12px rgba(255, 157, 0, 0.3), 0 0 24px rgba(255, 191, 0, 0.1)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Badge body */}
      <motion.div
        className="relative flex h-12 w-12 items-center justify-center rounded-full z-10"
        style={{
          background: 'linear-gradient(135deg, #FF9D00, #FFBF00)',
          boxShadow: '0 4px 16px rgba(255, 157, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}
        animate={{ rotate: [0, 3, -3, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{
            background: 'linear-gradient(135deg, #0C0C0C, #1A1A1A)',
          }}
        >
          <Swords className="h-5 w-5 text-ecs-amber" />
        </div>
      </motion.div>
    </div>
  );
}

function PlayerSide({
  player,
  isLeading,
  isWinner,
  side,
  progressPercent,
}: {
  player: DuelPlayer;
  isLeading: boolean;
  isWinner: boolean;
  side: 'left' | 'right';
  progressPercent: number;
}) {
  const isLeft = side === 'left';

  return (
    <motion.div
      className={cn(
        'flex-1 flex flex-col items-center gap-3 rounded-xl p-4 relative overflow-hidden',
        'border transition-all duration-300'
      )}
      style={{
        background: isLeading
          ? 'linear-gradient(135deg, rgba(255, 191, 0, 0.06) 0%, #1A1A1A 100%)'
          : 'linear-gradient(135deg, #1A1A1A 0%, #141414 100%)',
        borderColor: isLeading
          ? 'rgba(255, 191, 0, 0.25)'
          : 'rgba(42, 42, 42, 1)',
        boxShadow: isLeading
          ? '0 0 20px rgba(255, 191, 0, 0.08)'
          : 'none',
      }}
      initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: isLeft ? 0 : 0.1,
      }}
    >
      {/* Winner crown animation */}
      {isWinner && (
        <motion.div
          className="absolute -top-1 left-1/2 -translate-x-1/2 z-20"
          initial={{ y: -20, opacity: 0, scale: 0 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 15,
            delay: 0.3,
          }}
        >
          <motion.div
            animate={{
              y: [0, -3, 0],
              filter: [
                'drop-shadow(0 0 4px rgba(255, 191, 0, 0.4))',
                'drop-shadow(0 0 10px rgba(255, 191, 0, 0.7))',
                'drop-shadow(0 0 4px rgba(255, 191, 0, 0.4))',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Crown className="h-6 w-6 text-ecs-amber" />
          </motion.div>
        </motion.div>
      )}

      {/* Leading glow accent */}
      {isLeading && !isWinner && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 191, 0, 0.6), transparent)',
          }}
        />
      )}

      <AvatarDisplay
        avatarUrl={player.avatarUrl}
        name={player.name}
        size="md"
      />

      <div className="text-center">
        <p className={cn(
          'font-display font-bold text-sm truncate max-w-[120px]',
          isLeading ? 'text-ecs-amber' : 'text-white'
        )}>
          {player.name}
        </p>
        <div className="flex items-center justify-center mt-1">
          <LevelBadge level={player.level} size="sm" />
        </div>
      </div>

      {/* Score */}
      <motion.div
        className="text-center"
        key={player.score}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <p className={cn(
          'font-display font-bold text-2xl leading-none',
          isLeading ? 'text-gradient-amber' : 'text-white'
        )}>
          {formatXP(player.score)}
        </p>
        <p className="text-[9px] text-ecs-gray font-display uppercase tracking-widest mt-1">
          XP
        </p>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full">
        <div
          className="h-[6px] rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1A1A1A, #0F0F0F)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isLeading
                ? 'linear-gradient(90deg, #FFBF00, #FF9D00)'
                : 'linear-gradient(90deg, #444444, #333333)',
              boxShadow: isLeading ? '0 0 8px rgba(255, 191, 0, 0.3)' : 'none',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function DuelChallenge({
  playerA,
  playerB,
  title = 'Défi de la semaine',
  isFinished = false,
}: DuelChallengeProps) {
  const totalScore = playerA.score + playerB.score;
  const percentA = totalScore > 0 ? (playerA.score / totalScore) * 100 : 50;
  const percentB = totalScore > 0 ? (playerB.score / totalScore) * 100 : 50;

  const aLeading = playerA.score > playerB.score;
  const bLeading = playerB.score > playerA.score;
  const isTied = playerA.score === playerB.score;

  const winnerA = isFinished && aLeading;
  const winnerB = isFinished && bLeading;

  return (
    <div
      className="rounded-xl border border-ecs-gray-border p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
      }}
    >
      {/* Title header */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <Flame className="h-4 w-4 text-ecs-orange" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white/80">
          {title}
        </h3>
        <Flame className="h-4 w-4 text-ecs-orange" />
      </div>

      {/* Duel layout */}
      <div className="flex items-center gap-3">
        <PlayerSide
          player={playerA}
          isLeading={aLeading}
          isWinner={winnerA}
          side="left"
          progressPercent={percentA}
        />

        <VSBadge />

        <PlayerSide
          player={playerB}
          isLeading={bLeading}
          isWinner={winnerB}
          side="right"
          progressPercent={percentB}
        />
      </div>

      {/* Score difference indicator */}
      {!isTied && (
        <motion.div
          className="flex items-center justify-center mt-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.08), rgba(255, 157, 0, 0.04))',
              border: '1px solid rgba(255, 191, 0, 0.12)',
            }}
          >
            <span className="text-xs font-display font-bold text-ecs-amber">
              {aLeading ? playerA.name : playerB.name}
            </span>
            <span className="text-xs text-ecs-gray">mène de</span>
            <span className="text-xs font-display font-bold text-gradient-amber">
              {formatXP(Math.abs(playerA.score - playerB.score))} XP
            </span>
          </div>
        </motion.div>
      )}

      {/* Tied state */}
      {isTied && totalScore > 0 && (
        <motion.p
          className="text-center text-xs font-display text-ecs-gray mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Égalité parfaite !
        </motion.p>
      )}

      {/* Finished state */}
      {isFinished && (
        <motion.div
          className="absolute inset-0 flex items-end justify-center pointer-events-none pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-[10px] font-display uppercase tracking-[0.2em] text-ecs-gray/40">
            Défi terminé
          </span>
        </motion.div>
      )}
    </div>
  );
}
