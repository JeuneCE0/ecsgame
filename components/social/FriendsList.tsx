'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Check,
  X,
  Search,
  Users,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useChatStore } from '@/stores/useChatStore';

interface Friend {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  level: number;
  status: 'online' | 'idle' | 'offline';
}

interface FriendRequest {
  id: string;
  requesterId: string;
  fullName: string;
  avatarUrl: string | null;
  level: number;
  createdAt: string;
}

interface SearchResult {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  level: number;
}

const STATUS_DOT: Record<string, string> = {
  online: 'bg-emerald-400',
  idle: 'bg-yellow-400',
  offline: 'bg-white/20',
};

export function FriendsList() {
  const supabase = createClient();
  const openChat = useChatStore((s) => s.openChat);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const loadFriends = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    // Get accepted friendships
    const { data: friendships } = await supabase
      .from('friendships')
      .select('id, requester_id, receiver_id, status')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (friendships && friendships.length > 0) {
      const friendIds = friendships.map((f) =>
        f.requester_id === user.id ? f.receiver_id : f.requester_id
      );

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, level')
        .in('id', friendIds);

      // Get presence status
      const { data: presenceData } = await supabase
        .from('presence')
        .select('user_id, status')
        .in('user_id', friendIds);

      const presenceMap = new Map(
        (presenceData ?? []).map((p) => [p.user_id, p.status])
      );

      const friendList: Friend[] = (profiles ?? [])
        .map((p) => ({
          userId: p.id,
          fullName: p.full_name,
          avatarUrl: p.avatar_url,
          level: p.level,
          status: (presenceMap.get(p.id) ?? 'offline') as 'online' | 'idle' | 'offline',
        }))
        .sort((a, b) => {
          const order = { online: 0, idle: 1, offline: 2 };
          return order[a.status] - order[b.status];
        });

      setFriends(friendList);
    } else {
      setFriends([]);
    }

    // Get pending requests received
    const { data: pending } = await supabase
      .from('friendships')
      .select('id, requester_id, created_at')
      .eq('receiver_id', user.id)
      .eq('status', 'pending');

    if (pending && pending.length > 0) {
      const requesterIds = pending.map((p) => p.requester_id);
      const { data: requesterProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, level')
        .in('id', requesterIds);

      const profileMap = new Map(
        (requesterProfiles ?? []).map((p) => [p.id, p])
      );

      const requests: FriendRequest[] = pending
        .map((p) => {
          const prof = profileMap.get(p.requester_id);
          if (!prof) return null;
          return {
            id: p.id,
            requesterId: p.requester_id,
            fullName: prof.full_name,
            avatarUrl: prof.avatar_url,
            level: prof.level,
            createdAt: p.created_at,
          };
        })
        .filter((r): r is FriendRequest => r !== null);

      setPendingRequests(requests);
    } else {
      setPendingRequests([]);
    }
  }, [supabase]);

  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  // Search for users
  useEffect(() => {
    if (!searchQuery.trim() || !currentUserId) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, level')
        .neq('id', currentUserId)
        .ilike('full_name', `%${searchQuery}%`)
        .limit(10);

      setSearchResults(
        (data ?? []).map((p) => ({
          id: p.id,
          fullName: p.full_name,
          avatarUrl: p.avatar_url,
          level: p.level,
        }))
      );
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery, currentUserId, supabase]);

  const handleAccept = async (friendshipId: string) => {
    setProcessingIds((prev) => { const next = new Set(prev); next.add(friendshipId); return next; });

    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);

    if (!error) {
      void loadFriends();
    }

    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(friendshipId);
      return next;
    });
  };

  const handleDecline = async (friendshipId: string) => {
    setProcessingIds((prev) => { const next = new Set(prev); next.add(friendshipId); return next; });

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (!error) {
      void loadFriends();
    }

    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(friendshipId);
      return next;
    });
  };

  const handleSendRequest = async (targetId: string) => {
    if (!currentUserId) return;

    setProcessingIds((prev) => { const next = new Set(prev); next.add(targetId); return next; });

    await supabase.from('friendships').insert({
      requester_id: currentUserId,
      receiver_id: targetId,
      status: 'pending',
    });

    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(targetId);
      return next;
    });

    setSearchQuery('');
    setShowSearch(false);
  };

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden',
        'bg-black/40 backdrop-blur-xl',
        'border border-white/[0.04]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-ecs-gray" />
          <span className="text-xs font-display font-semibold text-white/70">
            Amis ({friends.length})
          </span>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSearch(!showSearch)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5',
            'bg-white/[0.04] border border-white/[0.06]',
            'text-[10px] font-medium text-white/50',
            'hover:text-white/70 transition-colors'
          )}
        >
          <UserPlus className="h-3 w-3" />
          Ajouter
        </motion.button>
      </div>

      {/* Search section */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden border-b border-white/[0.04]"
          >
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom..."
                  className={cn(
                    'w-full rounded-lg pl-9 pr-3 py-2 text-xs',
                    'bg-white/[0.03] border border-white/[0.06]',
                    'text-white/80 placeholder-white/20',
                    'focus:outline-none focus:border-ecs-amber/30',
                    'transition-colors'
                  )}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-white/25" />
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 space-y-1">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ecs-black-card border border-white/[0.06]">
                          {result.avatarUrl ? (
                            <img
                              src={result.avatarUrl}
                              alt={result.fullName}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-[9px] font-bold text-ecs-amber">
                              {result.fullName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-xs text-white/70">{result.fullName}</span>
                          <span className="ml-1.5 text-[9px] text-ecs-amber">
                            Niv. {result.level}
                          </span>
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => void handleSendRequest(result.id)}
                        disabled={processingIds.has(result.id)}
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-md',
                          'bg-ecs-amber/10 text-ecs-amber',
                          'hover:bg-ecs-amber/20 transition-colors',
                          processingIds.has(result.id) && 'opacity-50'
                        )}
                      >
                        {processingIds.has(result.id) ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <UserPlus className="h-3 w-3" />
                        )}
                      </motion.button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <div className="border-b border-white/[0.04]">
          <p className="px-4 pt-3 pb-1.5 text-[10px] font-display font-semibold text-ecs-amber/60 uppercase tracking-wider">
            Demandes en attente ({pendingRequests.length})
          </p>
          <div className="px-2 pb-2 space-y-0.5">
            {pendingRequests.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ecs-black-card border border-white/[0.06]">
                    {req.avatarUrl ? (
                      <img
                        src={req.avatarUrl}
                        alt={req.fullName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-[9px] font-bold text-ecs-amber">
                        {req.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/70">{req.fullName}</span>
                </div>

                <div className="flex items-center gap-1">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => void handleAccept(req.id)}
                    disabled={processingIds.has(req.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    {processingIds.has(req.id) ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => void handleDecline(req.id)}
                    disabled={processingIds.has(req.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div className="px-2 py-2 max-h-[250px] overflow-y-auto space-y-0.5">
        {friends.length === 0 && pendingRequests.length === 0 && (
          <p className="px-2.5 py-4 text-center text-xs text-white/20">
            Pas encore d&apos;amis. Ajoutez des joueurs !
          </p>
        )}

        <AnimatePresence mode="popLayout">
          {friends.map((friend) => (
            <motion.button
              key={friend.userId}
              type="button"
              onClick={() => openChat(friend.userId)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors"
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ecs-black-card border border-white/[0.06]">
                {friend.avatarUrl ? (
                  <img
                    src={friend.avatarUrl}
                    alt={friend.fullName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="font-display text-[10px] font-bold text-ecs-amber">
                    {friend.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ecs-black',
                    STATUS_DOT[friend.status] ?? STATUS_DOT.offline
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-white/80 truncate block">
                  {friend.fullName}
                </span>
                <span className="text-[10px] text-white/25">Niv. {friend.level}</span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
