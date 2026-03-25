'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BUSINESS_CLASSES, type BusinessClassId } from '@/lib/constants';
import { Check, Zap, Shield, AlertTriangle, Swords } from 'lucide-react';

const STAT_LABELS: Record<string, string> = {
  closing: 'Closing',
  prospection: 'Prospection',
  management: 'Management',
  creation: 'Cr\u00e9ation',
  networking: 'Networking',
};

const STAT_COLORS: Record<string, string> = {
  closing: '#F59E0B',
  prospection: '#3B82F6',
  management: '#10B981',
  creation: '#EC4899',
  networking: '#8B5CF6',
};

const BONUS_SOURCE_LABELS: Record<string, string> = {
  manual_log: 'les logs manuels',
  lead_generated: 'les leads g\u00e9n\u00e9r\u00e9s',
  deal_closed: 'les deals conclus',
  formation_completed: 'les formations',
  referral: 'les parrainages',
};

const classIds = Object.keys(BUSINESS_CLASSES) as BusinessClassId[];

interface ClassSelectionProps {
  selectedClass: BusinessClassId | null;
  onSelect: (classId: BusinessClassId) => void;
  onConfirm: () => void;
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ecs-gray w-24 shrink-0 font-display">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / 5) * 100}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-xs font-display font-bold text-white/60 w-4 text-right">{value}</span>
    </div>
  );
}

function MiniStatBars({ stats }: { stats: Record<string, number> }) {
  return (
    <div className="flex gap-1 mt-2">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(value / 5) * 100}%`,
                backgroundColor: STAT_COLORS[key] ?? '#888',
              }}
            />
          </div>
          <span className="text-[8px] text-ecs-gray/50 font-display uppercase leading-none">
            {key.slice(0, 3)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ClassSelection({ selectedClass, onSelect, onConfirm }: ClassSelectionProps) {
  const [hoveredClass, setHoveredClass] = useState<BusinessClassId | null>(null);
  const selectedData = selectedClass ? BUSINESS_CLASSES[selectedClass] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-display text-3xl font-bold">
            <span className="bg-gradient-to-r from-ecs-amber via-ecs-orange to-ecs-amber bg-clip-text text-transparent">
              CHOISIS TA CLASSE
            </span>
          </h2>
        </motion.div>
        <motion.p
          className="text-ecs-gray text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Chaque classe a ses forces et ses bonus XP
        </motion.p>
      </div>

      {/* Class grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {classIds.map((classId, i) => {
          const cls = BUSINESS_CLASSES[classId];
          const isSelected = selectedClass === classId;
          const isHovered = hoveredClass === classId;
          const isDimmed = selectedClass !== null && !isSelected;

          return (
            <motion.button
              key={classId}
              type="button"
              onClick={() => onSelect(classId)}
              onMouseEnter={() => setHoveredClass(classId)}
              onMouseLeave={() => setHoveredClass(null)}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{
                opacity: isDimmed ? 0.5 : 1,
                y: 0,
                scale: isSelected ? 1.03 : isDimmed ? 0.97 : 1,
              }}
              transition={{
                delay: 0.1 + i * 0.06,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              whileHover={
                !isSelected
                  ? {
                      scale: 1.03,
                      y: -4,
                      transition: { type: 'spring', stiffness: 400, damping: 17 },
                    }
                  : undefined
              }
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative rounded-xl p-4 text-left transition-all duration-300 overflow-hidden',
                'border-2',
                isSelected
                  ? 'ring-1'
                  : 'border-white/[0.06] hover:border-opacity-60'
              )}
              style={{
                borderColor: isSelected ? cls.color : isHovered ? `${cls.color}60` : undefined,
                background: isSelected
                  ? `linear-gradient(135deg, ${cls.color}15 0%, rgba(20,20,20,0.95) 100%)`
                  : isHovered
                    ? `linear-gradient(135deg, ${cls.color}08 0%, rgba(20,20,20,0.9) 100%)`
                    : 'linear-gradient(135deg, rgba(26,26,26,0.8) 0%, rgba(20,20,20,0.9) 100%)',
                boxShadow: isSelected
                  ? `0 0 30px ${cls.color}20, 0 0 60px ${cls.color}08`
                  : isHovered
                    ? `0 0 20px ${cls.color}10`
                    : '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              {/* Selected check indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: cls.color }}
                  >
                    <Check className="h-3.5 w-3.5 text-black" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pulsing border glow for selected */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  animate={{
                    boxShadow: [
                      `inset 0 0 15px ${cls.color}10`,
                      `inset 0 0 25px ${cls.color}18`,
                      `inset 0 0 15px ${cls.color}10`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Emoji */}
              <div className="text-5xl mb-2 leading-none">{cls.emoji}</div>

              {/* Name */}
              <h3 className="font-display font-bold text-white text-sm leading-tight mb-0.5">
                {cls.name}
              </h3>

              {/* Tagline */}
              <p className="text-[11px] text-ecs-gray/70 italic leading-snug line-clamp-2">
                {cls.tagline}
              </p>

              {/* Mini stat bars */}
              <MiniStatBars stats={cls.stats} />

              {/* Hover: show strengths */}
              <AnimatePresence>
                {(isHovered || isSelected) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 flex flex-wrap gap-1 overflow-hidden"
                  >
                    {cls.strengths.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-display font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${cls.color}15`,
                          color: cls.color,
                          border: `1px solid ${cls.color}30`,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Expanded selected class details */}
      <AnimatePresence mode="wait">
        {selectedData && selectedClass && (
          <motion.div
            key={selectedClass}
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border p-5 overflow-hidden"
            style={{
              borderColor: `${selectedData.color}30`,
              background: `linear-gradient(135deg, ${selectedData.color}08 0%, rgba(20,20,20,0.95) 100%)`,
            }}
          >
            {/* Class header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{selectedData.emoji}</span>
              <div>
                <h3 className="font-display font-bold text-lg text-white">{selectedData.name}</h3>
                <p className="text-sm text-ecs-gray italic">{selectedData.tagline}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-ecs-gray/80 mb-4 leading-relaxed">
              {selectedData.description}
            </p>

            {/* Strengths + Weaknesses */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-display font-bold text-emerald-400 uppercase tracking-wider">
                    Forces
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedData.strengths.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] font-display font-medium px-2 py-1 rounded-lg bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-display font-bold text-red-400 uppercase tracking-wider">
                    Faiblesses
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedData.weaknesses.map((w) => (
                    <span
                      key={w}
                      className="text-[11px] font-display font-medium px-2 py-1 rounded-lg bg-red-400/10 text-red-400 border border-red-400/20"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bonus XP */}
            <motion.div
              className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Zap className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-sm font-display font-bold text-amber-400">
                +{selectedData.bonusPercent}% XP
              </span>
              <span className="text-sm text-amber-400/70">
                sur {BONUS_SOURCE_LABELS[selectedData.bonusXP] ?? selectedData.bonusXP}
              </span>
            </motion.div>

            {/* Quest preview */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Swords className="h-3.5 w-3.5 text-ecs-amber" />
                <span className="text-xs font-display font-bold text-ecs-amber uppercase tracking-wider">
                  Qu\u00eates de classe
                </span>
              </div>
              <div className="space-y-1.5">
                {selectedData.quests.map((quest, qi) => (
                  <motion.div
                    key={quest}
                    className="flex items-center gap-2 text-sm text-ecs-gray/80"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + qi * 0.08 }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-display font-bold"
                      style={{
                        backgroundColor: `${selectedData.color}15`,
                        color: selectedData.color,
                        border: `1px solid ${selectedData.color}25`,
                      }}
                    >
                      {qi + 1}
                    </div>
                    {quest}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Full stats bars */}
            <div className="space-y-2">
              <span className="text-xs font-display font-bold text-white/50 uppercase tracking-wider">
                Statistiques
              </span>
              {Object.entries(selectedData.stats).map(([key, value]) => (
                <StatBar
                  key={key}
                  label={STAT_LABELS[key] ?? key}
                  value={value}
                  color={STAT_COLORS[key] ?? '#888'}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm button */}
      <motion.button
        type="button"
        onClick={onConfirm}
        disabled={!selectedClass}
        className={cn(
          'w-full px-6 py-3.5 rounded-lg font-display font-bold uppercase tracking-wider',
          'transition-all duration-300',
          selectedClass
            ? 'text-ecs-black bg-gradient-to-r from-ecs-amber to-ecs-orange'
            : 'text-white/30 bg-white/[0.06] border border-white/[0.06] cursor-not-allowed'
        )}
        whileHover={
          selectedClass
            ? { scale: 1.02, boxShadow: '0 0 30px rgba(255,191,0,0.3)' }
            : undefined
        }
        whileTap={selectedClass ? { scale: 0.98 } : undefined}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {selectedClass ? 'Confirmer ma classe' : 'S\u00e9lectionne une classe'}
      </motion.button>
    </div>
  );
}
