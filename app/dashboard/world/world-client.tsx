'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { PixelAvatar } from '@/components/game/PixelAvatar';
import { PixelBar } from '@/components/game/PixelBar';
import { PixelDialog } from '@/components/game/PixelDialog';
import { FarmingEncounter } from '@/components/game/FarmingEncounter';
import { LeadNotebook } from '@/components/game/LeadNotebook';

/* ------------------------------------------------------------------ */
/*  Tile system                                                        */
/* ------------------------------------------------------------------ */

const TILE_GRASS = 0;
const TILE_PATH = 1;
const TILE_WALL = 2;
const TILE_WATER = 3;
const TILE_FLOOR_BASIC = 4;
const TILE_FLOOR_LUXURY = 5;
const TILE_FLOOR_GOLD = 6;
const TILE_DESK = 7;
const TILE_DOOR = 8;
const TILE_NPC = 9;
const TILE_FARMING = 10;
const TILE_LOCKED = 11;
const TILE_SIGN = 12;

type TileId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface TileConfig {
  bg: string;
  walkable: boolean;
  detail?: string;
  label?: string;
}

const TILE_CONFIG: Record<TileId, TileConfig> = {
  [TILE_GRASS]:       { bg: '#4CAF50', walkable: true, detail: '#66BB6A' },
  [TILE_PATH]:        { bg: '#8B6914', walkable: true, detail: '#A07B1A' },
  [TILE_WALL]:        { bg: '#333333', walkable: false, detail: '#444444' },
  [TILE_WATER]:       { bg: '#2196F3', walkable: false, detail: '#42A5F5' },
  [TILE_FLOOR_BASIC]: { bg: '#9E9E9E', walkable: true, detail: '#BDBDBD' },
  [TILE_FLOOR_LUXURY]:{ bg: '#5D4037', walkable: true, detail: '#6D4C41' },
  [TILE_FLOOR_GOLD]:  { bg: '#FFD700', walkable: true, detail: '#FFECB3' },
  [TILE_DESK]:        { bg: '#6D4C41', walkable: false, detail: '#4DD0E1', label: 'Bureau' },
  [TILE_DOOR]:        { bg: '#FFB300', walkable: true, detail: '#FFC107' },
  [TILE_NPC]:         { bg: 'transparent', walkable: false },
  [TILE_FARMING]:     { bg: '#66BB6A', walkable: true, detail: '#43A047' },
  [TILE_LOCKED]:      { bg: '#B71C1C', walkable: false, detail: '#D32F2F' },
  [TILE_SIGN]:        { bg: '#8D6E63', walkable: false, detail: '#A1887F' },
};

/* ------------------------------------------------------------------ */
/*  Tile size & viewport                                               */
/* ------------------------------------------------------------------ */

const TILE_SIZE = 32;
const VIEWPORT_COLS = 15;
const VIEWPORT_ROWS = 11;
const MAP_COLS = 40;
const MAP_ROWS = 30;

/* ------------------------------------------------------------------ */
/*  NPC definitions                                                    */
/* ------------------------------------------------------------------ */

interface NPCDef {
  id: string;
  name: string;
  row: number;
  col: number;
  variant: number;
  zone: string;
  dialogues: { minLevel: number; messages: { speaker: string; text: string; avatarVariant?: number }[] }[];
}

const NPCS: NPCDef[] = [
  {
    id: 'mentor',
    name: 'Le Mentor',
    row: 3,
    col: 4,
    variant: 6,
    zone: 'garage',
    dialogues: [
      {
        minLevel: 1,
        messages: [
          { speaker: 'Le Mentor', text: 'Bienvenue, jeune entrepreneur !', avatarVariant: 6 },
          { speaker: 'Le Mentor', text: 'Ton premier objectif : envoyer 10 messages de prospection.', avatarVariant: 6 },
          { speaker: 'Le Mentor', text: "Chaque action dans le monde r\u00e9el te rapporte de l'XP ici.", avatarVariant: 6 },
          { speaker: 'Le Mentor', text: 'Va dans la Zone de Farming pour r\u00e9colter tes premiers leads !', avatarVariant: 6 },
        ],
      },
      {
        minLevel: 4,
        messages: [
          { speaker: 'Le Mentor', text: "Tu progresses bien ! Continue comme \u00e7a.", avatarVariant: 6 },
          { speaker: 'Le Mentor', text: "N'oublie pas de farmer r\u00e9guli\u00e8rement pour remplir ton carnet de leads.", avatarVariant: 6 },
        ],
      },
    ],
  },
  {
    id: 'closer',
    name: 'Le Closer',
    row: 3,
    col: 24,
    variant: 3,
    zone: 'openspace',
    dialogues: [
      {
        minLevel: 1,
        messages: [
          { speaker: 'Le Closer', text: "H\u00e9, tu n'as pas encore le niveau pour \u00eatre ici !", avatarVariant: 3 },
          { speaker: 'Le Closer', text: 'Reviens quand tu seras niveau 4.', avatarVariant: 3 },
        ],
      },
      {
        minLevel: 4,
        messages: [
          { speaker: 'Le Closer', text: "Bienvenue dans l'Open Space !", avatarVariant: 3 },
          { speaker: 'Le Closer', text: "Ici, on apprend l'art du closing.", avatarVariant: 3 },
          { speaker: 'Le Closer', text: "R\u00e8gle n\u00b01 : toujours closer. Chaque lead est une opportunit\u00e9.", avatarVariant: 3 },
        ],
      },
    ],
  },
  {
    id: 'directeur',
    name: 'Le Directeur',
    row: 14,
    col: 18,
    variant: 1,
    zone: 'tour',
    dialogues: [
      {
        minLevel: 1,
        messages: [
          { speaker: 'Le Directeur', text: 'Cette zone est r\u00e9serv\u00e9e aux niveaux 7+.', avatarVariant: 1 },
        ],
      },
      {
        minLevel: 7,
        messages: [
          { speaker: 'Le Directeur', text: 'Bienvenue dans La Tour.', avatarVariant: 1 },
          { speaker: 'Le Directeur', text: "Ici on parle scaling, process et automatisation.", avatarVariant: 1 },
          { speaker: 'Le Directeur', text: "Ton objectif : construire une machine qui tourne sans toi.", avatarVariant: 1 },
        ],
      },
    ],
  },
  {
    id: 'ceo',
    name: 'Le CEO',
    row: 22,
    col: 4,
    variant: 8,
    zone: 'siege',
    dialogues: [
      {
        minLevel: 1,
        messages: [
          { speaker: 'Le CEO', text: "Tu n'es pas encore pr\u00eat pour le Si\u00e8ge Social.", avatarVariant: 8 },
        ],
      },
      {
        minLevel: 10,
        messages: [
          { speaker: 'Le CEO', text: "Bienvenue au Si\u00e8ge Social.", avatarVariant: 8 },
          { speaker: 'Le CEO', text: "Tu b\u00e2tis un empire. Chaque d\u00e9cision compte.", avatarVariant: 8 },
          { speaker: 'Le CEO', text: "Recrute, d\u00e9l\u00e8gue, scale. C'est la voie du CEO.", avatarVariant: 8 },
        ],
      },
    ],
  },
  {
    id: 'legende',
    name: 'La L\u00e9gende',
    row: 22,
    col: 34,
    variant: 5,
    zone: 'penthouse',
    dialogues: [
      {
        minLevel: 1,
        messages: [
          { speaker: 'La L\u00e9gende', text: 'Le Penthouse est r\u00e9serv\u00e9 aux l\u00e9gendes.', avatarVariant: 5 },
        ],
      },
      {
        minLevel: 13,
        messages: [
          { speaker: 'La L\u00e9gende', text: 'Tu es arriv\u00e9(e) au sommet.', avatarVariant: 5 },
          { speaker: 'La L\u00e9gende', text: 'Ton nom resonne dans tout l\'\u00e9cosyst\u00e8me.', avatarVariant: 5 },
          { speaker: 'La L\u00e9gende', text: "Maintenant, ton r\u00f4le est d'inspirer les autres.", avatarVariant: 5 },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Fake other players                                                 */
/* ------------------------------------------------------------------ */

interface FakePlayer {
  id: string;
  name: string;
  row: number;
  col: number;
  variant: number;
  level: number;
}

const FAKE_PLAYERS: FakePlayer[] = [
  { id: 'fp1', name: 'Alex K.', row: 5, col: 6, variant: 2, level: 3 },
  { id: 'fp2', name: 'Sarah M.', row: 2, col: 14, variant: 4, level: 5 },
  { id: 'fp3', name: 'Jordan L.', row: 16, col: 20, variant: 7, level: 8 },
  { id: 'fp4', name: 'Nina R.', row: 12, col: 35, variant: 1, level: 2 },
];

/* ------------------------------------------------------------------ */
/*  Zone definitions                                                   */
/* ------------------------------------------------------------------ */

interface ZoneRect {
  id: string;
  name: string;
  startRow: number;
  startCol: number;
  rows: number;
  cols: number;
  minLevel: number;
}

const ZONES: ZoneRect[] = [
  { id: 'garage', name: 'Le Garage', startRow: 0, startCol: 0, rows: 8, cols: 10, minLevel: 1 },
  { id: 'openspace', name: "L'Open Space", startRow: 0, startCol: 20, rows: 8, cols: 10, minLevel: 4 },
  { id: 'tour', name: 'La Tour', startRow: 11, startCol: 15, rows: 8, cols: 10, minLevel: 7 },
  { id: 'siege', name: 'Le Si\u00e8ge Social', startRow: 20, startCol: 0, rows: 8, cols: 10, minLevel: 10 },
  { id: 'penthouse', name: 'Le Penthouse', startRow: 20, startCol: 30, rows: 8, cols: 10, minLevel: 13 },
  { id: 'farming', name: 'Zone de Farming', startRow: 12, startCol: 30, rows: 6, cols: 8, minLevel: 1 },
];

/* ------------------------------------------------------------------ */
/*  Map builder                                                        */
/* ------------------------------------------------------------------ */

function buildMap(playerLevel: number): TileId[][] {
  // Start with grass everywhere
  const grid: TileId[][] = Array.from({ length: MAP_ROWS }, () =>
    Array.from({ length: MAP_COLS }, () => TILE_GRASS as TileId),
  );

  function fill(sr: number, sc: number, rows: number, cols: number, tile: TileId) {
    for (let r = sr; r < sr + rows && r < MAP_ROWS; r++) {
      for (let c = sc; c < sc + cols && c < MAP_COLS; c++) {
        grid[r][c] = tile;
      }
    }
  }

  function set(r: number, c: number, tile: TileId) {
    if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS) {
      grid[r][c] = tile;
    }
  }

  // ---- Zone 1: Le Garage (top-left 0-7, 0-9) ----
  fill(0, 0, 8, 10, TILE_GRASS as TileId);
  // Small office area
  fill(1, 1, 3, 4, TILE_FLOOR_BASIC as TileId);
  set(1, 2, TILE_DESK as TileId); // laptop desk
  set(1, 4, TILE_DESK as TileId); // coffee machine
  set(3, 1, TILE_DOOR as TileId);
  // Sign
  set(0, 5, TILE_SIGN as TileId);
  // NPC spot for Le Mentor
  set(3, 4, TILE_NPC as TileId);
  // Paths inside garage
  fill(4, 1, 1, 8, TILE_PATH as TileId);
  fill(5, 1, 2, 1, TILE_PATH as TileId);
  fill(5, 8, 2, 1, TILE_PATH as TileId);

  // ---- Zone 2: L'Open Space (top-right, row 0-7, col 20-29) ----
  const z2locked = playerLevel < 4;
  if (z2locked) {
    fill(0, 20, 8, 10, TILE_LOCKED as TileId);
  } else {
    fill(0, 20, 8, 10, TILE_FLOOR_BASIC as TileId);
    // Desks
    set(1, 21, TILE_DESK as TileId);
    set(1, 23, TILE_DESK as TileId);
    set(1, 25, TILE_DESK as TileId);
    set(1, 27, TILE_DESK as TileId);
    set(5, 21, TILE_DESK as TileId);
    set(5, 23, TILE_DESK as TileId);
    set(5, 25, TILE_DESK as TileId);
    set(5, 27, TILE_DESK as TileId);
    // Whiteboard wall
    fill(0, 20, 1, 10, TILE_WALL as TileId);
    // Door
    set(7, 24, TILE_DOOR as TileId);
    set(7, 25, TILE_DOOR as TileId);
    // NPC
    set(3, 24, TILE_NPC as TileId);
    // Walkable rows
    fill(2, 20, 1, 10, TILE_FLOOR_BASIC as TileId);
    fill(3, 20, 1, 10, TILE_FLOOR_BASIC as TileId);
    fill(4, 20, 1, 10, TILE_FLOOR_BASIC as TileId);
    fill(6, 20, 1, 10, TILE_FLOOR_BASIC as TileId);
    set(3, 24, TILE_NPC as TileId);
  }

  // ---- Zone 3: La Tour (center, row 11-18, col 15-24) ----
  const z3locked = playerLevel < 7;
  if (z3locked) {
    fill(11, 15, 8, 10, TILE_LOCKED as TileId);
  } else {
    fill(11, 15, 8, 10, TILE_FLOOR_LUXURY as TileId);
    // Executive desks
    set(12, 17, TILE_DESK as TileId);
    set(12, 22, TILE_DESK as TileId);
    set(14, 19, TILE_DESK as TileId);
    // Windows (water = sky)
    fill(11, 15, 1, 10, TILE_WATER as TileId);
    set(11, 19, TILE_WALL as TileId);
    set(11, 20, TILE_WALL as TileId);
    // Door
    set(18, 19, TILE_DOOR as TileId);
    set(18, 20, TILE_DOOR as TileId);
    // NPC
    set(14, 18, TILE_NPC as TileId);
    // Walkable areas
    fill(13, 15, 1, 10, TILE_FLOOR_LUXURY as TileId);
    fill(15, 15, 3, 10, TILE_FLOOR_LUXURY as TileId);
    set(14, 18, TILE_NPC as TileId);
  }

  // ---- Zone 4: Le Siege Social (bottom-left, row 20-27, col 0-9) ----
  const z4locked = playerLevel < 10;
  if (z4locked) {
    fill(20, 0, 8, 10, TILE_LOCKED as TileId);
  } else {
    fill(20, 0, 8, 10, TILE_FLOOR_LUXURY as TileId);
    // Boardroom table
    fill(22, 3, 3, 4, TILE_DESK as TileId);
    // Screens on walls
    set(20, 1, TILE_WALL as TileId);
    set(20, 8, TILE_WALL as TileId);
    fill(20, 0, 1, 10, TILE_WALL as TileId);
    set(20, 4, TILE_DOOR as TileId);
    set(20, 5, TILE_DOOR as TileId);
    // NPC
    set(22, 4, TILE_NPC as TileId);
    // Walkable
    fill(21, 0, 1, 10, TILE_FLOOR_LUXURY as TileId);
    fill(25, 0, 2, 10, TILE_FLOOR_LUXURY as TileId);
    fill(22, 0, 3, 3, TILE_FLOOR_LUXURY as TileId);
    fill(22, 7, 3, 3, TILE_FLOOR_LUXURY as TileId);
    set(22, 4, TILE_NPC as TileId);
  }

  // ---- Zone 5: Le Penthouse (bottom-right, row 20-27, col 30-39) ----
  const z5locked = playerLevel < 13;
  if (z5locked) {
    fill(20, 30, 8, 10, TILE_LOCKED as TileId);
  } else {
    fill(20, 30, 8, 10, TILE_FLOOR_GOLD as TileId);
    // Helipad
    fill(20, 35, 2, 4, TILE_FLOOR_BASIC as TileId);
    // Luxury items
    set(22, 32, TILE_DESK as TileId);
    set(22, 37, TILE_DESK as TileId);
    // Rooftop view
    fill(27, 30, 1, 10, TILE_WATER as TileId);
    // Door
    set(20, 34, TILE_DOOR as TileId);
    // NPC
    set(22, 34, TILE_NPC as TileId);
    // Walkable areas
    fill(21, 30, 1, 10, TILE_FLOOR_GOLD as TileId);
    fill(23, 30, 4, 10, TILE_FLOOR_GOLD as TileId);
    set(22, 34, TILE_NPC as TileId);
  }

  // ---- Zone 6: Farming (center-right, row 12-17, col 30-37) ----
  fill(12, 30, 6, 8, TILE_FARMING as TileId);
  // Sign at entrance
  set(12, 30, TILE_SIGN as TileId);
  // Some structure
  set(12, 33, TILE_WALL as TileId);
  set(12, 34, TILE_WALL as TileId);

  // ---- Connecting paths ----
  // Horizontal path top (connecting Garage to Open Space)
  fill(7, 0, 1, MAP_COLS, TILE_PATH as TileId);
  // Vertical path left
  fill(0, 9, MAP_ROWS, 1, TILE_PATH as TileId);
  // Vertical path center
  fill(0, 19, MAP_ROWS, 1, TILE_PATH as TileId);
  // Vertical path right
  fill(0, 29, MAP_ROWS, 1, TILE_PATH as TileId);
  // Horizontal path middle
  fill(10, 0, 1, MAP_COLS, TILE_PATH as TileId);
  // Horizontal path bottom
  fill(19, 0, 1, MAP_COLS, TILE_PATH as TileId);
  // Extra horizontal path near farming
  fill(17, 25, 1, 15, TILE_PATH as TileId);

  // Water borders (decorative edges)
  fill(28, 0, 2, MAP_COLS, TILE_WATER as TileId);
  fill(0, 0, MAP_ROWS, 0, TILE_WATER as TileId); // left col already grass, skip

  // Ensure NPC tiles are set after paths
  for (const npc of NPCS) {
    set(npc.row, npc.col, TILE_NPC as TileId);
  }

  return grid;
}

/* ------------------------------------------------------------------ */
/*  Helper: which zone is a position in?                               */
/* ------------------------------------------------------------------ */

function getZoneAt(row: number, col: number): ZoneRect | undefined {
  return ZONES.find(
    (z) =>
      row >= z.startRow &&
      row < z.startRow + z.rows &&
      col >= z.startCol &&
      col < z.startCol + z.cols,
  );
}

/* ------------------------------------------------------------------ */
/*  Direction type                                                     */
/* ------------------------------------------------------------------ */

type Direction = 'up' | 'down' | 'left' | 'right';

const DIR_OFFSETS: Record<Direction, { dr: number; dc: number }> = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
};

/* ------------------------------------------------------------------ */
/*  Simple seeded random from user ID                                  */
/* ------------------------------------------------------------------ */

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/* ------------------------------------------------------------------ */
/*  Tile rendering component                                           */
/* ------------------------------------------------------------------ */

interface TileRendererProps {
  tileId: TileId;
  row: number;
  col: number;
  isNPCTile: boolean;
  npcName?: string;
}

function TileRenderer({ tileId, row, col, isNPCTile, npcName }: TileRendererProps) {
  const config = TILE_CONFIG[tileId];
  const hasDetail = (row + col) % 3 === 0;
  const isFarming = tileId === TILE_FARMING;
  const isSign = tileId === TILE_SIGN;
  const isDesk = tileId === TILE_DESK;
  const isLocked = tileId === TILE_LOCKED;
  const isDoor = tileId === TILE_DOOR;

  // Get the actual background for NPC tiles based on surrounding context
  const bgColor = isNPCTile ? TILE_CONFIG[TILE_FLOOR_BASIC].bg : config.bg;

  return (
    <div
      className={cn(
        'relative pixel-art',
        isFarming && 'animate-pulse',
      )}
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        backgroundColor: bgColor,
        borderRight: '1px solid rgba(0,0,0,0.15)',
        borderBottom: '1px solid rgba(0,0,0,0.15)',
      }}
    >
      {/* Grass detail */}
      {hasDetail && config.detail && !isNPCTile && (
        <div
          className="absolute"
          style={{
            width: 4,
            height: 4,
            backgroundColor: config.detail,
            top: tileId === TILE_GRASS ? 12 : 8,
            left: tileId === TILE_GRASS ? 14 : 10,
            opacity: 0.6,
          }}
        />
      )}

      {/* Farming grass tall blades */}
      {isFarming && (
        <>
          <div
            className="absolute"
            style={{ width: 2, height: 10, backgroundColor: '#388E3C', top: 4, left: 8, opacity: 0.8 }}
          />
          <div
            className="absolute"
            style={{ width: 2, height: 12, backgroundColor: '#2E7D32', top: 2, left: 16, opacity: 0.7 }}
          />
          <div
            className="absolute"
            style={{ width: 2, height: 8, backgroundColor: '#43A047', top: 6, left: 24, opacity: 0.9 }}
          />
        </>
      )}

      {/* Sign tile */}
      {isSign && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 16, height: 12, backgroundColor: '#A1887F', border: '1px solid #6D4C41' }}>
            <div style={{ width: 2, height: 8, backgroundColor: '#5D4037', margin: '12px auto 0' }} />
          </div>
        </div>
      )}

      {/* Desk with monitor */}
      {isDesk && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 20, height: 14, backgroundColor: '#5D4037', border: '1px solid #3E2723' }}>
            <div style={{ width: 12, height: 8, backgroundColor: '#4DD0E1', margin: '1px auto 0' }} />
          </div>
        </div>
      )}

      {/* Locked barrier overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          {(row + col) % 5 === 0 && (
            <span className="text-[10px] opacity-60">{'\uD83D\uDD12'}</span>
          )}
        </div>
      )}

      {/* Door highlight */}
      {isDoor && (
        <div
          className="absolute inset-1"
          style={{ backgroundColor: '#FFE082', opacity: 0.3 }}
        />
      )}

      {/* NPC label */}
      {isNPCTile && npcName && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
          <span className="font-pixel text-[6px] text-ecs-amber bg-black/70 px-1 py-0.5">
            {npcName}
          </span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface WorldClientProps {
  userId: string;
  level: number;
  totalXP: number;
  businessType: string;
  fullName: string;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function WorldClient({ userId, level, totalXP, businessType, fullName }: WorldClientProps) {
  const setPlayer = usePlayerStore((s) => s.setPlayer);
  const storeLevel = usePlayerStore((s) => s.level);

  // Init store
  useEffect(() => {
    setPlayer({ level, totalXP, currentStreak: 0 });
  }, [level, totalXP, setPlayer]);

  const avatarVariant = useMemo(() => (hashCode(userId) % 8) + 1, [userId]);
  const xpForNextLevel = useMemo(() => level * 150, [level]);
  const currentXpInLevel = useMemo(() => totalXP % (level * 150), [totalXP, level]);

  // Map data
  const grid = useMemo(() => buildMap(storeLevel || level), [storeLevel, level]);

  // Player position
  const [playerRow, setPlayerRow] = useState(5);
  const [playerCol, setPlayerCol] = useState(5);
  const [facing, setFacing] = useState<Direction>('down');
  const [isWalking, setIsWalking] = useState(false);
  const walkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dialog state
  const [activeDialog, setActiveDialog] = useState<{ speaker: string; text: string; avatarVariant?: number }[] | null>(null);

  // Farming state
  const [showFarming, setShowFarming] = useState(false);
  const farmingCooldownRef = useRef(false);

  // Notebook state
  const [showNotebook, setShowNotebook] = useState(false);

  // Fake player profile popup
  const [selectedFakePlayer, setSelectedFakePlayer] = useState<FakePlayer | null>(null);

  // Current zone display
  const currentZone = useMemo(() => getZoneAt(playerRow, playerCol), [playerRow, playerCol]);

  // NPC lookup
  const npcMap = useMemo(() => {
    const map = new Map<string, NPCDef>();
    for (const npc of NPCS) {
      map.set(`${npc.row}-${npc.col}`, npc);
    }
    return map;
  }, []);

  // Fake player lookup
  const fakePlayerMap = useMemo(() => {
    const map = new Map<string, FakePlayer>();
    for (const fp of FAKE_PLAYERS) {
      map.set(`${fp.row}-${fp.col}`, fp);
    }
    return map;
  }, []);

  /* ---- Movement ---- */

  const canMoveTo = useCallback(
    (row: number, col: number): boolean => {
      if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return false;
      const tile = grid[row][col];
      const config = TILE_CONFIG[tile];
      return config.walkable;
    },
    [grid],
  );

  const movePlayer = useCallback(
    (dir: Direction) => {
      if (activeDialog || showFarming || showNotebook) return;

      setFacing(dir);
      const { dr, dc } = DIR_OFFSETS[dir];
      const newRow = playerRow + dr;
      const newCol = playerCol + dc;

      if (!canMoveTo(newRow, newCol)) return;

      setPlayerRow(newRow);
      setPlayerCol(newCol);
      setIsWalking(true);

      if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
      walkTimeoutRef.current = setTimeout(() => setIsWalking(false), 200);

      // Check farming encounter
      const newTile = grid[newRow][newCol];
      if (newTile === TILE_FARMING && !farmingCooldownRef.current) {
        const roll = Math.random();
        if (roll < 0.3) {
          farmingCooldownRef.current = true;
          setTimeout(() => {
            setShowFarming(true);
          }, 300);
        }
      }
    },
    [playerRow, playerCol, canMoveTo, activeDialog, showFarming, showNotebook, grid],
  );

  const interactWithNearby = useCallback(() => {
    if (activeDialog || showFarming) return;

    // Check all 4 adjacent tiles + current for NPCs
    const checkPositions = [
      { r: playerRow, c: playerCol },
      { r: playerRow - 1, c: playerCol },
      { r: playerRow + 1, c: playerCol },
      { r: playerRow, c: playerCol - 1 },
      { r: playerRow, c: playerCol + 1 },
    ];

    for (const pos of checkPositions) {
      const key = `${pos.r}-${pos.c}`;
      const npc = npcMap.get(key);
      if (npc) {
        // Find appropriate dialogue based on level
        const playerLvl = storeLevel || level;
        let bestDialogue = npc.dialogues[0];
        for (const d of npc.dialogues) {
          if (playerLvl >= d.minLevel) {
            bestDialogue = d;
          }
        }
        setActiveDialog(bestDialogue.messages);
        return;
      }

      // Check fake players
      const fp = fakePlayerMap.get(key);
      if (fp) {
        setSelectedFakePlayer(fp);
        return;
      }
    }

    // Check if on sign
    const currentTile = grid[playerRow][playerCol];
    const adjacentTiles = checkPositions.map((p) =>
      p.r >= 0 && p.r < MAP_ROWS && p.c >= 0 && p.c < MAP_COLS ? grid[p.r][p.c] : null,
    );

    if (currentTile === TILE_SIGN || adjacentTiles.includes(TILE_SIGN)) {
      const zone = getZoneAt(playerRow, playerCol);
      if (zone?.id === 'garage' || (!zone && playerRow < 5)) {
        setActiveDialog([
          { speaker: 'Panneau', text: 'Bienvenue dans le monde du business !' },
          { speaker: 'Panneau', text: "Explore les zones, parle aux PNJ et farm des leads !" },
        ]);
      } else if (zone?.id === 'farming') {
        setActiveDialog([
          { speaker: 'Panneau', text: "Zone de Farming \u2014 R\u00e9colte des leads" },
          { speaker: 'Panneau', text: "Marche dans l'herbe haute pour trouver des leads !" },
        ]);
      }
    }
  }, [playerRow, playerCol, activeDialog, showFarming, npcMap, fakePlayerMap, grid, storeLevel, level]);

  /* ---- Keyboard handling ---- */

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Prevent scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }

      if (activeDialog) {
        if (e.key === 'Enter' || e.key === ' ') {
          // Dialog handles its own advance via click
        }
        return;
      }

      if (showNotebook) {
        if (e.key === 'Escape') setShowNotebook(false);
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          movePlayer('up');
          break;
        case 'ArrowDown':
        case 's':
          movePlayer('down');
          break;
        case 'ArrowLeft':
        case 'a':
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
          movePlayer('right');
          break;
        case 'Enter':
        case ' ':
          interactWithNearby();
          break;
        case 'f':
        case 'F':
          // Open notebook
          setShowNotebook((prev) => !prev);
          break;
        case 'Escape':
          setSelectedFakePlayer(null);
          break;
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [movePlayer, interactWithNearby, activeDialog, showNotebook]);

  /* ---- Click to move ---- */

  const handleTileClick = useCallback(
    (row: number, col: number) => {
      if (activeDialog || showFarming || showNotebook) return;

      // Check if clicked an NPC
      const npcKey = `${row}-${col}`;
      const npc = npcMap.get(npcKey);
      if (npc) {
        // Move adjacent then interact
        const playerLvl = storeLevel || level;
        let bestDialogue = npc.dialogues[0];
        for (const d of npc.dialogues) {
          if (playerLvl >= d.minLevel) {
            bestDialogue = d;
          }
        }
        setActiveDialog(bestDialogue.messages);
        return;
      }

      // Check if clicked a fake player
      const fpKey = `${row}-${col}`;
      const fp = fakePlayerMap.get(fpKey);
      if (fp) {
        setSelectedFakePlayer(fp);
        return;
      }

      // Simple directional move towards clicked tile
      const dr = row - playerRow;
      const dc = col - playerCol;

      if (Math.abs(dr) > Math.abs(dc)) {
        movePlayer(dr > 0 ? 'down' : 'up');
      } else if (dc !== 0) {
        movePlayer(dc > 0 ? 'right' : 'left');
      }
    },
    [activeDialog, showFarming, showNotebook, npcMap, fakePlayerMap, playerRow, playerCol, movePlayer, storeLevel, level],
  );

  /* ---- Camera offset ---- */

  const cameraOffsetRow = useMemo(() => {
    const half = Math.floor(VIEWPORT_ROWS / 2);
    return Math.max(0, Math.min(playerRow - half, MAP_ROWS - VIEWPORT_ROWS));
  }, [playerRow]);

  const cameraOffsetCol = useMemo(() => {
    const half = Math.floor(VIEWPORT_COLS / 2);
    return Math.max(0, Math.min(playerCol - half, MAP_COLS - VIEWPORT_COLS));
  }, [playerCol]);

  /* ---- Visible tiles ---- */

  const visibleTiles = useMemo(() => {
    const tiles: { row: number; col: number; tileId: TileId; npc?: NPCDef }[] = [];
    for (let vr = 0; vr < VIEWPORT_ROWS; vr++) {
      for (let vc = 0; vc < VIEWPORT_COLS; vc++) {
        const mapRow = cameraOffsetRow + vr;
        const mapCol = cameraOffsetCol + vc;
        if (mapRow < MAP_ROWS && mapCol < MAP_COLS) {
          const key = `${mapRow}-${mapCol}`;
          tiles.push({
            row: mapRow,
            col: mapCol,
            tileId: grid[mapRow][mapCol],
            npc: npcMap.get(key),
          });
        }
      }
    }
    return tiles;
  }, [cameraOffsetRow, cameraOffsetCol, grid, npcMap]);

  /* ---- Visible NPCs ---- */

  const visibleNPCs = useMemo(() => {
    return NPCS.filter(
      (npc) =>
        npc.row >= cameraOffsetRow &&
        npc.row < cameraOffsetRow + VIEWPORT_ROWS &&
        npc.col >= cameraOffsetCol &&
        npc.col < cameraOffsetCol + VIEWPORT_COLS,
    );
  }, [cameraOffsetRow, cameraOffsetCol]);

  /* ---- Visible fake players ---- */

  const visibleFakePlayers = useMemo(() => {
    return FAKE_PLAYERS.filter(
      (fp) =>
        fp.row >= cameraOffsetRow &&
        fp.row < cameraOffsetRow + VIEWPORT_ROWS &&
        fp.col >= cameraOffsetCol &&
        fp.col < cameraOffsetCol + VIEWPORT_COLS,
    );
  }, [cameraOffsetRow, cameraOffsetCol]);

  /* ---- Farming encounter close ---- */

  const handleFarmingClose = useCallback(() => {
    setShowFarming(false);
    setTimeout(() => {
      farmingCooldownRef.current = false;
    }, 2000);
  }, []);

  /* ---- Render ---- */

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="font-pixel text-[12px] text-white">Monde RPG</h2>
          <p className="font-pixel text-[8px] text-white/40 mt-0.5">
            {fullName} &mdash; {businessType}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNotebook(true)}
          className="font-pixel text-[8px] text-ecs-amber border border-ecs-amber/30 px-2 py-1 hover:bg-ecs-amber/10 transition-colors"
        >
          Carnet de Leads (F)
        </button>
      </div>

      {/* HUD: XP bar */}
      <div className="mb-2">
        <PixelBar
          label="XP"
          current={currentXpInLevel}
          max={xpForNextLevel}
          size="sm"
          color="xp"
        />
      </div>

      {/* Map viewport */}
      <div
        className="relative overflow-hidden border-2 border-white/20 bg-black mx-auto"
        style={{
          width: VIEWPORT_COLS * TILE_SIZE,
          height: VIEWPORT_ROWS * TILE_SIZE,
          imageRendering: 'pixelated',
        }}
        tabIndex={0}
        role="application"
        aria-label="Carte du monde RPG"
      >
        {/* Tile grid */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${VIEWPORT_COLS}, ${TILE_SIZE}px)`,
            gridTemplateRows: `repeat(${VIEWPORT_ROWS}, ${TILE_SIZE}px)`,
          }}
        >
          {visibleTiles.map((tile) => (
            <button
              key={`${tile.row}-${tile.col}`}
              type="button"
              className="p-0 border-0 cursor-pointer"
              onClick={() => handleTileClick(tile.row, tile.col)}
              aria-label={`Tuile ${tile.row},${tile.col}`}
              tabIndex={-1}
            >
              <TileRenderer
                tileId={tile.tileId}
                row={tile.row}
                col={tile.col}
                isNPCTile={tile.tileId === TILE_NPC}
                npcName={tile.npc?.name}
              />
            </button>
          ))}
        </div>

        {/* NPC avatars */}
        {visibleNPCs.map((npc) => (
          <div
            key={npc.id}
            className="absolute z-10 pointer-events-none"
            style={{
              left: (npc.col - cameraOffsetCol) * TILE_SIZE + TILE_SIZE / 2 - 8,
              top: (npc.row - cameraOffsetRow) * TILE_SIZE + TILE_SIZE / 2 - 20,
            }}
          >
            <PixelAvatar variant={npc.variant} size="sm" level={1} />
          </div>
        ))}

        {/* Fake player avatars */}
        {visibleFakePlayers.map((fp) => (
          <div
            key={fp.id}
            className="absolute z-10"
            style={{
              left: (fp.col - cameraOffsetCol) * TILE_SIZE + TILE_SIZE / 2 - 8,
              top: (fp.row - cameraOffsetRow) * TILE_SIZE + TILE_SIZE / 2 - 20,
            }}
          >
            <button
              type="button"
              className="relative"
              onClick={() => setSelectedFakePlayer(fp)}
              aria-label={`Joueur: ${fp.name}`}
            >
              <PixelAvatar variant={fp.variant} size="sm" level={fp.level} />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="font-pixel text-[6px] text-white/70 bg-black/60 px-1">
                  {fp.name}
                </span>
              </div>
            </button>
          </div>
        ))}

        {/* Player character */}
        <div
          className="absolute z-20 transition-all duration-150 ease-linear"
          style={{
            left: (playerCol - cameraOffsetCol) * TILE_SIZE + TILE_SIZE / 2 - 8,
            top: (playerRow - cameraOffsetRow) * TILE_SIZE + TILE_SIZE / 2 - 20,
          }}
        >
          <div className="relative">
            <PixelAvatar
              variant={avatarVariant}
              size="sm"
              level={storeLevel || level}
              walking={isWalking}
            />
            {/* Player name label */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="font-pixel text-[6px] text-ecs-amber bg-black/70 px-1 py-0.5">
                {fullName.split(' ')[0]}
              </span>
            </div>
            {/* Direction indicator */}
            <div
              className="absolute w-0 h-0 pointer-events-none"
              style={{
                ...(facing === 'down' && { bottom: -4, left: '50%', transform: 'translateX(-50%)', borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderTop: '4px solid #FFBF00' }),
                ...(facing === 'up' && { top: -4, left: '50%', transform: 'translateX(-50%)', borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderBottom: '4px solid #FFBF00' }),
                ...(facing === 'left' && { left: -4, top: '50%', transform: 'translateY(-50%)', borderTop: '3px solid transparent', borderBottom: '3px solid transparent', borderRight: '4px solid #FFBF00' }),
                ...(facing === 'right' && { right: -4, top: '50%', transform: 'translateY(-50%)', borderTop: '3px solid transparent', borderBottom: '3px solid transparent', borderLeft: '4px solid #FFBF00' }),
              }}
            />
          </div>
        </div>

        {/* HUD: Zone name */}
        <div className="absolute top-2 right-2 z-30">
          <span className="font-pixel text-[8px] text-white bg-black/70 px-2 py-1 border border-white/20">
            {currentZone?.name ?? 'Chemin'}
          </span>
        </div>

        {/* HUD: Coordinates (debug-like feel) */}
        <div className="absolute top-2 left-2 z-30">
          <span className="font-pixel text-[7px] text-white/40 bg-black/50 px-1">
            Nv.{storeLevel || level} ({playerRow},{playerCol})
          </span>
        </div>

        {/* Dialog overlay */}
        <AnimatePresence>
          {activeDialog && (
            <div className="absolute bottom-0 left-0 right-0 z-40 p-2">
              <PixelDialog
                messages={activeDialog}
                onComplete={() => setActiveDialog(null)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Fake player profile popup */}
        <AnimatePresence>
          {selectedFakePlayer && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#0a0a2e] border-2 border-ecs-amber/50 p-4 pixel-art"
              style={{ minWidth: 180 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <button
                type="button"
                onClick={() => setSelectedFakePlayer(null)}
                className="absolute top-1 right-2 font-pixel text-[10px] text-white/50 hover:text-white"
                aria-label="Fermer"
              >
                X
              </button>
              <div className="flex items-center gap-3 mb-2">
                <PixelAvatar variant={selectedFakePlayer.variant} size="sm" level={selectedFakePlayer.level} />
                <div>
                  <div className="font-pixel text-[10px] text-white">{selectedFakePlayer.name}</div>
                  <div className="font-pixel text-[8px] text-ecs-amber">Nv.{selectedFakePlayer.level}</div>
                </div>
              </div>
              <div className="font-pixel text-[7px] text-white/50">
                Joueur en ligne
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom HUD: controls */}
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="font-pixel text-[7px] text-white/30">
          {'\u2B06\uFE0F\u2B07\uFE0F\u2B05\uFE0F\u27A1\uFE0F'} Se d\u00e9placer &bull; Entr\u00e9e: Interagir &bull; F: Carnet de Leads
        </span>
        {currentZone?.id === 'farming' && (
          <span className="font-pixel text-[7px] text-green-400 animate-pulse">
            Zone de Farming active
          </span>
        )}
      </div>

      {/* Mobile D-pad controls */}
      <div className="mt-4 flex justify-center md:hidden">
        <div className="grid grid-cols-3 gap-1" style={{ width: 100 }}>
          <div />
          <button
            type="button"
            className="w-8 h-8 bg-white/10 border border-white/20 flex items-center justify-center font-pixel text-[10px] text-white active:bg-white/20"
            onClick={() => movePlayer('up')}
            aria-label="Haut"
          >
            {'\u25B2'}
          </button>
          <div />
          <button
            type="button"
            className="w-8 h-8 bg-white/10 border border-white/20 flex items-center justify-center font-pixel text-[10px] text-white active:bg-white/20"
            onClick={() => movePlayer('left')}
            aria-label="Gauche"
          >
            {'\u25C0'}
          </button>
          <button
            type="button"
            className="w-8 h-8 bg-ecs-amber/20 border border-ecs-amber/30 flex items-center justify-center font-pixel text-[8px] text-ecs-amber active:bg-ecs-amber/30"
            onClick={interactWithNearby}
            aria-label="Interagir"
          >
            OK
          </button>
          <button
            type="button"
            className="w-8 h-8 bg-white/10 border border-white/20 flex items-center justify-center font-pixel text-[10px] text-white active:bg-white/20"
            onClick={() => movePlayer('right')}
            aria-label="Droite"
          >
            {'\u25B6'}
          </button>
          <div />
          <button
            type="button"
            className="w-8 h-8 bg-white/10 border border-white/20 flex items-center justify-center font-pixel text-[10px] text-white active:bg-white/20"
            onClick={() => movePlayer('down')}
            aria-label="Bas"
          >
            {'\u25BC'}
          </button>
          <div />
        </div>
      </div>

      {/* Farming encounter overlay */}
      <AnimatePresence>
        {showFarming && (
          <FarmingEncounter
            playerLevel={storeLevel || level}
            businessType={businessType}
            onClose={handleFarmingClose}
          />
        )}
      </AnimatePresence>

      {/* Lead notebook modal */}
      <AnimatePresence>
        {showNotebook && (
          <LeadNotebook onClose={() => setShowNotebook(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
