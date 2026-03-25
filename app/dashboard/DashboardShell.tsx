'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MobileNav from '@/components/layout/MobileNav';
import { LevelUpModal } from '@/components/game/LevelUpModal';
import { XPNotification } from '@/components/game/XPNotification';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { usePresence } from '@/hooks/usePresence';

/* Lazy-load heavy, non-critical overlays to reduce initial bundle size */
const ComboSystem = dynamic(
  () => import('@/components/game/ComboSystem').then((m) => ({ default: m.ComboSystem })),
  { ssr: false }
);
const FloatingXP = dynamic(
  () => import('@/components/game/FloatingXP').then((m) => ({ default: m.FloatingXP })),
  { ssr: false }
);
const EchoCompanion = dynamic(
  () => import('@/components/game/EchoCompanion').then((m) => ({ default: m.EchoCompanion })),
  { ssr: false }
);
const CommandPalette = dynamic(
  () => import('@/components/game/CommandPalette').then((m) => ({ default: m.CommandPalette })),
  { ssr: false }
);
const ProgressCelebration = dynamic(
  () => import('@/components/game/ProgressCelebration').then((m) => ({ default: m.ProgressCelebration })),
  { ssr: false }
);
const DailyRewardModal = dynamic(
  () => import('@/components/game/DailyRewardModal').then((m) => ({ default: m.DailyRewardModal })),
  { ssr: false }
);
const GuidedTutorial = dynamic(
  () => import('@/components/game/GuidedTutorial').then((m) => ({ default: m.GuidedTutorial })),
  { ssr: false }
);
const NotificationCenter = dynamic(
  () => import('@/components/game/NotificationCenter').then((m) => ({ default: m.NotificationCenter })),
  { ssr: false }
);
const ChatPanel = dynamic(
  () => import('@/components/social/ChatPanel').then((m) => ({ default: m.ChatPanel })),
  { ssr: false }
);
const OnlinePlayers = dynamic(
  () => import('@/components/social/OnlinePlayers').then((m) => ({ default: m.OnlinePlayers })),
  { ssr: false }
);
const FriendsList = dynamic(
  () => import('@/components/social/FriendsList').then((m) => ({ default: m.FriendsList })),
  { ssr: false }
);

interface DashboardShellProps {
  initialPlayer: {
    level: number;
    totalXP: number;
    currentStreak: number;
  };
  children: React.ReactNode;
}

/* Page transition variants */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(4px)',
    transition: {
      duration: 0.25,
    },
  },
};

export default function DashboardShell({
  initialPlayer,
  children,
}: DashboardShellProps) {
  const setPlayer = usePlayerStore((s) => s.setPlayer);
  const pathname = usePathname();

  usePresence();

  useEffect(() => {
    setPlayer(initialPlayer);
  }, [initialPlayer, setPlayer]);

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Ambient background layers */}

      {/* Grid pattern */}
      <div className="ambient-grid" />

      {/* Gradient mesh orbs */}
      <div className="gradient-mesh">
        <div className="gradient-mesh-orb gradient-mesh-orb-1" />
        <div className="gradient-mesh-orb gradient-mesh-orb-2" />
        <div className="gradient-mesh-orb gradient-mesh-orb-3" />
      </div>

      {/* Floating particle layer */}
      <div className="ambient-particles" />

      {/* Main layout */}
      <Sidebar />

      <div className="relative z-10 flex flex-1 flex-col min-w-0">
        <TopBar />

        <div className="flex flex-1 min-h-0">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.main
                key={pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 px-4 pt-4 pb-24 md:px-8 md:pt-6 md:pb-8"
              >
                {children}
              </motion.main>
            </AnimatePresence>
          </div>

          {/* Social sidebar (desktop only) */}
          <div className="hidden xl:flex w-[240px] shrink-0 flex-col gap-3 pr-4 pt-4 overflow-y-auto max-h-[calc(100vh-80px)]">
            <OnlinePlayers />
            <FriendsList />
          </div>
        </div>

        <MobileNav />
      </div>

      {/* Global overlays & modals */}
      <ChatPanel />
      <LevelUpModal />
      <XPNotification />
      <ComboSystem />
      <FloatingXP />
      <EchoCompanion />
      <CommandPalette />
      <ProgressCelebration />
      <DailyRewardModal />
      <GuidedTutorial />
      <NotificationCenter />
    </div>
  );
}
