'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function usePresence() {
  const pathname = usePathname();
  const supabase = createClient();
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<'online' | 'idle' | 'offline'>('online');
  const mountedRef = useRef(false);

  const updatePresence = useCallback(
    async (status: 'online' | 'idle' | 'offline', currentPage?: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
        user_id: user.id,
        status,
        current_page: currentPage ?? pathname,
        last_seen: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('presence')
        .upsert(payload, { onConflict: 'user_id' });

      if (!error) {
        statusRef.current = status;
      }
    },
    [supabase, pathname]
  );

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (statusRef.current === 'idle') {
      void updatePresence('online');
    }

    idleTimerRef.current = setTimeout(() => {
      void updatePresence('idle');
    }, IDLE_TIMEOUT_MS);
  }, [updatePresence]);

  // Set online on mount, offline on unmount
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    void updatePresence('online', pathname);

    const handleBeforeUnload = () => {
      void updatePresence('offline');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void updatePresence('idle');
      } else {
        void updatePresence('online');
        resetIdleTimer();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      void updatePresence('offline');
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track idle from user activity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const;

    const handleActivity = () => {
      resetIdleTimer();
    };

    for (const event of events) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    resetIdleTimer();

    return () => {
      for (const event of events) {
        window.removeEventListener(event, handleActivity);
      }
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [resetIdleTimer]);

  // Update current_page on route change
  useEffect(() => {
    if (mountedRef.current) {
      void updatePresence(statusRef.current, pathname);
    }
  }, [pathname, updatePresence]);
}
