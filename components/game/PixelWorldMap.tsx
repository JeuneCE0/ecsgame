'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { PixelAvatar } from '@/components/game/PixelAvatar';

/* ------------------------------------------------------------------ */
/*  Tile types & zone definitions                                       */
/* ------------------------------------------------------------------ */

type TileType = 'grass' | 'path' | 'water' | 'building' | 'mountain' | 'sand' | 'wall' | 'roof' | 'door' | 'cloud' | 'gold' | 'flag';

interface TileColors {
  bg: string;
  border: string;
  detail?: string;
}

const TILE_COLORS: Record<TileType, TileColors> = {
  grass:    { bg: '#2D5A1E', border: '#1E3D14', detail: '#3A7025' },
  path:     { bg: '#8B6914', border: '#6B4F0E', detail: '#A07B1A' },
  water:    { bg: '#1A4A8A', border: '#0E3466', detail: '#2266CC' },
  building: { bg: '#555555', border: '#3A3A3A', detail: '#6A6A6A' },
  mountain: { bg: '#3A3A3A', border: '#222222', detail: '#555555' },
  sand:     { bg: '#C8A840', border: '#A08830', detail: '#D8B850' },
  wall:     { bg: '#666666', border: '#444444', detail: '#888888' },
  roof:     { bg: '#AA3333', border: '#882222', detail: '#CC4444' },
  door:     { bg: '#5A3A1A', border: '#3D2810', detail: '#7A5A3A' },
  cloud:    { bg: '#CCCCDD', border: '#AAAACC', detail: '#EEEEFF' },
  gold:     { bg: '#CCAA00', border: '#AA8800', detail: '#FFDD44' },
  flag:     { bg: '#CC0000', border: '#AA0000', detail: '#EE2222' },
};

interface ZoneDef {
  id: string;
  name: string;
  levelMin: number;
  levelMax: number;
  description: string;
  rewards: string[];
  tiles: TileType[][];
  playerRow: number;
  playerCol: number;
}

/* ------------------------------------------------------------------ */
/*  Zone tile maps (each 10 wide x 8 tall)                              */
/* ------------------------------------------------------------------ */

const ZONE_VILLAGE: TileType[][] = [
  ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
  ['grass', 'grass', 'roof',  'roof',  'grass', 'grass', 'roof',  'roof',  'grass', 'grass'],
  ['grass', 'grass', 'building','building','grass','grass','building','building','grass','grass'],
  ['grass', 'path',  'path',  'door',  'path',  'path',  'door',  'path',  'path',  'grass'],
  ['grass', 'path',  'grass', 'grass', 'path',  'path',  'grass', 'grass', 'path',  'grass'],
  ['grass', 'path',  'grass', 'grass', 'path',  'path',  'grass', 'grass', 'path',  'grass'],
  ['grass', 'path',  'path',  'path',  'path',  'path',  'path',  'path',  'path',  'grass'],
  ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
];

const ZONE_MARKET: TileType[][] = [
  ['sand',  'sand',  'sand',  'sand',  'sand',  'sand',  'sand',  'sand',  'sand',  'sand'],
  ['sand',  'roof',  'roof',  'sand',  'roof',  'roof',  'sand',  'roof',  'roof',  'sand'],
  ['sand',  'building','building','sand','building','building','sand','building','building','sand'],
  ['path',  'path',  'path',  'path',  'path',  'path',  'path',  'path',  'path',  'path'],
  ['sand',  'building','building','sand','building','building','sand','building','building','sand'],
  ['sand',  'roof',  'roof',  'sand',  'roof',  'roof',  'sand',  'roof',  'roof',  'sand'],
  ['sand',  'path',  'path',  'path',  'path',  'path',  'path',  'path',  'path',  'sand'],
  ['sand',  'sand',  'sand',  'sand',  'sand',  'sand',  'sand',  'sand',  'sand',  'sand'],
];

const ZONE_TOWER: TileType[][] = [
  ['path',  'path',  'path',  'building','building','building','building','path',  'path',  'path'],
  ['path',  'path',  'building','building','building','building','building','building','path','path'],
  ['path',  'path',  'building','building','wall',   'wall',   'building','building','path','path'],
  ['path',  'path',  'building','building','wall',   'wall',   'building','building','path','path'],
  ['path',  'path',  'building','building','door',   'door',   'building','building','path','path'],
  ['path',  'path',  'path',  'path',  'path',  'path',  'path',  'path',  'path',  'path'],
  ['grass', 'path',  'path',  'path',  'path',  'path',  'path',  'path',  'path',  'grass'],
  ['grass', 'grass', 'path',  'path',  'path',  'path',  'path',  'path',  'grass', 'grass'],
];

const ZONE_CASTLE: TileType[][] = [
  ['wall',  'flag',  'wall',  'wall',  'wall',  'wall',  'wall',  'wall',  'flag',  'wall'],
  ['wall',  'wall',  'wall',  'building','building','building','building','wall',  'wall',  'wall'],
  ['mountain','wall','building','building','gold',  'gold',  'building','building','wall','mountain'],
  ['mountain','wall','building','building','gold',  'gold',  'building','building','wall','mountain'],
  ['wall',  'wall',  'building','building','door',  'door',  'building','building','wall','wall'],
  ['wall',  'wall',  'wall',  'path',  'path',  'path',  'path',  'wall',  'wall',  'wall'],
  ['grass', 'wall',  'path',  'path',  'path',  'path',  'path',  'path',  'wall',  'grass'],
  ['grass', 'grass', 'path',  'path',  'grass', 'grass', 'path',  'path',  'grass', 'grass'],
];

const ZONE_OLYMPUS: TileType[][] = [
  ['cloud', 'cloud', 'cloud', 'gold',  'gold',  'gold',  'gold',  'cloud', 'cloud', 'cloud'],
  ['cloud', 'cloud', 'gold',  'gold',  'gold',  'gold',  'gold',  'gold',  'cloud', 'cloud'],
  ['cloud', 'gold',  'gold',  'building','building','building','building','gold', 'gold', 'cloud'],
  ['cloud', 'gold',  'building','building','gold', 'gold',  'building','building','gold', 'cloud'],
  ['cloud', 'gold',  'building','building','door', 'door',  'building','building','gold', 'cloud'],
  ['cloud', 'gold',  'gold',  'path',  'path',  'path',  'path',  'gold',  'gold',  'cloud'],
  ['cloud', 'cloud', 'gold',  'gold',  'path',  'path',  'gold',  'gold',  'cloud', 'cloud'],
  ['cloud', 'cloud', 'cloud', 'cloud', 'cloud', 'cloud', 'cloud', 'cloud', 'cloud', 'cloud'],
];

const ZONES: ZoneDef[] = [
  {
    id: 'village',
    name: 'Village du Debutant',
    levelMin: 1,
    levelMax: 3,
    description: 'Tes premiers pas dans le monde du business',
    rewards: ['Quetes de base', 'Formation intro', 'Titre "Recrue"'],
    tiles: ZONE_VILLAGE,
    playerRow: 6,
    playerCol: 4,
  },
  {
    id: 'market',
    name: 'Marche des Closers',
    levelMin: 4,
    levelMax: 6,
    description: "L'art du closing et de la negociation",
    rewards: ['Quetes avancees', 'Techniques closing', 'Badge "Closer"'],
    tiles: ZONE_MARKET,
    playerRow: 3,
    playerCol: 4,
  },
  {
    id: 'tower',
    name: 'Tour du Business',
    levelMin: 7,
    levelMax: 9,
    description: 'Tu domines le jeu et les chiffres',
    rewards: ['Quetes elite', 'Strategie avancee', 'Badge "Rainmaker"'],
    tiles: ZONE_TOWER,
    playerRow: 5,
    playerCol: 4,
  },
  {
    id: 'castle',
    name: "Chateau de l'Empire",
    levelMin: 10,
    levelMax: 12,
    description: 'Tu batis ton empire commercial',
    rewards: ['Quetes de maitre', 'Mentorat', 'Badge "CEO"'],
    tiles: ZONE_CASTLE,
    playerRow: 6,
    playerCol: 4,
  },
  {
    id: 'olympus',
    name: 'Olympe des Legendes',
    levelMin: 13,
    levelMax: 15,
    description: "Ton nom resonne dans tout l'ecosysteme",
    rewards: ['Quetes legendaires', 'Statut VIP', 'Badge "Legende"'],
    tiles: ZONE_OLYMPUS,
    playerRow: 5,
    playerCol: 4,
  },
];

/* ------------------------------------------------------------------ */
/*  Map tile component                                                  */
/* ------------------------------------------------------------------ */

const TILE_SIZE = 32;

interface TileProps {
  type: TileType;
  row: number;
  col: number;
  isUnlocked: boolean;
}

function MapTile({ type, row, col, isUnlocked }: TileProps) {
  const colors = TILE_COLORS[type];

  // Subtle variation based on position
  const hasDetail = (row + col) % 3 === 0;

  return (
    <div
      className="relative pixel-art"
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        backgroundColor: colors.bg,
        borderRight: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
        opacity: isUnlocked ? 1 : 0.35,
      }}
    >
      {/* Detail pixel for texture */}
      {hasDetail && colors.detail && (
        <div
          className="absolute"
          style={{
            width: 4,
            height: 4,
            backgroundColor: colors.detail,
            top: type === 'grass' ? 12 : 8,
            left: type === 'grass' ? 14 : 10,
            opacity: 0.6,
          }}
        />
      )}

      {/* Animated flag for flag tiles in unlocked zones */}
      {type === 'flag' && isUnlocked && (
        <div className="absolute inset-0 flex items-start justify-center pt-1">
          <div className="animate-pixel-flag" style={{ width: 8, height: 6, backgroundColor: '#CC0000' }} />
        </div>
      )}

      {/* Smoke effect for building/roof tiles */}
      {type === 'roof' && isUnlocked && col % 3 === 0 && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <div
            className="animate-pixel-smoke rounded-full"
            style={{ width: 4, height: 4, backgroundColor: 'rgba(180,180,180,0.5)' }}
          />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Zone info panel                                                     */
/* ------------------------------------------------------------------ */

interface ZoneInfoProps {
  zone: ZoneDef;
  isUnlocked: boolean;
  isCurrent: boolean;
  onClose: () => void;
}

function ZoneInfoPanel({ zone, isUnlocked, isCurrent, onClose }: ZoneInfoProps) {
  return (
    <motion.div
      className="absolute top-0 right-0 z-50 w-64 pixel-dialog-border bg-[#0a0a2e] p-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-1 right-2 font-pixel text-[10px] text-white/50 hover:text-white"
        aria-label="Fermer"
      >
        X
      </button>

      <h3 className="font-pixel text-[10px] text-ecs-amber mb-2 pr-4">
        {zone.name}
      </h3>

      <div className="font-pixel text-[8px] text-white/60 mb-2">
        Niv. {zone.levelMin}-{zone.levelMax}
      </div>

      <p className="font-pixel text-[8px] text-white/80 leading-relaxed mb-3">
        {zone.description}
      </p>

      {isCurrent && (
        <div className="font-pixel text-[8px] text-green-400 mb-2">
          {'>> Zone actuelle'}
        </div>
      )}

      {!isUnlocked && (
        <div className="font-pixel text-[8px] text-red-400 mb-2">
          {'>> Verrouille - Niv. '}{zone.levelMin}{' requis'}
        </div>
      )}

      <div className="space-y-1">
        <div className="font-pixel text-[8px] text-ecs-amber/70">Recompenses :</div>
        {zone.rewards.map((r) => (
          <div key={r} className="font-pixel text-[8px] text-white/60 pl-2">
            {'- '}{r}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main PixelWorldMap component                                        */
/* ------------------------------------------------------------------ */

export function PixelWorldMap() {
  const level = usePlayerStore((s) => s.level);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const currentZone = useMemo(
    () => ZONES.find((z) => level >= z.levelMin && level <= z.levelMax) ?? ZONES[0],
    [level],
  );

  const getZoneStatus = useCallback(
    (zone: ZoneDef) => ({
      isUnlocked: level >= zone.levelMin,
      isCurrent: level >= zone.levelMin && level <= zone.levelMax,
      isCompleted: level > zone.levelMax,
    }),
    [level],
  );

  // Scroll to current zone on mount
  useEffect(() => {
    if (!scrollRef.current) return;
    const zoneIndex = ZONES.findIndex((z) => z.id === currentZone.id);
    const scrollTarget = zoneIndex * (TILE_SIZE * 10 + 24) - 40;
    scrollRef.current.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
  }, [currentZone]);

  const handleZoneClick = useCallback((zoneId: string) => {
    setSelectedZone((prev) => (prev === zoneId ? null : zoneId));
  }, []);

  const selectedZoneDef = useMemo(
    () => ZONES.find((z) => z.id === selectedZone),
    [selectedZone],
  );

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="font-pixel text-[12px] text-white">Carte du Monde</h2>
          <p className="font-pixel text-[8px] text-ecs-gray mt-1">
            Ton voyage vers le sommet
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 border border-ecs-amber/20 bg-ecs-amber/5">
          <span className="font-pixel text-[8px] text-ecs-amber">
            {currentZone.name}
          </span>
        </div>
      </div>

      {/* Scrollable map */}
      <div
        ref={scrollRef}
        className="relative overflow-x-auto overflow-y-hidden border-2 border-white/10 bg-[#0C0C0C]"
        style={{ height: TILE_SIZE * 8 + 80 }}
      >
        <div
          className="flex gap-6 p-5 relative"
          style={{ width: ZONES.length * (TILE_SIZE * 10 + 24) + 40, minWidth: '100%' }}
        >
          {ZONES.map((zone) => {
            const { isUnlocked, isCurrent } = getZoneStatus(zone);

            return (
              <button
                key={zone.id}
                type="button"
                className={cn(
                  'relative shrink-0 cursor-pointer transition-all duration-200',
                  isCurrent && 'ring-2 ring-ecs-amber/50',
                  !isUnlocked && 'cursor-not-allowed',
                )}
                onClick={() => handleZoneClick(zone.id)}
                aria-label={`Zone: ${zone.name}`}
              >
                {/* Zone label */}
                <div className="mb-2 text-center">
                  <span
                    className={cn(
                      'font-pixel text-[8px]',
                      isCurrent ? 'text-ecs-amber' : isUnlocked ? 'text-white/70' : 'text-white/30',
                    )}
                  >
                    {zone.name}
                  </span>
                  <div className={cn(
                    'font-pixel text-[7px] mt-0.5',
                    isUnlocked ? 'text-white/40' : 'text-white/20',
                  )}>
                    Niv. {zone.levelMin}-{zone.levelMax}
                  </div>
                </div>

                {/* Tile grid */}
                <div className="relative">
                  <div
                    className="grid pixel-art"
                    style={{
                      gridTemplateColumns: `repeat(10, ${TILE_SIZE}px)`,
                      gridTemplateRows: `repeat(8, ${TILE_SIZE}px)`,
                    }}
                  >
                    {zone.tiles.flatMap((row, rowIdx) =>
                      row.map((tileType, colIdx) => (
                        <MapTile
                          key={`${rowIdx}-${colIdx}`}
                          type={tileType}
                          row={rowIdx}
                          col={colIdx}
                          isUnlocked={isUnlocked}
                        />
                      )),
                    )}
                  </div>

                  {/* Fog overlay for locked zones */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="font-pixel text-[10px] text-white/40 text-center">
                        <div className="text-lg mb-1">{'\uD83D\uDD12'}</div>
                        <div>Niv. {zone.levelMin}</div>
                      </div>
                    </div>
                  )}

                  {/* Player avatar on current zone */}
                  {isCurrent && (
                    <div
                      className="absolute z-30 pointer-events-none"
                      style={{
                        left: zone.playerCol * TILE_SIZE + TILE_SIZE / 2 - 8,
                        top: zone.playerRow * TILE_SIZE + TILE_SIZE / 2 - 20,
                      }}
                    >
                      <PixelAvatar
                        variant={(level % 8) + 1}
                        size="sm"
                        level={level}
                      />
                    </div>
                  )}

                  {/* "Vous etes ici" badge for current zone */}
                  {isCurrent && (
                    <motion.div
                      className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <span className="font-pixel text-[7px] text-ecs-amber whitespace-nowrap bg-ecs-black/80 px-2 py-0.5 border border-ecs-amber/30">
                        Vous etes ici
                      </span>
                    </motion.div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Zone info panel */}
        <AnimatePresence>
          {selectedZoneDef && (
            <ZoneInfoPanel
              zone={selectedZoneDef}
              isUnlocked={getZoneStatus(selectedZoneDef).isUnlocked}
              isCurrent={getZoneStatus(selectedZoneDef).isCurrent}
              onClose={() => setSelectedZone(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Zone navigation dots */}
      <div className="flex items-center justify-center gap-3 mt-4">
        {ZONES.map((zone) => {
          const { isUnlocked, isCurrent } = getZoneStatus(zone);
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => {
                if (!scrollRef.current) return;
                const zoneIndex = ZONES.findIndex((z) => z.id === zone.id);
                const scrollTarget = zoneIndex * (TILE_SIZE * 10 + 24) - 40;
                scrollRef.current.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
              }}
              className={cn(
                'w-3 h-3 pixel-art transition-all duration-200',
                isCurrent
                  ? 'bg-ecs-amber shadow-[0_0_6px_rgba(255,191,0,0.5)]'
                  : isUnlocked
                    ? 'bg-white/40 hover:bg-white/60'
                    : 'bg-white/15',
              )}
              aria-label={`Naviguer vers ${zone.name}`}
            />
          );
        })}
      </div>
    </div>
  );
}
