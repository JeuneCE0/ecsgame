'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  UserPlus,
  Eye,
  X,
  Flame,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { LEVEL_TITLES } from '@/lib/constants';
import { useChatStore } from '@/stores/useChatStore';

interface PlayerProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
}

interface PlayerPopupProps {
  playerId: string | null;
  onClose: () => void;
  anchorPosition?: { x: number; y: number };
}

export function PlayerPopup({ playerId, onClose, anchorPosition }: PlayerPopupProps) {
  const supabase = createClient();
  const openChat = useChatStore((s) => s.openChat);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    void getUser();
  }, [supabase]);

  // Load player profile
  useEffect(() => {
    if (!playerId) {
      setProfile(null);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setFriendRequestSent(false);

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, level, total_xp, current_streak, longest_streak')
        .eq('id', playerId)
        .single();

      if (data) {
        setProfile({
          id: data.id,
          fullName: data.full_name,
          avatarUrl: data.avatar_url,
          level: data.level,
          totalXp: Number(data.total_xp),
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
        });
      }

      // Check if already friends
      if (currentUserId) {
        const { data: friendship } = await supabase
          .from('friendships')
          .select('id, status')
          .or(
            `and(requester_id.eq.${currentUserId},receiver_id.eq.${playerId}),and(requester_id.eq.${playerId},receiver_id.eq.${currentUserId})`
          )
          .maybeSingle();

        if (friendship) {
          setFriendRequestSent(true);
        }
      }

      setIsLoading(false);
    };

    void load();
  }, [playerId, currentUserId, supabase]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (playerId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [playerId, onClose]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSendFriendRequest = async () => {
    if (!currentUserId || !playerId || friendRequestSent) return;

    const { error } = await supabase.from('friendships').insert({
      requester_id: currentUserId,
      receiver_id: playerId,
      status: 'pending',
    });

    if (!error) {
      setFriendRequestSent(true);
    }
  };

  const handleMessage = () => {
    if (!playerId) return;
    openChat(playerId);
    onClose();
  };

  const popupStyle: React.CSSProperties = anchorPosition
    ? {
        position: 'fixed',
        left: anchorPosition.x,
        top: anchorPosition.y,
      }
    : {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      };

  return (
    <AnimatePresence>
      {playerId && profile && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />

          {/* Popup */}
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={!anchorPosition ? { position: 'fixed', left: '50%', top: '50%' } : popupStyle}
            className={cn(
              'z-[61] w-[300px]',
              'rounded-2xl overflow-hidden',
              'bg-black/80 backdrop-blur-2xl',
              'border border-white/[0.08]',
              'shadow-[0_8px_48px_rgba(0,0,0,0.6)]',
              !anchorPosition && '-translate-x-1/2 -translate-y-1/2'
            )}
          >
            {/* Close button */}
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-white/40 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </motion.button>

            {/* Header gradient */}
            <div className="relative h-20 bg-gradient-to-br from-ecs-amber/20 via-ecs-orange/10 to-transparent">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,191,0,0.15),transparent)]" />
            </div>

            {/* Avatar & Info */}
            <div className="relative px-5 pb-5 -mt-8">
              <div className="flex items-end gap-3">
                {/* Avatar */}
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ecs-black-card to-ecs-black-light border-2 border-ecs-amber/20">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-lg font-bold text-ecs-amber">
                      {profile.fullName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 pb-1">
                  <h3 className="font-display text-sm font-bold text-white truncate">
                    {profile.fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="rounded bg-ecs-amber/10 px-1.5 py-0.5 text-[10px] font-display font-bold text-ecs-amber">
                      Niv. {profile.level}
                    </span>
                    <span className="text-[10px] text-white/35">
                      {LEVEL_TITLES[profile.level] ?? 'Inconnu'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-2.5 text-center">
                  <p className="font-display text-sm font-bold text-ecs-amber">
                    {profile.totalXp.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-[9px] text-white/30 mt-0.5">XP Total</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="h-3 w-3 text-ecs-amber" />
                    <span className="font-display text-sm font-bold text-ecs-amber">
                      {profile.currentStreak}
                    </span>
                  </div>
                  <p className="text-[9px] text-white/30 mt-0.5">Streak</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3 text-white/40" />
                    <span className="font-display text-sm font-bold text-white/60">
                      {profile.longestStreak}
                    </span>
                  </div>
                  <p className="text-[9px] text-white/30 mt-0.5">Record</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-col gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMessage}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl py-2.5',
                    'bg-gradient-to-r from-ecs-amber to-ecs-orange',
                    'text-black text-xs font-display font-bold',
                    'transition-shadow hover:shadow-amber-glow'
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Envoyer un message
                </motion.button>

                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void handleSendFriendRequest()}
                    disabled={friendRequestSent}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2',
                      'bg-white/[0.04] border border-white/[0.06]',
                      'text-white/60 text-xs font-medium',
                      'hover:bg-white/[0.06] hover:text-white/80 transition-colors',
                      friendRequestSent && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    {friendRequestSent ? 'Demande envoyee' : 'Ajouter en ami'}
                  </motion.button>

                  <motion.a
                    href={`/dashboard/profile/${profile.id}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2',
                      'bg-white/[0.04] border border-white/[0.06]',
                      'text-white/60 text-xs font-medium',
                      'hover:bg-white/[0.06] hover:text-white/80 transition-colors'
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Voir le profil
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
