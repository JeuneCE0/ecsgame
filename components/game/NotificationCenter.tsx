'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  CheckCheck,
  Sparkles,
  ArrowUp,
  Scroll,
  Flame,
  Award,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/stores/useNotificationStore';
import type { Notification, NotificationType } from '@/stores/useNotificationStore';

interface NotificationIconConfig {
  icon: typeof Sparkles;
  color: string;
  bgColor: string;
  borderColor: string;
}

const NOTIFICATION_CONFIG: Record<NotificationType, NotificationIconConfig> = {
  xp_gained: {
    icon: Sparkles,
    color: '#FFBF00',
    bgColor: 'rgba(255, 191, 0, 0.12)',
    borderColor: 'rgba(255, 191, 0, 0.2)',
  },
  level_up: {
    icon: ArrowUp,
    color: '#FFBF00',
    bgColor: 'rgba(255, 191, 0, 0.15)',
    borderColor: 'rgba(255, 191, 0, 0.3)',
  },
  quest_available: {
    icon: Scroll,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  streak_warning: {
    icon: Flame,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  badge_earned: {
    icon: Award,
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.12)',
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  leaderboard_change: {
    icon: TrendingUp,
    color: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
};

function formatNotificationTime(timestamp: number): string {
  const now = Date.now();
  const diffSeconds = Math.floor((now - timestamp) / 1000);

  if (diffSeconds < 10) return "à l'instant";
  if (diffSeconds < 60) return `il y a ${diffSeconds}s`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `il y a ${diffMinutes}min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `il y a ${diffDays}j`;
}

function NotificationItem({
  notification,
  index,
}: {
  notification: Notification;
  index: number;
}) {
  const markRead = useNotificationStore((s) => s.markRead);
  const config = NOTIFICATION_CONFIG[notification.type];
  const IconComponent = config.icon;

  const handleClick = useCallback(() => {
    if (!notification.read) {
      markRead(notification.id);
    }
  }, [notification.id, notification.read, markRead]);

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full flex items-start gap-3 rounded-xl p-3 text-left transition-colors',
        'border',
        notification.read
          ? 'border-transparent opacity-60 hover:opacity-80'
          : 'border-white/[0.04] hover:border-white/[0.06]'
      )}
      style={{
        background: notification.read
          ? 'transparent'
          : 'linear-gradient(135deg, rgba(26, 26, 26, 0.6) 0%, rgba(20, 20, 20, 0.8) 100%)',
      }}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 25,
        delay: index * 0.04,
      }}
      whileHover={{ x: -3 }}
    >
      {/* Icon */}
      <div
        className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg"
        style={{
          background: config.bgColor,
          border: `1px solid ${config.borderColor}`,
        }}
      >
        <IconComponent
          className="h-4 w-4"
          style={{ color: config.color }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'font-display text-sm leading-snug',
            notification.read ? 'text-white/60 font-medium' : 'text-white font-bold'
          )}>
            {notification.title}
          </p>
          {!notification.read && (
            <div
              className="shrink-0 mt-1.5 h-2 w-2 rounded-full"
              style={{
                background: config.color,
                boxShadow: `0 0 6px ${config.color}60`,
              }}
            />
          )}
        </div>
        <p className="text-xs text-ecs-gray/70 mt-0.5 line-clamp-2">
          {notification.description}
        </p>
        <p className="text-[10px] text-ecs-gray/40 mt-1 font-display uppercase tracking-wider">
          {formatNotificationTime(notification.timestamp)}
        </p>
      </div>
    </motion.button>
  );
}

function NotificationPanel() {
  const { notifications, markAllRead, isOpen, setOpen } = useNotificationStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const hasUnread = notifications.some((n) => !n.read);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const bellButton = document.querySelector('[data-notification-bell]');
        if (bellButton && bellButton.contains(e.target as Node)) return;
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, setOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            className={cn(
              'fixed right-0 top-0 bottom-0 z-50 w-[380px] max-w-[90vw]',
              'flex flex-col',
              'border-l border-white/[0.06]'
            )}
            style={{
              background: 'linear-gradient(180deg, rgba(12, 12, 12, 0.98) 0%, rgba(10, 10, 10, 0.99) 100%)',
              backdropFilter: 'blur(24px)',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 30,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-ecs-amber" />
                <h2 className="font-display text-base font-bold text-white">
                  Notifications
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {hasUnread && (
                  <motion.button
                    type="button"
                    onClick={markAllRead}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5',
                      'text-xs font-display font-bold uppercase tracking-wider',
                      'text-ecs-amber/70 hover:text-ecs-amber',
                      'bg-ecs-amber/[0.06] hover:bg-ecs-amber/[0.1]',
                      'border border-ecs-amber/10 hover:border-ecs-amber/20',
                      'transition-colors duration-200'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckCheck className="h-3 w-3" />
                    Tout lire
                  </motion.button>
                )}
                <motion.button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    'text-ecs-gray hover:text-white',
                    'bg-white/[0.03] hover:bg-white/[0.06]',
                    'transition-colors duration-200'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {notifications.length === 0 ? (
                  <motion.div
                    className="flex flex-col items-center justify-center py-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -4, 0],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <Bell className="h-10 w-10 text-ecs-gray/30 mb-3" />
                    </motion.div>
                    <p className="text-sm font-display text-ecs-gray/50">
                      Aucune notification
                    </p>
                    <p className="text-xs text-ecs-gray/30 mt-1">
                      Vos alertes apparaîtront ici
                    </p>
                  </motion.div>
                ) : (
                  notifications.map((notification, index) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      index={index}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NotificationBell() {
  const { unreadCount, togglePanel } = useNotificationStore();

  return (
    <motion.button
      type="button"
      data-notification-bell
      onClick={togglePanel}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-xl',
        'bg-white/[0.03] hover:bg-white/[0.06]',
        'border border-white/[0.04] hover:border-white/[0.06]',
        'text-ecs-gray hover:text-white',
        'transition-colors duration-200'
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
    >
      <Bell className="h-[18px] w-[18px]" />

      {/* Unread count badge */}
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            className={cn(
              'absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center',
              'rounded-full px-1 font-display text-[10px] font-bold text-ecs-black'
            )}
            style={{
              background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
              boxShadow: '0 0 8px rgba(255, 191, 0, 0.4), 0 2px 4px rgba(0,0,0,0.3)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 18,
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Pulse ring when there are unread notifications */}
      {unreadCount > 0 && (
        <motion.span
          className="absolute -top-1 -right-1 h-3 w-3 rounded-full pointer-events-none"
          style={{
            background: 'rgba(255, 191, 0, 0.4)',
          }}
          animate={{
            scale: [1, 2],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </motion.button>
  );
}

function NotificationCenter() {
  return (
    <>
      <NotificationPanel />
    </>
  );
}

export { NotificationBell, NotificationPanel, NotificationCenter };
