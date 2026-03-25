'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  Target,
  Flame,
  Award,
  Clock,
  Zap,
  Timer,
  Plus,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { QuestCard } from '@/components/game/QuestCard';
import { NextActionSuggester } from '@/components/game/NextActionSuggester';
import { MotivationalQuote } from '@/components/game/MotivationalQuote';
import { WelcomeBack } from '@/components/game/WelcomeBack';
import { formatXP, getXPProgressPercent } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                 Constants                                  */
/* -------------------------------------------------------------------------- */

const SOURCE_LABELS: Record<string, string> = {
  quest_completion: 'Qu\u00eate compl\u00e9t\u00e9e',
  call_booked: 'Appel book\u00e9',
  deal_closed: 'Deal conclu',
  lead_generated: 'Lead g\u00e9n\u00e9r\u00e9',
  formation_completed: 'Formation',
  streak_bonus: 'Bonus s\u00e9rie',
  manual_log: 'Manuel',
  referral: 'Parrainage',
  badge_earned: 'Badge obtenu',
  admin_grant: 'Admin',
};

const SOURCE_ICONS: Record<string, typeof TrendingUp> = {
  quest_completion: Sparkles,
  call_booked: Clock,
  deal_closed: Target,
  lead_generated: TrendingUp,
  formation_completed: Award,
  streak_bonus: Flame,
  manual_log: Plus,
  referral: Zap,
  badge_earned: Award,
  admin_grant: Zap,
};

/* -------------------------------------------------------------------------- */
/*                              Animation Configs                             */
/* -------------------------------------------------------------------------- */

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const cardHover = {
  scale: 1.03,
  transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
};

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "\u00c0 l'instant";
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
  if (hour < 18) return 'Bon apr\u00e8s-midi';
  return 'Bonsoir';
}

/* -------------------------------------------------------------------------- */
/*                          Animated Counter Hook                             */
/* -------------------------------------------------------------------------- */

function useAnimatedCounter(target: number, duration = 1.2): string {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    motionValue.set(target);
  }, [motionValue, target]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      const rounded = Math.round(latest);
      if (rounded >= 1000) {
        setDisplay(`${(rounded / 1000).toFixed(1)}k`);
      } else {
        setDisplay(rounded.toString());
      }
    });
    return unsubscribe;
  }, [springValue]);

  return display;
}

/* -------------------------------------------------------------------------- */
/*                         Glass Stat Card Component                          */
/* -------------------------------------------------------------------------- */

interface StatCardProps {
  icon: typeof TrendingUp;
  value: number;
  label: string;
  suffix?: string;
  iconColorClass?: string;
  glowColor?: string;
}

function StatCard({
  icon: Icon,
  value,
  label,
  suffix = '',
  iconColorClass = 'text-ecs-amber',
  glowColor = 'rgba(255, 191, 0, 0.15)',
}: StatCardProps) {
  const animatedValue = useAnimatedCounter(value);

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={cardHover}
      className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl transition-colors duration-300 hover:border-ecs-amber/20 hover:bg-white/[0.05]"
    >
      {/* Gradient border glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${glowColor}, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex items-center gap-4">
        {/* Icon with glow ring */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-xl blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-60"
            style={{ backgroundColor: glowColor }}
          />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ecs-amber/15 to-ecs-orange/10">
            <Icon className={`h-6 w-6 ${iconColorClass}`} />
          </div>
        </div>

        <div className="min-w-0">
          <p className="font-display text-2xl font-bold tracking-tight text-white">
            {animatedValue}
            {suffix && <span className="ml-0.5 text-base text-ecs-gray">{suffix}</span>}
          </p>
          <p className="text-sm text-ecs-gray">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                       Animated XP Progress Bar                             */
/* -------------------------------------------------------------------------- */

function HeroXPBar({
  currentXP,
  currentLevelXP,
  nextLevelXP,
  level,
}: {
  currentXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  level: number;
}) {
  const percent = getXPProgressPercent(currentXP, currentLevelXP, nextLevelXP);
  const xpIntoLevel = currentXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Level badge with animated glow */}
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ecs-amber to-ecs-orange font-display text-lg font-black text-ecs-black"
            animate={{
              boxShadow: [
                '0 0 0px rgba(255, 191, 0, 0)',
                '0 0 24px rgba(255, 191, 0, 0.4)',
                '0 0 0px rgba(255, 191, 0, 0)',
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {level}
          </motion.div>
          <div>
            <p className="font-display text-sm font-bold text-white">
              Niveau {level}
            </p>
            <p className="text-xs text-ecs-gray">
              {formatXP(xpIntoLevel)} / {formatXP(xpNeeded)} XP
            </p>
          </div>
        </div>
        <motion.span
          className="font-display text-sm font-bold text-ecs-amber"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {Math.round(percent)}%
        </motion.span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
        {/* Animated fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-ecs-amber via-ecs-orange to-ecs-amber"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 }}
        />
        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${percent}%`,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5 }}
        />
        {/* Glow at the edge */}
        <motion.div
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-ecs-amber/60 blur-md"
          initial={{ left: 0 }}
          animate={{ left: `${percent}%` }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                       Streak Fire Animation Component                      */
/* -------------------------------------------------------------------------- */

function StreakFire({ streak }: { streak: number }) {
  const isActive = streak > 0;

  return (
    <motion.div
      className="relative flex items-center gap-2"
      animate={
        isActive
          ? { scale: [1, 1.08, 1] }
          : undefined
      }
      transition={
        isActive
          ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          : undefined
      }
    >
      <div className="relative">
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full bg-orange-500/40 blur-lg"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <Flame
          className={`relative h-7 w-7 ${isActive ? 'text-ecs-orange' : 'text-ecs-gray'}`}
        />
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           Activity Timeline Item                           */
/* -------------------------------------------------------------------------- */

function ActivityItem({
  event,
  index,
}: {
  event: DashboardClientProps['recentActivity'][number];
  index: number;
}) {
  const IconComponent = SOURCE_ICONS[event.source] ?? Clock;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.6 + index * 0.08 }}
      className="group relative flex items-center gap-4 rounded-xl border border-transparent bg-white/[0.02] px-4 py-3.5 transition-all duration-300 hover:border-white/[0.06] hover:bg-white/[0.04]"
    >
      {/* Timeline dot */}
      <div className="relative flex-shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ecs-amber/15 to-ecs-orange/10 transition-all duration-300 group-hover:from-ecs-amber/25 group-hover:to-ecs-orange/20">
          <IconComponent className="h-4 w-4 text-ecs-amber" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white/90">
          {event.description ?? SOURCE_LABELS[event.source] ?? event.source}
        </p>
        <p className="text-xs text-ecs-gray">
          {formatRelativeDate(event.createdAt)}
        </p>
      </div>

      <motion.span
        className="flex-shrink-0 rounded-lg bg-ecs-amber/10 px-2.5 py-1 font-display text-sm font-bold text-ecs-amber"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8 + index * 0.08, type: 'spring', stiffness: 300 }}
      >
        +{event.amount} XP
      </motion.span>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Quick Action Card                               */
/* -------------------------------------------------------------------------- */

function QuickActionCard({
  href,
  icon: Icon,
  label,
  sublabel,
  delay,
}: {
  href: string;
  icon: typeof Zap;
  label: string;
  sublabel: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Link href={href}>
        <motion.div
          className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-ecs-amber/10 bg-gradient-to-r from-ecs-amber/[0.06] to-transparent p-4 transition-all duration-300 hover:border-ecs-amber/25 hover:from-ecs-amber/[0.1]"
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-ecs-amber to-ecs-orange shadow-lg shadow-ecs-amber/20">
            <Icon className="h-5 w-5 text-ecs-black" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-bold text-white">
              {label}
            </p>
            <p className="text-xs text-ecs-gray">{sublabel}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-ecs-gray transition-all duration-300 group-hover:translate-x-1 group-hover:text-ecs-amber" />
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Section Header Component                          */
/* -------------------------------------------------------------------------- */

function SectionHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-lg font-bold text-white">
        {title}
      </h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-ecs-gray transition-colors hover:text-ecs-amber"
        >
          {linkLabel}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Main Dashboard Client                           */
/* -------------------------------------------------------------------------- */

export function DashboardClient({
  displayName,
  xpStats,
  streakInfo,
  todayQuests,
  totalCloses,
  recentActivity,
}: DashboardClientProps) {
  const greeting = getGreeting();
  const motivationalLines = [
    'Chaque action compte. Continue sur ta lanc\u00e9e.',
    'Les l\u00e9gendes ne se reposent jamais.',
    'Ton prochain level t\u2019attend.',
    'Encore un effort, tu y es presque.',
  ];
  const [motivational] = useState(
    () => motivationalLines[Math.floor(Math.random() * motivationalLines.length)]
  );

  return (
    <motion.div
      className="mx-auto max-w-6xl space-y-8"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {/* Welcome back modal (shows once per day) */}
      <WelcomeBack
        playerName={displayName}
        currentStreak={streakInfo.currentStreak}
        streakMaintained={streakInfo.currentStreak > 0}
        yesterdayStats={{ xpGained: 0, questsCompleted: 0 }}
        todayPreview={{
          dailyQuests: todayQuests.length,
          weeklyQuests: 0,
        }}
      />

      {/* ================================================================== */}
      {/*  HERO SECTION                                                      */}
      {/* ================================================================== */}
      <motion.section
        variants={fadeInUp}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent p-6 md:p-8 backdrop-blur-xl"
      >
        {/* Background ambient glow */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-ecs-amber/[0.06] blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-ecs-orange/[0.04] blur-[80px]" />

        <div className="relative z-10 space-y-6">
          {/* Greeting with word reveal */}
          <div>
            <h1 className="font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              >
                {greeting},{' '}
              </motion.span>
              <motion.span
                className="inline-block bg-gradient-to-r from-ecs-amber via-ecs-orange to-ecs-amber bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              >
                {displayName}
              </motion.span>
            </h1>
            <motion.p
              className="mt-2 text-sm text-ecs-gray md:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {motivational}
            </motion.p>
          </div>

          {/* XP Progress Bar */}
          <HeroXPBar
            currentXP={xpStats.totalXP}
            currentLevelXP={xpStats.currentLevelXP}
            nextLevelXP={xpStats.nextLevelXP}
            level={xpStats.level}
          />
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/*  STATS GRID                                                        */}
      {/* ================================================================== */}
      <motion.div
        className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4"
        variants={staggerContainer}
      >
        <StatCard
          icon={TrendingUp}
          value={xpStats.weeklyXP}
          label="XP cette semaine"
          glowColor="rgba(255, 191, 0, 0.15)"
        />
        <StatCard
          icon={Target}
          value={totalCloses}
          label="Deals conclus"
          glowColor="rgba(255, 157, 0, 0.15)"
        />

        {/* Streak card -- custom because of fire animation */}
        <motion.div
          variants={fadeInUp}
          whileHover={cardHover}
          className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl transition-colors duration-300 hover:border-ecs-orange/20 hover:bg-white/[0.05]"
        >
          <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 120, 0, 0.12), transparent 70%)',
            }}
          />
          <div className="relative z-10 flex items-center gap-4">
            <StreakFire streak={streakInfo.currentStreak} />
            <div className="min-w-0">
              <p className="font-display text-2xl font-bold tracking-tight text-white">
                {streakInfo.currentStreak}
                <span className="ml-0.5 text-base text-ecs-gray">j</span>
              </p>
              <p className="text-sm text-ecs-gray">S\u00e9rie en cours</p>
              {streakInfo.longestStreak > 0 && (
                <p className="text-xs text-ecs-gray/60">
                  Record : {streakInfo.longestStreak}j
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <StatCard
          icon={Award}
          value={xpStats.level}
          label="Niveau actuel"
          glowColor="rgba(255, 191, 0, 0.15)"
        />
      </motion.div>

      {/* ================================================================== */}
      {/*  NEXT ACTION SUGGESTER                                             */}
      {/* ================================================================== */}
      <motion.section variants={fadeInUp}>
        <NextActionSuggester
          xpToday={xpStats.weeklyXP}
          pendingQuests={todayQuests.filter((q) => q.status !== 'completed').length}
          xpToNextLevel={xpStats.nextLevelXP - xpStats.totalXP}
          nextLevel={xpStats.level + 1}
          hasFormations={false}
          hasRewardsToClaim={false}
        />
      </motion.section>

      {/* ================================================================== */}
      {/*  MAIN CONTENT: QUESTS + SIDEBAR                                    */}
      {/* ================================================================== */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quests -- takes 2 cols on large */}
        <motion.section variants={fadeInUp} className="space-y-4 lg:col-span-2">
          <SectionHeader
            title="Qu\u00eates du jour"
            href="/dashboard/quests"
            linkLabel="Tout voir"
          />

          {todayQuests.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {todayQuests.map((quest, i) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 8px 32px rgba(255, 191, 0, 0.08)',
                  }}
                  className="rounded-xl"
                >
                  <QuestCard quest={quest} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] py-12 text-center"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05]">
                <Target className="h-6 w-6 text-ecs-gray" />
              </div>
              <p className="text-sm text-ecs-gray">
                Aucune qu\u00eate disponible pour le moment.
              </p>
              <p className="mt-1 text-xs text-ecs-gray/60">
                Reviens demain pour de nouveaux d\u00e9fis !
              </p>
            </motion.div>
          )}
        </motion.section>

        {/* Sidebar: Quick Actions + Activity */}
        <motion.aside variants={fadeInUp} className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold text-white">
              Actions rapides
            </h2>
            <QuickActionCard
              href="/dashboard/quests"
              icon={Zap}
              label="Logger du XP"
              sublabel="Enregistre une action"
              delay={0.5}
            />
            <QuickActionCard
              href="/dashboard/timer"
              icon={Timer}
              label="Lancer un timer"
              sublabel="D\u00e9marchage, formation..."
              delay={0.6}
            />
          </div>

          {/* Recent Activity */}
          <div className="space-y-3">
            <SectionHeader title="Activit\u00e9 r\u00e9cente" />

            {recentActivity.length > 0 ? (
              <div className="space-y-1.5">
                {recentActivity.slice(0, 5).map((event, i) => (
                  <ActivityItem key={event.id} event={event} index={i} />
                ))}

                {recentActivity.length > 5 && (
                  <motion.p
                    className="pt-2 text-center text-xs text-ecs-gray"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    +{recentActivity.length - 5} autres actions
                  </motion.p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] py-8 text-center">
                <Clock className="mb-2 h-5 w-5 text-ecs-gray/50" />
                <p className="text-sm text-ecs-gray">
                  Pas encore d&apos;activit\u00e9.
                </p>
                <p className="mt-0.5 text-xs text-ecs-gray/60">
                  Lance-toi !
                </p>
              </div>
            )}
          </div>

          {/* Motivational Quote */}
          <MotivationalQuote autoCycle />
        </motion.aside>
      </div>
    </motion.div>
  );
}
