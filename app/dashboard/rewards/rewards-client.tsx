'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatXP } from '@/lib/utils';
import {
  SHOP_CATEGORIES,
  SHOP_ITEMS,
  BADGE_RARITIES,
  type ShopCategoryId,
  type ShopItem,
} from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ShopClientProps {
  currentXP: number;
  currentLevel: number;
  purchasedItemIds: string[];
}

type RarityKey = keyof typeof BADGE_RARITIES;

/* ------------------------------------------------------------------ */
/*  Rarity helpers                                                     */
/* ------------------------------------------------------------------ */

const RARITY_BORDER: Record<RarityKey, string> = {
  common: 'border-white/10 hover:border-white/25',
  rare: 'border-blue-500/20 hover:border-blue-400/50',
  epic: 'border-purple-500/20 hover:border-purple-400/50',
  legendary: 'border-[#FFBF00]/20 hover:border-[#FFBF00]/60',
};

const RARITY_GLOW: Record<RarityKey, string> = {
  common: '',
  rare: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
  epic: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
  legendary: 'hover:shadow-[0_0_40px_rgba(255,191,0,0.2)]',
};

const RARITY_BADGE_BG: Record<RarityKey, string> = {
  common: 'bg-white/10 text-white/60',
  rare: 'bg-blue-500/15 text-blue-400',
  epic: 'bg-purple-500/15 text-purple-400',
  legendary: 'bg-[#FFBF00]/15 text-[#FFBF00]',
};

const RARITY_EMOJI_BG: Record<RarityKey, string> = {
  common: 'from-white/5 to-white/[0.02]',
  rare: 'from-blue-500/10 to-blue-500/[0.02]',
  epic: 'from-purple-500/10 to-purple-500/[0.02]',
  legendary: 'from-[#FFBF00]/10 to-[#FF9D00]/[0.02]',
};

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

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

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const CATEGORY_KEYS = Object.keys(SHOP_CATEGORIES) as ShopCategoryId[];

function getAllItems(): ShopItem[] {
  return [
    ...SHOP_ITEMS.formations,
    ...SHOP_ITEMS.boosts,
    ...SHOP_ITEMS.cosmetics,
    ...SHOP_ITEMS.services,
  ];
}

function getItemsByCategory(cat: ShopCategoryId): ShopItem[] {
  return SHOP_ITEMS[cat] as unknown as ShopItem[];
}

function hasStatsBoost(item: ShopItem): item is ShopItem & { stats_boost: Record<string, number> } {
  return 'stats_boost' in item;
}

function hasDuration(item: ShopItem): item is ShopItem & { duration: string } {
  return 'duration' in item;
}

function hasLessons(item: ShopItem): item is ShopItem & { lessons: number } {
  return 'lessons' in item;
}

function hasPriceEur(item: ShopItem): item is ShopItem & { price_eur: number } {
  return 'price_eur' in item;
}

function hasEffect(item: ShopItem): item is ShopItem & { effect: string } {
  return 'effect' in item;
}

function hasMinLevel(item: ShopItem): item is ShopItem & { min_level: number } {
  return 'min_level' in item;
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function XPCoinIcon({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'w-12 h-12' : size === 'md' ? 'w-8 h-8' : 'w-6 h-6';
  const iconDim = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3';
  return (
    <div
      className={cn(
        dim,
        'rounded-full bg-gradient-to-br from-[#FFBF00] to-[#FF9D00] flex items-center justify-center flex-shrink-0',
        size === 'lg' && 'shadow-[0_0_20px_rgba(255,191,0,0.3)]',
      )}
    >
      <svg className={cn(iconDim, 'text-[#0C0C0C]')} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Item Detail Modal                                                  */
/* ------------------------------------------------------------------ */

function ItemDetailModal({
  item,
  currentXP,
  currentLevel,
  isPurchased,
  onClose,
  onBuyXP,
}: {
  item: ShopItem;
  currentXP: number;
  currentLevel: number;
  isPurchased: boolean;
  onClose: () => void;
  onBuyXP: (itemId: string) => void;
}) {
  const rarity = item.rarity as RarityKey;
  const canAffordXP = currentXP >= item.price_xp;
  const levelLocked = hasMinLevel(item) && currentLevel < item.min_level;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full max-w-lg rounded-2xl border overflow-hidden',
          'bg-[#141414]/95 backdrop-blur-xl',
          RARITY_BORDER[rarity],
        )}
      >
        {/* Rarity glow at top */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: BADGE_RARITIES[rarity].color }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Emoji + header */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className={cn(
                'w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-4xl flex-shrink-0',
                RARITY_EMOJI_BG[rarity],
              )}
            >
              {item.image_emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    'text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                    RARITY_BADGE_BG[rarity],
                  )}
                >
                  {BADGE_RARITIES[rarity].label}
                </span>
                {hasDuration(item) && (
                  <span className="text-[10px] font-display text-white/30 uppercase tracking-wider">
                    {item.duration}
                  </span>
                )}
              </div>
              <h3 className="font-display font-bold text-white text-xl mb-1">
                {item.name}
              </h3>
              <p className="text-sm text-white/40 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>

          {/* Stats / details */}
          <div className="space-y-3 mb-6">
            {hasStatsBoost(item) && (
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                <p className="text-[11px] font-display text-white/30 uppercase tracking-wider mb-2">
                  Bonus de stats
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(item.stats_boost).map(([stat, value]) => (
                    <span
                      key={stat}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-display font-bold"
                    >
                      +{value} {stat.charAt(0).toUpperCase() + stat.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasLessons(item) && (
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                <p className="text-[11px] font-display text-white/30 uppercase tracking-wider mb-2">
                  Contenu
                </p>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-1.5">
                    <span className="text-lg">📖</span>
                    {item.lessons} lecons
                  </span>
                  {hasDuration(item) && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-lg">⏱️</span>
                      {item.duration}
                    </span>
                  )}
                </div>
              </div>
            )}

            {hasEffect(item) && (
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                <p className="text-[11px] font-display text-white/30 uppercase tracking-wider mb-2">
                  Effet
                </p>
                <p className="text-sm text-white/60">
                  {item.description}
                </p>
                {hasDuration(item) && (
                  <p className="text-xs text-white/30 mt-1">
                    Durée : {item.duration}
                  </p>
                )}
              </div>
            )}

            {hasMinLevel(item) && (
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <span className={cn(
                  'text-sm font-display',
                  levelLocked ? 'text-red-400' : 'text-green-400',
                )}>
                  Niveau {item.min_level} requis
                  {!levelLocked && ' — Débloqué !'}
                </span>
              </div>
            )}
          </div>

          {/* Price + buy buttons */}
          <div className="border-t border-white/5 pt-5 space-y-3">
            {isPurchased ? (
              <div className="text-center py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <span className="font-display font-bold text-green-400 uppercase tracking-wider text-sm">
                  Déjà acheté
                </span>
              </div>
            ) : levelLocked ? (
              <div className="text-center py-3 rounded-xl bg-white/5 border border-white/10">
                <span className="font-display font-bold text-white/30 uppercase tracking-wider text-sm">
                  Niveau {hasMinLevel(item) ? item.min_level : 0} requis
                </span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onBuyXP(item.id)}
                  disabled={!canAffordXP}
                  className={cn(
                    'w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-display font-bold uppercase tracking-wider text-sm transition-all duration-300',
                    canAffordXP
                      ? 'bg-gradient-to-r from-[#FFBF00] to-[#FF9D00] text-[#0C0C0C] hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] hover:scale-[1.01]'
                      : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5',
                  )}
                >
                  <XPCoinIcon size="sm" />
                  <span>
                    {canAffordXP ? `Acheter — ${formatXP(item.price_xp)} XP` : `${formatXP(item.price_xp)} XP requis`}
                  </span>
                </button>

                {hasPriceEur(item) && (
                  <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-display font-bold uppercase tracking-wider text-sm border border-green-500/20 text-green-400 hover:bg-green-500/5 hover:border-green-500/40 transition-all duration-300">
                    <span className="text-base">💳</span>
                    Acheter — {item.price_eur}€
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Item Card                                                          */
/* ------------------------------------------------------------------ */

function ShopItemCard({
  item,
  currentXP,
  currentLevel,
  isPurchased,
  onSelect,
  onBuyXP,
}: {
  item: ShopItem;
  currentXP: number;
  currentLevel: number;
  isPurchased: boolean;
  onSelect: () => void;
  onBuyXP: (itemId: string) => void;
}) {
  const rarity = item.rarity as RarityKey;
  const canAffordXP = currentXP >= item.price_xp;
  const levelLocked = hasMinLevel(item) && currentLevel < item.min_level;
  const isAvailable = canAffordXP && !levelLocked && !isPurchased;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={!isPurchased ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'group relative rounded-2xl border flex flex-col overflow-hidden transition-all duration-300 cursor-pointer',
        'bg-black/40 backdrop-blur-sm',
        isPurchased
          ? 'border-green-500/20 opacity-80'
          : RARITY_BORDER[rarity],
        !isPurchased && RARITY_GLOW[rarity],
      )}
      onClick={onSelect}
    >
      {/* Rarity color accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: BADGE_RARITIES[rarity].color }}
      />

      {/* Emoji "image" area */}
      <div
        className={cn(
          'relative w-full h-36 flex items-center justify-center bg-gradient-to-br',
          RARITY_EMOJI_BG[rarity],
        )}
      >
        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
          {item.image_emoji}
        </span>

        {/* Rarity badge */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'text-[10px] font-display font-bold uppercase tracking-wider px-2 py-1 rounded-lg',
              RARITY_BADGE_BG[rarity],
            )}
          >
            {BADGE_RARITIES[rarity].label}
          </span>
        </div>

        {/* Duration badge */}
        {hasDuration(item) && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] font-display font-medium text-white/60">
              {item.duration}
            </span>
          </div>
        )}

        {/* Purchased overlay */}
        {isPurchased && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="font-display font-bold text-green-400 text-sm uppercase tracking-wider">
                Acheté
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-white text-sm mb-1 line-clamp-1 group-hover:text-[#FFBF00] transition-colors">
          {item.name}
        </h3>
        <p className="text-[11px] text-white/30 line-clamp-2 mb-3 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Stats boost preview */}
        {hasStatsBoost(item) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {Object.entries(item.stats_boost).map(([stat, value]) => (
              <span
                key={stat}
                className="text-[10px] font-display font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/15"
              >
                +{value} {stat.charAt(0).toUpperCase() + stat.slice(1)}
              </span>
            ))}
          </div>
        )}

        {/* Lessons count */}
        {hasLessons(item) && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-xs">📖</span>
            <span className="text-[11px] text-white/30 font-display">
              {item.lessons} lecons
            </span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            {/* XP price */}
            <div className="flex items-center gap-1.5">
              <XPCoinIcon size="sm" />
              <span
                className={cn(
                  'font-display font-bold text-base tabular-nums',
                  canAffordXP ? 'text-[#FFBF00]' : 'text-white/30',
                )}
              >
                {formatXP(item.price_xp)}
              </span>
            </div>
            {/* EUR price */}
            {hasPriceEur(item) && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-white/20 font-display ml-1">ou</span>
                <span className="text-[11px] font-display font-bold text-green-400 tabular-nums">
                  {item.price_eur}€
                </span>
              </div>
            )}
          </div>

          {isPurchased ? (
            <span className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-display font-bold uppercase tracking-wider">
              Activé
            </span>
          ) : levelLocked ? (
            <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/30 text-[11px] font-display font-bold uppercase tracking-wider">
              Niv. {hasMinLevel(item) ? item.min_level : 0}
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuyXP(item.id);
              }}
              disabled={!isAvailable}
              className={cn(
                'px-4 py-2 rounded-xl text-[11px] font-display font-bold uppercase tracking-wider transition-all duration-300',
                isAvailable
                  ? 'bg-gradient-to-r from-[#FFBF00] to-[#FF9D00] text-[#0C0C0C] hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] hover:scale-[1.02]'
                  : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5',
              )}
            >
              {canAffordXP ? 'Acheter' : 'Insuffisant'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Purchase Celebration                                               */
/* ------------------------------------------------------------------ */

function PurchaseCelebration({ itemName, onDone }: { itemName: string; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onDone}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        className="relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Expanding ring */}
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 m-auto w-32 h-32 rounded-full border-2 border-[#FFBF00]/50"
        />

        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="font-display font-bold text-2xl text-white mb-2">
            Achat réussi !
          </h3>
          <p className="text-white/40 text-sm mb-6">
            Tu as débloqué <span className="text-[#FFBF00] font-bold">{itemName}</span>
          </p>
          <button
            onClick={onDone}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFBF00] to-[#FF9D00] text-[#0C0C0C] font-display font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all"
          >
            Continuer
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Shop Client                                                   */
/* ------------------------------------------------------------------ */

export default function ShopClient({
  currentXP,
  currentLevel,
  purchasedItemIds,
}: ShopClientProps) {
  const [activeCategory, setActiveCategory] = useState<ShopCategoryId>('formations');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [celebrationItem, setCelebrationItem] = useState<string | null>(null);
  const [localXP, setLocalXP] = useState(currentXP);
  const [localPurchased, setLocalPurchased] = useState<string[]>(purchasedItemIds);

  const allItems = getAllItems();
  const items = getItemsByCategory(activeCategory);
  const purchasedCount = localPurchased.length;

  const handleBuyXP = useCallback(
    async (itemId: string) => {
      const item = allItems.find((i) => i.id === itemId);
      if (!item || localXP < item.price_xp) return;
      if (localPurchased.includes(itemId)) return;

      setBuyingId(itemId);
      try {
        const res = await fetch('/api/rewards/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rewardId: itemId }),
        });

        if (res.ok) {
          setLocalXP((prev) => prev - item.price_xp);
          setLocalPurchased((prev) => [...prev, itemId]);
          setSelectedItem(null);
          setCelebrationItem(item.name);
        }
      } catch {
        // Error handled silently
      } finally {
        setBuyingId(null);
      }
    },
    [allItems, localXP, localPurchased],
  );

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto"
      >
        {/* ── Header ── */}
        <motion.div variants={childVariants} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
                BOUTIQUE
              </h1>
              <p className="text-white/30 text-sm mt-1">
                Ton business. Tes armes.
              </p>
            </div>

            {/* XP Wallet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative inline-flex items-center gap-3 px-5 py-3 rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFBF00]/10 to-[#FF9D00]/5 border border-[#FFBF00]/20 rounded-2xl" />
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#FFBF00]/10 rounded-full blur-2xl" />

              <div className="relative flex items-center gap-3">
                <XPCoinIcon size="lg" />
                <div>
                  <p className="text-[11px] text-white/30 font-display uppercase tracking-wider">
                    Solde disponible
                  </p>
                  <p className="font-display font-bold text-[#FFBF00] text-2xl tabular-nums">
                    {formatXP(localXP)}{' '}
                    <span className="text-sm text-[#FFBF00]/60">XP</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Category Tabs ── */}
        <motion.div variants={childVariants} className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORY_KEYS.map((catKey) => {
              const cat = SHOP_CATEGORIES[catKey];
              const isActive = activeCategory === catKey;
              const count = SHOP_ITEMS[catKey].length;

              return (
                <button
                  key={catKey}
                  onClick={() => setActiveCategory(catKey)}
                  className={cn(
                    'relative flex items-center gap-2 px-5 py-3 rounded-xl font-display font-bold text-sm whitespace-nowrap transition-all duration-300',
                    isActive
                      ? 'text-[#0C0C0C]'
                      : 'text-white/40 hover:text-white/60 bg-white/[0.03] hover:bg-white/[0.05] border border-white/5',
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-shop-tab"
                      className="absolute inset-0 bg-gradient-to-r from-[#FFBF00] to-[#FF9D00] rounded-xl"
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    />
                  )}
                  <span className="relative z-10 text-base">{cat.emoji}</span>
                  <span className="relative z-10">{cat.name}</span>
                  <span
                    className={cn(
                      'relative z-10 text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                      isActive ? 'bg-[#0C0C0C]/20 text-[#0C0C0C]' : 'bg-white/5 text-white/30',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={activeCategory}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-white/20 text-sm mt-3 font-display"
            >
              {SHOP_CATEGORIES[activeCategory].description}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* ── Item Grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-12"
          >
            {items.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                currentXP={localXP}
                currentLevel={currentLevel}
                isPurchased={localPurchased.includes(item.id)}
                onSelect={() => setSelectedItem(item)}
                onBuyXP={handleBuyXP}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Purchased Section ── */}
        {purchasedCount > 0 && (
          <motion.div variants={childVariants}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="font-display text-lg font-bold text-white">
                Mes achats
              </h2>
              <span className="text-xs font-display text-white/20">
                {purchasedCount} objet{purchasedCount > 1 ? 's' : ''}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="space-y-2">
              {allItems
                .filter((item) => localPurchased.includes(item.id))
                .map((item, index) => {
                  const rarity = item.rarity as RarityKey;
                  const isBoost = item.category === 'boosts';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm flex items-center gap-4 p-4 hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300"
                    >
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl flex-shrink-0 border border-white/5',
                          RARITY_EMOJI_BG[rarity],
                        )}
                      >
                        {item.image_emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-white text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-white/30 truncate">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={cn(
                            'text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                            RARITY_BADGE_BG[rarity],
                          )}
                        >
                          {BADGE_RARITIES[rarity].label}
                        </span>
                        {isBoost ? (
                          <button className="px-3 py-1.5 rounded-lg bg-[#FFBF00]/10 border border-[#FFBF00]/20 text-[#FFBF00] text-[11px] font-display font-bold uppercase tracking-wider hover:bg-[#FFBF00]/20 transition-all">
                            Utiliser
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-display font-bold uppercase tracking-wider">
                            Activé
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            currentXP={localXP}
            currentLevel={currentLevel}
            isPurchased={localPurchased.includes(selectedItem.id)}
            onClose={() => setSelectedItem(null)}
            onBuyXP={handleBuyXP}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {celebrationItem && (
          <PurchaseCelebration
            itemName={celebrationItem}
            onDone={() => setCelebrationItem(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
