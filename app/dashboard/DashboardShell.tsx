'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MobileNav from '@/components/layout/MobileNav';
import { LevelUpModal } from '@/components/game/LevelUpModal';
import { XPNotification } from '@/components/game/XPNotification';
import { ComboSystem } from '@/components/game/ComboSystem';
import { FloatingXP } from '@/components/game/FloatingXP';
import { EchoCompanion } from '@/components/game/EchoCompanion';
import { CommandPalette } from '@/components/game/CommandPalette';
import { ProgressCelebration } from '@/components/game/ProgressCelebration';
import { DailyRewardModal } from '@/components/game/DailyRewardModal';
import { GuidedTutorial } from '@/components/game/GuidedTutorial';
import { NotificationCenter } from '@/components/game/NotificationCenter';
import { usePlayerStore } from '@/stores/usePlayerStore';

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

        <MobileNav />
      </div>

      {/* Global overlays & modals */}
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
