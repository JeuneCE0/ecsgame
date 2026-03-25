'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { soundEngine } from '@/lib/game/sound-engine';

interface UseGameSoundsReturn {
  toggleMute: () => void;
  isMuted: boolean;
}

export function useGameSounds(): UseGameSoundsReturn {
  const [isMuted, setIsMuted] = useState(false);

  const totalXP = usePlayerStore((s) => s.totalXP);
  const showLevelUpModal = usePlayerStore((s) => s.showLevelUpModal);
  const currentStreak = usePlayerStore((s) => s.currentStreak);
  const xpNotification = usePlayerStore((s) => s.xpNotification);

  const prevTotalXPRef = useRef(totalXP);
  const prevLevelUpRef = useRef(showLevelUpModal);
  const prevStreakRef = useRef(currentStreak);
  const initializedRef = useRef(false);

  // Skip sounds on initial mount to avoid playing on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      initializedRef.current = true;
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // XP gain sound
  useEffect(() => {
    if (!initializedRef.current) {
      prevTotalXPRef.current = totalXP;
      return;
    }

    if (totalXP > prevTotalXPRef.current && xpNotification) {
      soundEngine.playXPGain();
    }

    prevTotalXPRef.current = totalXP;
  }, [totalXP, xpNotification]);

  // Level up sound
  useEffect(() => {
    if (!initializedRef.current) {
      prevLevelUpRef.current = showLevelUpModal;
      return;
    }

    if (showLevelUpModal && !prevLevelUpRef.current) {
      soundEngine.playLevelUp();
    }

    prevLevelUpRef.current = showLevelUpModal;
  }, [showLevelUpModal]);

  // Streak change sound
  useEffect(() => {
    if (!initializedRef.current) {
      prevStreakRef.current = currentStreak;
      return;
    }

    if (currentStreak > prevStreakRef.current && currentStreak > 0) {
      soundEngine.playStreakBonus();
    }

    prevStreakRef.current = currentStreak;
  }, [currentStreak]);

  const toggleMute = useCallback(() => {
    const nowMuted = soundEngine.toggleMute();
    setIsMuted(nowMuted);
  }, []);

  return { toggleMute, isMuted };
}
