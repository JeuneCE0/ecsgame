'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Target, Flame, Award, Clock } from 'lucide-react';
import { XPBar } from '@/components/game/XPBar';
import { QuestCard } from '@/components/game/QuestCard';
import { StreakCounter } from '@/components/game/StreakCounter';
import { LevelBadge } from '@/components/game/LevelBadge';
import { formatXP } from '@/lib/utils';

interface DashboardClientProps {
  displayName: string;
  xpStats: {
    totalXP: number;
    level: number;
    currentLevelXP: number;
    nextLevelXP: number;
    progressPercent: number;
    weeklyXP: number;
  };
  streakInfo: {
    currentStreak: number;
    longestStreak: number;
  };
  todayQuests: Array<{
    id: string;
    title: string;
    description: string;
    xpReward: number;
    questType: 'daily' | 'weekly' | 'main' | 'special';
    progress: number;
    requiredCount: number;
    status: 'available' | 'in_progress' | 'completed' | 'expired';
  }>;
  totalCloses: number;
  recentActivity: Array<{
    id: string;
    source: string;
    amount: number;
    description: string | null;
    createdAt: string;
  }>;
}

const SOURCE_LABELS: Record<string, string> = {
  quest_completion: 'Quête complétée',
  call_booked: 'Appel booké',
  deal_closed: 'Deal conclu',
  lead_generated: 'Lead généré',
  formation_completed: 'Formation',
  streak_bonus: 'Bonus série',
  manual_log: 'Manuel',
  referral: 'Parrainage',
  badge_earned: 'Badge obtenu',
  admin_grant: 'Admin',
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin}min`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;

  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'Hier';
  return `Il y a ${diffD}j`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export function DashboardClient({
  displayName,
  xpStats,
  streakInfo,
  todayQuests,
  totalCloses,
  recentActivity,
}: DashboardClientProps) {
  return (
    <motion.div
      className="space-y-8"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {/* Greeting + XP Bar */}
      <motion.div variants={fadeInUp} className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white md:text-3xl">
            {getGreeting()}, <span className="text-gradient-amber">{displayName}</span>
          </h1>
          <p className="mt-1 text-sm text-ecs-gray">
            Continue sur ta lancée. Chaque action compte.
          </p>
        </div>
        <XPBar
          currentXP={xpStats.totalXP}
          currentLevelXP={xpStats.currentLevelXP}
          nextLevelXP={xpStats.nextLevelXP}
          level={xpStats.level}
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="card-ecs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ecs-amber/10">
              <TrendingUp className="h-5 w-5 text-ecs-amber" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-ecs-amber">
                {formatXP(xpStats.weeklyXP)}
              </p>
              <p className="text-xs text-ecs-gray">XP cette semaine</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="card-ecs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ecs-amber/10">
              <Target className="h-5 w-5 text-ecs-amber" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-ecs-amber">
                {totalCloses}
              </p>
              <p className="text-xs text-ecs-gray">Deals conclus</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="card-ecs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ecs-amber/10">
              <Flame className="h-5 w-5 text-ecs-amber" />
            </div>
            <div>
              <StreakCounter
                currentStreak={streakInfo.currentStreak}
                longestStreak={streakInfo.longestStreak}
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="card-ecs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ecs-amber/10">
              <Award className="h-5 w-5 text-ecs-amber" />
            </div>
            <div>
              <div className="mb-1">
                <LevelBadge level={xpStats.level} size="sm" showTitle />
              </div>
              <p className="text-xs text-ecs-gray">Niveau actuel</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Today's Quests */}
      <motion.section variants={fadeInUp} className="space-y-4">
        <h2 className="font-display text-lg font-bold text-white">
          Quêtes du jour
        </h2>
        {todayQuests.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {todayQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : (
          <div className="card-ecs text-center text-ecs-gray">
            <p>Aucune quête disponible pour le moment.</p>
          </div>
        )}
      </motion.section>

      {/* Recent Activity */}
      <motion.section variants={fadeInUp} className="space-y-4">
        <h2 className="font-display text-lg font-bold text-white">
          Activité récente
        </h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-2">
            {recentActivity.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-lg border border-ecs-gray-border bg-ecs-black-card px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ecs-amber/10">
                    <Clock className="h-4 w-4 text-ecs-amber" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {event.description ?? SOURCE_LABELS[event.source] ?? event.source}
                    </p>
                    <p className="text-xs text-ecs-gray">
                      {formatRelativeDate(event.createdAt)}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-display font-bold text-ecs-amber">
                  +{event.amount} XP
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-ecs text-center text-ecs-gray">
            <p>Pas encore d&apos;activité. Lance-toi !</p>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}
