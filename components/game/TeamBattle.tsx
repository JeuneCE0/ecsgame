'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Users, Zap } from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';
import { AvatarDisplay } from '@/components/game/AvatarDisplay';

interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Team {
  id: string;
  name: string;
  totalXP: number;
  members: TeamMember[];
}

interface TeamBattleProps {
  teamA: Team;
  teamB: Team;
  title?: string;
}

function TeamFireEffect({ intensity }: { intensity: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: Math.max(3, Math.round(intensity * 6)) }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 40,
        delay: i * 0.15,
        duration: 0.7 + Math.random() * 0.5,
        size: 2 + Math.random() * 3,
      })),
    [intensity]
  );

  return (
    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-8 pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bottom-0 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `calc(50% + ${p.x}px)`,
            background: '#FF9D00',
            boxShadow: '0 0 4px rgba(255, 157, 0, 0.7)',
          }}
          animate={{
            y: [0, -20],
            opacity: [0.8, 0],
            scale: [1, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: 0.3,
            ease: 'easeOut' as const,
          }}
        />
      ))}
    </div>
  );
}

function AvatarStack({ members, maxShow = 4 }: { members: TeamMember[]; maxShow?: number }) {
  const shown = members.slice(0, maxShow);
  const overflow = members.length - maxShow;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((member, i) => (
        <motion.div
          key={member.id}
          className="relative border-2 border-ecs-black-card rounded-full"
          style={{ zIndex: maxShow - i }}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <AvatarDisplay
            avatarUrl={member.avatarUrl}
            name={member.name}
            size="sm"
          />
        </motion.div>
      ))}
      {overflow > 0 && (
        <motion.div
          className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-ecs-black-card font-display text-[10px] font-bold text-ecs-gray"
          style={{
            background: 'linear-gradient(135deg, #1E1E1E, #141414)',
            zIndex: 0,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: maxShow * 0.06 }}
        >
          +{overflow}
        </motion.div>
      )}
    </div>
  );
}

function TeamSide({
  team,
  isWinning,
  side,
}: {
  team: Team;
  isWinning: boolean;
  side: 'left' | 'right';
}) {
  const isLeft = side === 'left';

  return (
    <motion.div
      className={cn(
        'flex-1 flex flex-col gap-3 relative',
        isLeft ? 'items-start' : 'items-end'
      )}
      initial={{ opacity: 0, x: isLeft ? -16 : 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: isLeft ? 0 : 0.08,
      }}
    >
      {/* Fire effect on winning side */}
      {isWinning && <TeamFireEffect intensity={0.8} />}

      {/* Team name */}
      <h4
        className={cn(
          'font-display font-bold text-base truncate max-w-full',
          isWinning ? 'text-ecs-amber' : 'text-white/80'
        )}
        style={
          isWinning
            ? { textShadow: '0 0 12px rgba(255, 191, 0, 0.3)' }
            : undefined
        }
      >
        {team.name}
      </h4>

      {/* XP total */}
      <div className={cn('flex items-baseline gap-1.5', isLeft ? '' : 'flex-row-reverse')}>
        <motion.span
          key={team.totalXP}
          className={cn(
            'font-display font-bold text-2xl leading-none',
            isWinning ? 'text-gradient-amber' : 'text-white'
          )}
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          {formatXP(team.totalXP)}
        </motion.span>
        <span className="text-xs text-ecs-gray font-display">XP</span>
      </div>

      {/* Members info */}
      <div className={cn('flex items-center gap-2', isLeft ? '' : 'flex-row-reverse')}>
        <div className="flex items-center gap-1 text-ecs-gray">
          <Users className="h-3 w-3" />
          <span className="text-[10px] font-display">
            {team.members.length} {team.members.length === 1 ? 'membre' : 'membres'}
          </span>
        </div>
      </div>

      {/* Avatar stack */}
      <div className={cn(isLeft ? '' : 'flex justify-end w-full')}>
        <AvatarStack members={team.members} />
      </div>
    </motion.div>
  );
}

export function TeamBattle({
  teamA,
  teamB,
  title = 'Bataille des équipes',
}: TeamBattleProps) {
  const totalXP = teamA.totalXP + teamB.totalXP;
  const percentA = totalXP > 0 ? (teamA.totalXP / totalXP) * 100 : 50;
  const percentB = totalXP > 0 ? (teamB.totalXP / totalXP) * 100 : 50;

  const aWinning = teamA.totalXP > teamB.totalXP;
  const bWinning = teamB.totalXP > teamA.totalXP;
  const isTied = teamA.totalXP === teamB.totalXP;

  const leadXP = Math.abs(teamA.totalXP - teamB.totalXP);

  return (
    <div
      className="rounded-xl border border-ecs-gray-border p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
      }}
    >
      {/* Title header */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <Zap className="h-4 w-4 text-ecs-amber" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white/80">
          {title}
        </h3>
        <Zap className="h-4 w-4 text-ecs-amber" />
      </div>

      {/* Team sides */}
      <div className="flex items-start gap-6">
        <TeamSide team={teamA} isWinning={aWinning} side="left" />
        <TeamSide team={teamB} isWinning={bWinning} side="right" />
      </div>

      {/* Tug of war bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <motion.span
            className={cn(
              'text-xs font-display font-bold',
              aWinning ? 'text-ecs-amber' : 'text-ecs-gray'
            )}
            key={`a-${percentA.toFixed(0)}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
          >
            {percentA.toFixed(0)}%
          </motion.span>
          <motion.span
            className={cn(
              'text-xs font-display font-bold',
              bWinning ? 'text-ecs-amber' : 'text-ecs-gray'
            )}
            key={`b-${percentB.toFixed(0)}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
          >
            {percentB.toFixed(0)}%
          </motion.span>
        </div>

        <div
          className="relative h-[10px] rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1A1A1A, #0F0F0F)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
          }}
        >
          {/* Team A fill (left) */}
          <motion.div
            className="absolute top-0 left-0 h-full rounded-l-full"
            style={{
              background: aWinning
                ? 'linear-gradient(90deg, #FFBF00, #FF9D00)'
                : 'linear-gradient(90deg, #555555, #444444)',
              boxShadow: aWinning ? '0 0 8px rgba(255, 191, 0, 0.4)' : 'none',
            }}
            initial={{ width: '50%' }}
            animate={{ width: `${percentA}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 16 }}
          />

          {/* Team B fill (right) */}
          <motion.div
            className="absolute top-0 right-0 h-full rounded-r-full"
            style={{
              background: bWinning
                ? 'linear-gradient(270deg, #FFBF00, #FF9D00)'
                : 'linear-gradient(270deg, #555555, #444444)',
              boxShadow: bWinning ? '0 0 8px rgba(255, 191, 0, 0.4)' : 'none',
            }}
            initial={{ width: '50%' }}
            animate={{ width: `${percentB}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 16 }}
          />

          {/* Center divider / battle line */}
          <motion.div
            className="absolute top-0 bottom-0 w-[3px] rounded-full z-10"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 0 8px rgba(255,255,255,0.4)',
            }}
            initial={{ left: '50%' }}
            animate={{ left: `${percentA}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 16 }}
          />
        </div>
      </div>

      {/* Lead indicator */}
      <motion.div
        className="flex items-center justify-center mt-4"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {!isTied ? (
          <div
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.08), rgba(255, 157, 0, 0.04))',
              border: '1px solid rgba(255, 191, 0, 0.12)',
            }}
          >
            <Flame className="h-3 w-3 text-ecs-orange" />
            <span className="text-xs font-display">
              <span className="font-bold text-ecs-amber">
                {aWinning ? teamA.name : teamB.name}
              </span>
              <span className="text-ecs-gray"> mène de </span>
              <span className="font-bold text-gradient-amber">
                {formatXP(leadXP)} XP
              </span>
            </span>
          </div>
        ) : (
          <span className="text-xs font-display text-ecs-gray">
            Les deux équipes sont à égalité !
          </span>
        )}
      </motion.div>
    </div>
  );
}
