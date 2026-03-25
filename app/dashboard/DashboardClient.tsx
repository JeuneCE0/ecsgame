'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
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
  Check,
  User,
  BookOpen,
  Trophy,
  Phone,
  Handshake,
  UserPlus,
  FileText,
  PartyPopper,
} from 'lucide-react';
import { QuestCard } from '@/components/game/QuestCard';
import { NextActionSuggester } from '@/components/game/NextActionSuggester';
import { MotivationalQuote } from '@/components/game/MotivationalQuote';
import { WelcomeBack } from '@/components/game/WelcomeBack';
import { LogXPForm } from '@/components/forms/LogXPForm';
import { usePlayerStore } from '@/stores/usePlayerStore';
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
  xpEventCount: number;
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
/*                         Onboarding Checklist                               */
/* -------------------------------------------------------------------------- */

const ONBOARDING_STORAGE_KEY = 'ecs_onboarding_checklist';

interface OnboardingItem {
  id: string;
  label: string;
  xpReward: number;
  href?: string;
  action?: 'open_log_xp';
  icon: typeof User;
}

const ONBOARDING_ITEMS: OnboardingItem[] = [
  { id: 'profile', label: 'Compl\u00e8te ton profil', xpReward: 25, href: '/dashboard/profile', icon: User },
  { id: 'first_xp', label: 'Log ta premi\u00e8re action XP', xpReward: 50, action: 'open_log_xp', icon: Plus },
  { id: 'formation', label: 'Commence ta premi\u00e8re formation', xpReward: 25, href: '/dashboard/formations', icon: BookOpen },
  { id: 'quest', label: 'Accepte ta premi\u00e8re qu\u00eate', xpReward: 25, href: '/dashboard/quests', icon: Target },
  { id: 'leaderboard', label: 'Consulte le classement', xpReward: 10, href: '/dashboard/leaderboard', icon: Trophy },
  { id: 'timer', label: 'Lance ton premier timer de travail', xpReward: 15, href: '/dashboard/timer', icon: Timer },
];

function getCompletedItems(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored) as string[]);
  } catch {
    // Invalid stored data
  }
  return new Set();
}

function saveCompletedItems(items: Set<string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(Array.from(items)));
}

function OnboardingChecklist({
  onOpenLogXP,
}: {
  onOpenLogXP: () => void;
}) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setCompleted(getCompletedItems());
  }, []);

  const allDone = completed.size === ONBOARDING_ITEMS.length;

  const handleToggle = useCallback((item: OnboardingItem) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
        // If completing the last one, show celebration
        if (next.size === ONBOARDING_ITEMS.length) {
          setTimeout(() => setShowCelebration(true), 300);
        }
      }
      saveCompletedItems(next);
      return next;
    });
  }, []);

  const handleItemClick = useCallback((item: OnboardingItem) => {
    if (item.action === 'open_log_xp') {
      onOpenLogXP();
    }
  }, [onOpenLogXP]);

  const progress = (completed.size / ONBOARDING_ITEMS.length) * 100;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl border border-[#FFBF00]/20 bg-gradient-to-br from-[#FFBF00]/[0.06] via-white/[0.02] to-transparent p-6 backdrop-blur-xl"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[#FFBF00]/[0.08] blur-[80px]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFBF00] to-[#FF9D00] shadow-lg shadow-[#FFBF00]/20">
            <Sparkles className="h-5 w-5 text-[#0C0C0C]" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Tes premiers pas
            </h2>
            <p className="text-xs text-ecs-gray">
              {completed.size}/{ONBOARDING_ITEMS.length} compl&eacute;t&eacute;s
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06] mb-5">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#FFBF00] to-[#FF9D00]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          {ONBOARDING_ITEMS.map((item, index) => {
            const isDone = completed.has(item.id);
            const IconComp = item.icon;
            const sharedClassName = `group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
              isDone
                ? 'bg-[#FFBF00]/[0.06] border border-[#FFBF00]/15'
                : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10 cursor-pointer'
            }`;
            const handleClick = () => {
              if (!isDone && item.action) handleItemClick(item);
              handleToggle(item);
            };

            const children = (
              <>
                {/* Checkbox */}
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all ${
                  isDone
                    ? 'bg-[#FFBF00] border-[#FFBF00] shadow-[0_0_8px_rgba(255,191,0,0.3)]'
                    : 'border-white/20 bg-white/5 group-hover:border-white/30'
                }`}>
                  {isDone && <Check className="h-3.5 w-3.5 text-[#0C0C0C]" />}
                </div>

                {/* Icon */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isDone ? 'bg-[#FFBF00]/10' : 'bg-white/5'
                }`}>
                  <IconComp className={`h-4 w-4 ${isDone ? 'text-[#FFBF00]' : 'text-ecs-gray'}`} />
                </div>

                {/* Label */}
                <span className={`flex-1 text-sm font-medium transition-all ${
                  isDone ? 'text-white/40 line-through' : 'text-white/80'
                }`}>
                  {item.label}
                </span>

                {/* XP reward */}
                <span className={`text-xs font-display font-bold shrink-0 ${
                  isDone ? 'text-[#FFBF00]/40' : 'text-[#FFBF00]'
                }`}>
                  +{item.xpReward} XP
                </span>

                {!isDone && <ChevronRight className="h-4 w-4 text-ecs-gray/50 group-hover:text-ecs-gray transition-colors" />}
              </>
            );

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.06, duration: 0.3 }}
              >
                {item.href && !isDone ? (
                  <Link href={item.href} className={sharedClassName} onClick={handleClick}>
                    {children}
                  </Link>
                ) : (
                  <div className={sharedClassName} onClick={handleClick}>
                    {children}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Celebration */}
        <AnimatePresence>
          {allDone && showCelebration && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16 }}
              className="mt-5 rounded-xl border border-[#FFBF00]/30 bg-gradient-to-r from-[#FFBF00]/10 to-[#FF9D00]/10 p-5 text-center"
            >
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex mb-2"
              >
                <PartyPopper className="h-8 w-8 text-[#FFBF00]" />
              </motion.div>
              <p className="font-display text-lg font-bold text-white mb-1">
                F&eacute;licitations !
              </p>
              <p className="text-sm text-[#FFBF00]">
                Tu es officiellement un joueur ECS GAME !
              </p>
              <p className="text-xs text-white/40 mt-1">
                +150 XP bonus d&eacute;bloqu&eacute;s
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Quick Action XP Cards                             */
/* -------------------------------------------------------------------------- */

interface QuickXPAction {
  id: string;
  icon: typeof Phone;
  label: string;
  source: string;
  xpAmount: number;
  description: string;
}

const QUICK_XP_ACTIONS: QuickXPAction[] = [
  { id: 'call', icon: Phone, label: 'Logger un appel', source: 'call_booked', xpAmount: 30, description: 'Appel book\u00e9' },
  { id: 'deal', icon: Handshake, label: 'Logger un deal', source: 'deal_closed', xpAmount: 100, description: 'Deal conclu' },
  { id: 'lead', icon: UserPlus, label: 'Logger un lead', source: 'lead_generated', xpAmount: 20, description: 'Lead g\u00e9n\u00e9r\u00e9' },
];

function ActionCenter({
  onOpenLogXP,
}: {
  onOpenLogXP: () => void;
}) {
  const addXP = usePlayerStore((s) => s.addXP);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [xpAnimation, setXpAnimation] = useState<{ id: string; amount: number } | null>(null);

  const handleQuickXP = useCallback(async (action: QuickXPAction) => {
    setLoadingAction(action.id);

    try {
      const response = await fetch('/api/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: action.source,
          amount: action.xpAmount,
          description: action.description,
        }),
      });

      if (response.ok) {
        addXP(action.xpAmount, action.source);
        setXpAnimation({ id: action.id, amount: action.xpAmount });

        // Dispatch sound event
        window.dispatchEvent(new CustomEvent('ecs:xp-earned', {
          detail: { amount: action.xpAmount, source: action.source },
        }));

        // Clear animation after delay
        setTimeout(() => setXpAnimation(null), 1500);
      }
    } catch {
      // Request failed silently
    } finally {
      setLoadingAction(null);
    }
  }, [addXP]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">
          Actions rapides
        </h2>
        <span className="text-xs text-ecs-gray font-display">
          1 clic = XP imm&eacute;diat
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_XP_ACTIONS.map((action, index) => {
          const IconComp = action.icon;
          const isLoading = loadingAction === action.id;
          const showAnim = xpAnimation?.id === action.id;

          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.08, duration: 0.4 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              disabled={isLoading}
              onClick={() => handleQuickXP(action)}
              className="relative group overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-xl transition-all duration-300 hover:border-[#FFBF00]/20 hover:bg-white/[0.05] disabled:opacity-60 text-left"
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 191, 0, 0.1), transparent 70%)',
                }}
              />

              <div className="relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFBF00]/15 to-[#FF9D00]/10 mb-3">
                  <IconComp className="h-5 w-5 text-[#FFBF00]" />
                </div>
                <p className="font-display text-sm font-bold text-white mb-1">
                  {action.label}
                </p>
                <p className="font-display text-xs font-bold text-[#FFBF00]">
                  +{action.xpAmount} XP
                </p>
              </div>

              {/* XP earned animation */}
              <AnimatePresence>
                {showAnim && (
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -40, scale: 1.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="absolute inset-0 flex items-center justify-center z-20"
                  >
                    <span className="font-display text-2xl font-black text-[#FFBF00] drop-shadow-[0_0_12px_rgba(255,191,0,0.6)]">
                      +{xpAnimation.amount} XP
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        {/* Free action — opens full LogXPForm */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.64, duration: 0.4 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenLogXP}
          className="relative group overflow-hidden rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 backdrop-blur-xl transition-all duration-300 hover:border-[#FFBF00]/20 hover:bg-white/[0.04] text-left"
        >
          <div className="relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 mb-3">
              <FileText className="h-5 w-5 text-ecs-gray" />
            </div>
            <p className="font-display text-sm font-bold text-white/80 mb-1">
              Action libre
            </p>
            <p className="font-display text-xs text-ecs-gray">
              Formulaire complet
            </p>
          </div>
        </motion.button>
      </div>
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/*                          LogXP Modal Wrapper                               */
/* -------------------------------------------------------------------------- */

function LogXPModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-lg"
          >
            <div className="rounded-2xl border border-white/10 bg-[#0C0C0C]/95 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-white">
                  Logger du XP
                </h2>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Plus className="h-4 w-4 rotate-45" />
                </button>
              </div>
              <LogXPForm />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
  xpEventCount,
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
  const [logXPOpen, setLogXPOpen] = useState(false);

  const isNewUser = xpEventCount <= 5;

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
      {/*  ONBOARDING CHECKLIST (new users only)                             */}
      {/* ================================================================== */}
      {isNewUser && (
        <OnboardingChecklist onOpenLogXP={() => setLogXPOpen(true)} />
      )}

      {/* ================================================================== */}
      {/*  ACTION CENTER — Quick XP actions                                  */}
      {/* ================================================================== */}
      <ActionCenter onOpenLogXP={() => setLogXPOpen(true)} />

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

      {/* LogXP Modal */}
      <LogXPModal isOpen={logXPOpen} onClose={() => setLogXPOpen(false)} />
    </motion.div>
  );
}
