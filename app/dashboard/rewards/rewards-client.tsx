'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatXP } from '@/lib/utils';

interface Reward {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  cost_xp: number;
  is_active: boolean;
  stock: number | null;
}

interface ClaimedReward {
  id: string;
  reward_id: string;
  claimed_at: string;
  reward: {
    id: string;
    name: string;
    description: string;
    image_url: string | null;
    cost_xp: number;
  };
}

interface RewardsClientProps {
  rewards: Reward[];
  claimedRewards: ClaimedReward[];
  currentXP: number;
}

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
};

export default function RewardsClient({ rewards, claimedRewards, currentXP }: RewardsClientProps) {
  const [claimingId, setClaimingId] = useState<string | null>(null);

  async function handleClaim(rewardId: string) {
    setClaimingId(rewardId);
    try {
      await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      });
      window.location.reload();
    } catch {
      // Error handled silently
    } finally {
      setClaimingId(null);
    }
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={childVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFBF00] to-[#FF9D00] flex items-center justify-center shadow-[0_0_20px_rgba(255,191,0,0.3)]">
            <svg className="w-5 h-5 text-[#0C0C0C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
              R&eacute;compenses
            </h1>
            <p className="text-white/40 text-sm">
              &Eacute;changez vos XP contre des r&eacute;compenses exclusives.
            </p>
          </div>
        </div>

        {/* Wallet balance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative inline-flex items-center gap-3 px-5 py-3 rounded-2xl overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFBF00]/10 to-[#FF9D00]/5 border border-[#FFBF00]/20 rounded-2xl" />
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#FFBF00]/10 rounded-full blur-2xl" />

          <div className="relative flex items-center gap-3">
            {/* Coin icon */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFBF00] to-[#FF9D00] flex items-center justify-center shadow-[0_0_15px_rgba(255,191,0,0.3)]">
              <svg className="w-5 h-5 text-[#0C0C0C]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-white/30 font-display uppercase tracking-wider">Solde disponible</p>
              <p className="font-display font-bold text-[#FFBF00] text-xl tabular-nums">
                {formatXP(currentXP)} <span className="text-sm text-[#FFBF00]/60">XP</span>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Rewards grid */}
      {rewards.length === 0 ? (
        <motion.div
          variants={childVariants}
          className="rounded-2xl bg-black/40 backdrop-blur-sm border border-white/5 text-center py-20"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
            <svg className="w-12 h-12 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-2">
            Aucune r&eacute;compense disponible
          </h2>
          <p className="text-white/30 text-sm">
            De nouvelles r&eacute;compenses seront bient&ocirc;t disponibles.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          animate="visible"
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-10"
        >
          {rewards.map((reward) => {
            const canAfford = currentXP >= reward.cost_xp;
            const outOfStock = reward.stock !== null && reward.stock <= 0;
            const isAvailable = canAfford && !outOfStock;

            return (
              <motion.div
                key={reward.id}
                variants={cardVariants}
                whileHover={isAvailable ? { y: -4, transition: { duration: 0.2 } } : undefined}
                className={cn(
                  'group relative rounded-2xl border flex flex-col overflow-hidden transition-all duration-300',
                  'bg-black/40 backdrop-blur-sm',
                  isAvailable
                    ? 'border-white/5 hover:border-[#FFBF00]/30 hover:shadow-[0_0_30px_rgba(255,191,0,0.1)]'
                    : 'border-white/5 opacity-70'
                )}
              >
                {/* Animated gradient border on hover */}
                {isAvailable && (
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
                    <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-[#FFBF00]/20 via-transparent to-[#FF9D00]/20" />
                  </div>
                )}

                {/* Image */}
                <div className="relative w-full h-44 overflow-hidden">
                  {reward.image_url ? (
                    <img
                      src={reward.image_url}
                      alt={reward.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FFBF00]/10 via-[#FF9D00]/5 to-transparent flex items-center justify-center">
                      <svg className="w-14 h-14 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    </div>
                  )}

                  {/* Stock badge */}
                  {reward.stock !== null && reward.stock > 0 && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
                      <span className="text-[11px] font-display font-medium text-white/60">
                        {reward.stock} restant{reward.stock > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Out of stock overlay */}
                  {outOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="font-display font-bold text-white/40 text-sm uppercase tracking-wider">
                        Rupture de stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative z-10 p-5 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-white text-base mb-1 line-clamp-1 group-hover:text-[#FFBF00] transition-colors">
                    {reward.name}
                  </h3>
                  <p className="text-xs text-white/30 line-clamp-2 mb-4 leading-relaxed">
                    {reward.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3">
                    {/* Cost with coin */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FFBF00] to-[#FF9D00] flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-[#0C0C0C]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className={cn(
                        'font-display font-bold text-lg tabular-nums',
                        canAfford ? 'text-[#FFBF00]' : 'text-white/30'
                      )}>
                        {formatXP(reward.cost_xp)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleClaim(reward.id)}
                      disabled={!canAfford || outOfStock || claimingId === reward.id}
                      className={cn(
                        'px-5 py-2.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider transition-all duration-300',
                        isAvailable
                          ? 'bg-gradient-to-r from-[#FFBF00] to-[#FF9D00] text-[#0C0C0C] hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] hover:scale-[1.02]'
                          : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5',
                        claimingId === reward.id && 'opacity-50 animate-pulse'
                      )}
                    >
                      {claimingId === reward.id
                        ? '...'
                        : outOfStock
                          ? 'Rupture'
                          : !canAfford
                            ? 'Insuffisant'
                            : '\u00c9changer'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Claimed rewards */}
      {claimedRewards.length > 0 && (
        <motion.div
          variants={childVariants}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-display text-lg font-bold text-white">
              R&eacute;compenses obtenues
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="space-y-2">
            {claimedRewards.map((cr, index) => (
              <motion.div
                key={cr.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm flex items-center gap-4 p-4 hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFBF00]/10 to-[#FF9D00]/5 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/5">
                  {cr.reward.image_url ? (
                    <img
                      src={cr.reward.image_url}
                      alt={cr.reward.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-white text-sm truncate">{cr.reward.name}</p>
                  <p className="text-xs text-white/30 truncate">{cr.reward.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FFBF00] to-[#FF9D00] flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-[#0C0C0C]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs text-[#FFBF00]/50 font-display tabular-nums">{formatXP(cr.reward.cost_xp)}</span>
                  </div>
                  <span className="text-xs text-white/20">
                    {new Date(cr.claimed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
