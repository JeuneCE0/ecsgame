'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Clock,
  Swords,
  Flame,
  Target,
  ChevronRight,
} from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FomoItemType = 'expiring' | 'rival' | 'streak' | 'missed_xp';
type FomoUrgency = 'low' | 'medium' | 'high' | 'critical';

interface FomoItem {
  id: string;
  type: FomoItemType;
  label: string;
  detail?: string;
  urgency: FomoUrgency;
  /** Where to navigate when tapped */
  href?: string;
  /** Callback when tapped */
  onClick?: () => void;
}

interface FearOfMissingOutProps {
  items: FomoItem[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Type config                                                        */
/* ------------------------------------------------------------------ */

interface FomoTypeConfig {
  icon: typeof Clock;
  color: string;
  bgColor: string;
}

const TYPE_MAP: Record<FomoItemType, FomoTypeConfig> = {
  expiring: {
    icon: Clock,
    color: '#FFBF00',
    bgColor: 'rgba(255, 191, 0, 0.08)',
  },
  rival: {
    icon: Swords,
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.08)',
  },
  streak: {
    icon: Flame,
    color: '#FF9D00',
    bgColor: 'rgba(255, 157, 0, 0.08)',
  },
  missed_xp: {
    icon: Target,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.08)',
  },
};

/* ------------------------------------------------------------------ */
/*  Urgency config                                                     */
/* ------------------------------------------------------------------ */

const URGENCY_MAP: Record<FomoUrgency, { dotColor: string; borderColor: string }> = {
  low: { dotColor: 'bg-ecs-gray', borderColor: 'rgba(42, 42, 42, 0.5)' },
  medium: { dotColor: 'bg-ecs-amber', borderColor: 'rgba(255, 191, 0, 0.15)' },
  high: { dotColor: 'bg-orange-500', borderColor: 'rgba(249, 115, 22, 0.2)' },
  critical: { dotColor: 'bg-red-500', borderColor: 'rgba(239, 68, 68, 0.25)' },
};

const URGENCY_PRIORITY: Record<FomoUrgency, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/* ------------------------------------------------------------------ */
/*  Fomo row                                                           */
/* ------------------------------------------------------------------ */

function FomoRow({ item, index }: { item: FomoItem; index: number }) {
  const typeConfig = TYPE_MAP[item.type];
  const urgencyConfig = URGENCY_MAP[item.urgency];
  const Icon = typeConfig.icon;
  const isCritical = item.urgency === 'critical';

  const content = (
    <motion.div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 border cursor-pointer transition-colors',
        'hover:border-ecs-amber/20',
      )}
      style={{
        background: typeConfig.bgColor,
        border: `1px solid ${urgencyConfig.borderColor}`,
      }}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 22 }}
      whileHover={{ x: 3, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
      onClick={item.onClick}
    >
      {/* Urgency dot */}
      <motion.div
        className={cn('w-2 h-2 rounded-full shrink-0', urgencyConfig.dotColor)}
        animate={
          isCritical
            ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }
            : undefined
        }
        transition={
          isCritical
            ? { duration: 1, repeat: Infinity }
            : undefined
        }
      />

      {/* Type icon */}
      <div
        className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
        style={{ background: `${typeConfig.color}15` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: typeConfig.color }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-display font-bold text-white/85 truncate">
          {item.label}
        </p>
        {item.detail && (
          <p className="text-[10px] text-ecs-gray/60 font-body truncate">{item.detail}</p>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight className="h-3.5 w-3.5 text-ecs-gray/30 shrink-0" />
    </motion.div>
  );

  if (item.href) {
    return (
      <a href={item.href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function FearOfMissingOut({ items, className }: FearOfMissingOutProps) {
  /* Sort by urgency (critical first) */
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => URGENCY_PRIORITY[a.urgency] - URGENCY_PRIORITY[b.urgency]),
    [items],
  );

  const criticalCount = sortedItems.filter((i) => i.urgency === 'critical' || i.urgency === 'high').length;
  const totalCount = sortedItems.length;

  if (totalCount === 0) return null;

  return (
    <div
      className={cn('rounded-xl border overflow-hidden', className)}
      style={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
        border: criticalCount > 0
          ? '1px solid rgba(239, 68, 68, 0.2)'
          : '1px solid rgba(42, 42, 42, 1)',
      }}
    >
      {/* Critical top border */}
      {criticalCount > 0 && (
        <motion.div
          className="h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, #EF4444, #FF9D00, transparent)' }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={criticalCount > 0 ? { rotate: [0, -10, 10, 0] } : undefined}
              transition={criticalCount > 0 ? { duration: 0.5, repeat: Infinity, repeatDelay: 3 } : undefined}
            >
              <AlertCircle
                className={cn(
                  'h-4 w-4',
                  criticalCount > 0 ? 'text-red-400' : 'text-ecs-amber',
                )}
              />
            </motion.div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white/80">
              {totalCount} action{totalCount > 1 ? 's' : ''} urgente{totalCount > 1 ? 's' : ''}
            </h3>
          </div>

          {/* Badge */}
          <motion.span
            className={cn(
              'flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-display font-bold',
              criticalCount > 0
                ? 'bg-red-500 text-white'
                : 'text-ecs-black',
            )}
            style={
              criticalCount === 0
                ? { background: 'linear-gradient(135deg, #FFBF00, #FF9D00)' }
                : undefined
            }
            animate={criticalCount > 0 ? { scale: [1, 1.15, 1] } : undefined}
            transition={criticalCount > 0 ? { duration: 1.5, repeat: Infinity } : undefined}
          >
            {totalCount}
          </motion.span>
        </div>

        {/* Items */}
        <div className="space-y-1.5">
          <AnimatePresence>
            {sortedItems.map((item, index) => (
              <FomoRow key={item.id} item={item} index={index} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
