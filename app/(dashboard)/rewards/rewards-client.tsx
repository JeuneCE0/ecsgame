'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
          R&eacute;compenses
        </h1>
        <p className="text-ecs-gray text-sm mb-4">
          &Eacute;changez vos XP contre des r&eacute;compenses exclusives.
        </p>

        {/* Current XP badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ecs-amber/10 border border-ecs-amber/20 mb-6">
          <svg className="w-5 h-5 text-ecs-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <span className="font-display font-bold text-ecs-amber">
            {formatXP(currentXP)} XP disponibles
          </span>
        </div>
      </motion.div>

      {/* Rewards grid */}
      {rewards.length === 0 ? (
        <div className="card-ecs text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-ecs-gray-dark/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-ecs-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-2">
            Aucune r&eacute;compense disponible
          </h2>
          <p className="text-ecs-gray text-sm">
            De nouvelles r&eacute;compenses seront bient&ocirc;t disponibles.
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-10"
        >
          {rewards.map((reward) => {
            const canAfford = currentXP >= reward.cost_xp;
            const outOfStock = reward.stock !== null && reward.stock <= 0;

            return (
              <motion.div
                key={reward.id}
                variants={itemVariants}
                className="card-ecs flex flex-col group transition-all hover:shadow-amber-glow hover:border-ecs-amber/20"
              >
                {/* Image */}
                <div className="w-full h-40 rounded-md bg-ecs-gray-dark/30 mb-4 overflow-hidden flex items-center justify-center">
                  {reward.image_url ? (
                    <img
                      src={reward.image_url}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-ecs-gray/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  )}
                </div>

                <h3 className="font-display font-bold text-white mb-1">
                  {reward.name}
                </h3>
                <p className="text-xs text-ecs-gray line-clamp-2 mb-4">
                  {reward.description}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <span className="font-display font-bold text-ecs-amber">
                    {formatXP(reward.cost_xp)} XP
                  </span>
                  <button
                    onClick={() => handleClaim(reward.id)}
                    disabled={!canAfford || outOfStock || claimingId === reward.id}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-display font-bold uppercase tracking-wider transition-all',
                      canAfford && !outOfStock
                        ? 'btn-primary'
                        : 'bg-ecs-gray-dark text-ecs-gray cursor-not-allowed',
                      claimingId === reward.id && 'opacity-50'
                    )}
                  >
                    {claimingId === reward.id
                      ? '...'
                      : outOfStock
                        ? 'Rupture'
                        : !canAfford
                          ? 'XP insuffisant'
                          : '\u00c9changer'}
                  </button>
                </div>

                {reward.stock !== null && reward.stock > 0 && (
                  <p className="text-xs text-ecs-gray mt-2">
                    {reward.stock} restant{reward.stock > 1 ? 's' : ''}
                  </p>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Claimed rewards */}
      {claimedRewards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="font-display text-lg font-bold text-white mb-4">
            R&eacute;compenses obtenues
          </h2>
          <div className="space-y-2">
            {claimedRewards.map((cr) => (
              <div
                key={cr.id}
                className="card-ecs flex items-center gap-4 p-4"
              >
                <div className="w-12 h-12 rounded-md bg-ecs-gray-dark/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {cr.reward.image_url ? (
                    <img
                      src={cr.reward.image_url}
                      alt={cr.reward.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-ecs-gray/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-white text-sm truncate">{cr.reward.name}</p>
                  <p className="text-xs text-ecs-gray truncate">{cr.reward.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-ecs-gray">
                    {new Date(cr.claimed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
