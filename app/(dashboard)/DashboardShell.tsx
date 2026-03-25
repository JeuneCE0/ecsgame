'use client';

import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MobileNav from '@/components/layout/MobileNav';
import { LevelUpModal } from '@/components/game/LevelUpModal';
import { XPNotification } from '@/components/game/XPNotification';
import { usePlayerStore } from '@/stores/usePlayerStore';

interface DashboardShellProps {
  initialPlayer: {
    level: number;
    totalXP: number;
    currentStreak: number;
  };
  children: React.ReactNode;
}

export default function DashboardShell({
  initialPlayer,
  children,
}: DashboardShellProps) {
  const setPlayer = usePlayerStore((s) => s.setPlayer);

  useEffect(() => {
    setPlayer(initialPlayer);
  }, [initialPlayer, setPlayer]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        <main className="flex-1 px-4 pt-4 pb-20 md:px-8 md:pt-6 md:pb-8">
          {children}
        </main>
        <MobileNav />
      </div>
      <LevelUpModal />
      <XPNotification />
    </div>
  );
}
