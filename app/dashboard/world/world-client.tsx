'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlayerStore } from '@/stores/usePlayerStore';

const PixelAvatar = dynamic(() => import('@/components/game/PixelAvatar').then(m => ({ default: m.PixelAvatar })), { ssr: false });
const PixelBar = dynamic(() => import('@/components/game/PixelBar').then(m => ({ default: m.PixelBar })), { ssr: false });
const PixelDialog = dynamic(() => import('@/components/game/PixelDialog').then(m => ({ default: m.PixelDialog })), { ssr: false });
const FarmingEncounter = dynamic(() => import('@/components/game/FarmingEncounter').then(m => ({ default: m.FarmingEncounter })), { ssr: false });
const LeadNotebook = dynamic(() => import('@/components/game/LeadNotebook').then(m => ({ default: m.LeadNotebook })), { ssr: false });

/* ================================================================== */
/*  TILE SYSTEM — Gather Town pixel art tiles (32x32 CSS)             */
/* ================================================================== */

const TILE_GRASS = 0;
const TILE_PATH = 1;
const TILE_WALL = 2;
const TILE_WATER = 3;
const TILE_FLOOR_OFFICE = 4;
const TILE_FLOOR_LUXURY = 5;
const TILE_FLOOR_GOLD = 6;
const TILE_DESK = 7;
const TILE_DOOR = 8;
const TILE_NPC = 9;
const TILE_FARMING = 10;
const TILE_LOCKED = 11;
const TILE_SIGN = 12;
const TILE_FLOWERS = 13;
const TILE_ROOF = 14;
const TILE_CHAIR = 15;
const TILE_COMPUTER = 16;
const TILE_PLANT = 17;
const TILE_BOOKSHELF = 18;
const TILE_COFFEE = 19;
const TILE_WHITEBOARD = 20;
const TILE_PHONE = 21;
const TILE_COUCH = 22;
const TILE_TABLE_ROUND = 23;
const TILE_STREETLIGHT = 24;
const TILE_TREE = 25;
const TILE_BENCH = 26;
const TILE_CAR = 27;
const TILE_SIGNPOST = 28;
const TILE_BARN = 29;
const TILE_FOUNTAIN = 30;

type TileId =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19
  | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30;

interface TileConfig {
  bg: string;
  walkable: boolean;
  detail?: string;
  label?: string;
}

const TILE_CONFIG: Record<TileId, TileConfig> = {
  [TILE_GRASS]:        { bg: '#7EC850', walkable: true, detail: '#6AB840' },
  [TILE_PATH]:         { bg: '#C4B28A', walkable: true, detail: '#B8A57A' },
  [TILE_WALL]:         { bg: '#7B6B5A', walkable: false, detail: '#6B5B4A' },
  [TILE_WATER]:        { bg: '#4A90D9', walkable: false, detail: '#5BA0E9' },
  [TILE_FLOOR_OFFICE]: { bg: '#E0D8CF', walkable: true, detail: '#D4CCC3' },
  [TILE_FLOOR_LUXURY]: { bg: '#2C2C2C', walkable: true, detail: '#3A3A3A' },
  [TILE_FLOOR_GOLD]:   { bg: '#2C2C2C', walkable: true, detail: '#FFD700' },
  [TILE_DESK]:         { bg: '#E0D8CF', walkable: false, detail: '#8B6914', label: 'Bureau' },
  [TILE_DOOR]:         { bg: '#8B4513', walkable: true, detail: '#FFD700' },
  [TILE_NPC]:          { bg: 'transparent', walkable: false },
  [TILE_FARMING]:      { bg: '#3D7A2A', walkable: true, detail: '#2E6B1B' },
  [TILE_LOCKED]:       { bg: '#555555', walkable: false, detail: '#444444' },
  [TILE_SIGN]:         { bg: '#C4B28A', walkable: false, detail: '#A1887F' },
  [TILE_FLOWERS]:      { bg: '#7EC850', walkable: true, detail: '#FF69B4' },
  [TILE_ROOF]:         { bg: '#CC6644', walkable: false, detail: '#BB5533' },
  [TILE_CHAIR]:        { bg: '#E0D8CF', walkable: false, detail: '#8B6914' },
  [TILE_COMPUTER]:     { bg: '#E0D8CF', walkable: false, detail: '#00BFFF' },
  [TILE_PLANT]:        { bg: '#E0D8CF', walkable: false, detail: '#4CAF50' },
  [TILE_BOOKSHELF]:    { bg: '#E0D8CF', walkable: false, detail: '#8B4513' },
  [TILE_COFFEE]:       { bg: '#E0D8CF', walkable: false, detail: '#6F4E37' },
  [TILE_WHITEBOARD]:   { bg: '#E0D8CF', walkable: false, detail: '#FFFFFF' },
  [TILE_PHONE]:        { bg: '#E0D8CF', walkable: false, detail: '#333333' },
  [TILE_COUCH]:        { bg: '#E0D8CF', walkable: false, detail: '#8B0000' },
  [TILE_TABLE_ROUND]:  { bg: '#E0D8CF', walkable: false, detail: '#A0522D' },
  [TILE_STREETLIGHT]:  { bg: '#7EC850', walkable: false, detail: '#FFE082' },
  [TILE_TREE]:         { bg: '#7EC850', walkable: false, detail: '#2E7D32' },
  [TILE_BENCH]:        { bg: '#C4B28A', walkable: false, detail: '#6D4C41' },
  [TILE_CAR]:          { bg: '#C4B28A', walkable: false, detail: '#1565C0' },
  [TILE_SIGNPOST]:     { bg: '#C4B28A', walkable: false, detail: '#795548' },
  [TILE_BARN]:         { bg: '#3D7A2A', walkable: false, detail: '#8B4513' },
  [TILE_FOUNTAIN]:     { bg: '#C4B28A', walkable: false, detail: '#4A90D9' },
};

/* ================================================================== */
/*  Map dimensions & viewport                                         */
/* ================================================================== */

const TILE_SIZE = 32;
const MAP_COLS = 50;
const MAP_ROWS = 35;

/* ================================================================== */
/*  NPC definitions                                                   */
/* ================================================================== */

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
    row: 13,
    col: 8,
    variant: 6,
    zone: 'garage',
    dialogues: [
      {
        minLevel: 1,
        messages: [
          { speaker: 'Le Mentor', text: 'Bienvenue, jeune entrepreneur !', avatarVariant: 6 },
          { speaker: 'Le Mentor', text: 'Ton premier objectif : envoyer 10 messages de prospection.', avatarVariant: 6 },
          { speaker: 'Le Mentor', text: "Chaque action dans le monde r\u00e9el te rapporte de l'XP ici.", avatarVariant: 6 },
          { speaker: 'Le Mentor', text: 'Va dans la Zone de Farming au sud pour r\u00e9colter tes premiers leads !', avatarVariant: 6 },
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
    row: 13,
    col: 38,
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
    row: 5,
    col: 24,
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
    row: 5,
    col: 38,
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
    row: 2,
    col: 42,
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
          { speaker: 'La L\u00e9gende', text: "Ton nom resonne dans tout l'\u00e9cosyst\u00e8me.", avatarVariant: 5 },
          { speaker: 'La L\u00e9gende', text: "Maintenant, ton r\u00f4le est d'inspirer les autres.", avatarVariant: 5 },
        ],
      },
    ],
  },
];

/* ================================================================== */
/*  Fake online players                                               */
/* ================================================================== */

interface FakePlayer {
  id: string;
  name: string;
  row: number;
  col: number;
  variant: number;
  level: number;
}

const FAKE_PLAYERS: FakePlayer[] = [
  { id: 'fp1', name: 'Alex K.', row: 17, col: 22, variant: 2, level: 3 },
  { id: 'fp2', name: 'Sarah M.', row: 16, col: 26, variant: 4, level: 5 },
  { id: 'fp3', name: 'Jordan L.', row: 12, col: 6, variant: 7, level: 8 },
  { id: 'fp4', name: 'Nina R.', row: 28, col: 24, variant: 1, level: 2 },
  { id: 'fp5', name: 'Tom B.', row: 5, col: 21, variant: 5, level: 11 },
  { id: 'fp6', name: 'Lina F.', row: 30, col: 14, variant: 8, level: 6 },
];

/* ================================================================== */
/*  Zone definitions                                                  */
/* ================================================================== */

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
  { id: 'plaza', name: 'Place Centrale', startRow: 14, startCol: 19, rows: 7, cols: 12, minLevel: 1 },
  { id: 'garage', name: 'Le Garage', startRow: 10, startCol: 3, rows: 7, cols: 10, minLevel: 1 },
  { id: 'openspace', name: "L'Open Space", startRow: 10, startCol: 33, rows: 7, cols: 12, minLevel: 4 },
  { id: 'tour', name: 'La Tour', startRow: 2, startCol: 19, rows: 7, cols: 12, minLevel: 7 },
  { id: 'siege', name: 'Le Si\u00e8ge Social', startRow: 2, startCol: 33, rows: 7, cols: 12, minLevel: 10 },
  { id: 'penthouse', name: 'Le Penthouse', startRow: 0, startCol: 38, rows: 5, cols: 10, minLevel: 13 },
  { id: 'farming', name: 'Zone de Farming', startRow: 25, startCol: 10, rows: 8, cols: 16, minLevel: 1 },
];

/* ================================================================== */
/*  Map builder — "Scale Corp City" 50x35                             */
/* ================================================================== */

function buildMap(playerLevel: number): TileId[][] {
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

  /* ---- Scatter flowers on grass ---- */
  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      if ((r * 7 + c * 13) % 29 === 0) {
        set(r, c, TILE_FLOWERS as TileId);
      }
    }
  }

  /* ---- Water borders (south + east edges) ---- */
  fill(33, 0, 2, MAP_COLS, TILE_WATER as TileId);
  fill(0, 48, MAP_ROWS, 2, TILE_WATER as TileId);

  /* ============================================================ */
  /*  CENTRAL PLAZA (center, rows 14-20, cols 19-30)              */
  /* ============================================================ */
  fill(14, 19, 7, 12, TILE_PATH as TileId);
  // Fountain in center
  set(17, 24, TILE_FOUNTAIN as TileId);
  set(17, 25, TILE_FOUNTAIN as TileId);
  set(16, 24, TILE_FOUNTAIN as TileId);
  set(16, 25, TILE_FOUNTAIN as TileId);
  // Benches
  set(15, 21, TILE_BENCH as TileId);
  set(15, 28, TILE_BENCH as TileId);
  set(19, 21, TILE_BENCH as TileId);
  set(19, 28, TILE_BENCH as TileId);
  // Trees
  set(14, 19, TILE_TREE as TileId);
  set(14, 30, TILE_TREE as TileId);
  set(20, 19, TILE_TREE as TileId);
  set(20, 30, TILE_TREE as TileId);
  // Signpost "SCALE CORP"
  set(15, 24, TILE_SIGNPOST as TileId);

  /* ============================================================ */
  /*  CONNECTING ROADS with streetlights, trees, benches, cars    */
  /* ============================================================ */

  // Horizontal main road (row 13, connecting garage to open space, through plaza)
  fill(13, 0, 1, MAP_COLS, TILE_PATH as TileId);
  // Vertical main road (col 18, connecting tour to farming, through plaza)
  fill(0, 18, MAP_ROWS, 1, TILE_PATH as TileId);
  // Vertical road east (col 32, connecting siege/openspace area)
  fill(0, 32, MAP_ROWS, 1, TILE_PATH as TileId);
  // Horizontal road upper (row 9, connecting buildings)
  fill(9, 0, 1, MAP_COLS, TILE_PATH as TileId);
  // Horizontal road to farming (row 24)
  fill(24, 5, 1, 40, TILE_PATH as TileId);
  // Vertical road center-left (col 12)
  fill(9, 12, 16, 1, TILE_PATH as TileId);
  // Vertical road right (col 45)
  fill(0, 45, 33, 1, TILE_PATH as TileId);

  // Streetlights along main roads
  const streetlightPositions: [number, number][] = [
    [13, 3], [13, 10], [13, 16], [13, 31], [13, 37], [13, 44],
    [9, 5], [9, 15], [9, 25], [9, 35], [9, 44],
    [24, 9], [24, 20], [24, 30], [24, 40],
    [3, 18], [7, 18], [11, 18], [22, 18], [27, 18],
    [3, 32], [7, 32], [16, 32], [22, 32],
  ];
  for (const [r, c] of streetlightPositions) {
    set(r, c, TILE_STREETLIGHT as TileId);
  }

  // Trees along roads
  const treePositions: [number, number][] = [
    [12, 1], [12, 5], [12, 15], [12, 33], [12, 40], [12, 46],
    [14, 1], [14, 5], [14, 15], [14, 33], [14, 40], [14, 46],
    [8, 2], [8, 14], [8, 24], [8, 36], [8, 43],
    [10, 2], [10, 14], [10, 36], [10, 46],
    [23, 8], [23, 18], [23, 28], [23, 38],
    [25, 8], [25, 28], [25, 38],
    [2, 17], [6, 17], [11, 17], [22, 17],
    [2, 19], [6, 19],
  ];
  for (const [r, c] of treePositions) {
    set(r, c, TILE_TREE as TileId);
  }

  // Benches along roads
  set(12, 17, TILE_BENCH as TileId);
  set(14, 17, TILE_BENCH as TileId);
  set(8, 31, TILE_BENCH as TileId);
  set(10, 31, TILE_BENCH as TileId);

  // Parked cars
  set(12, 34, TILE_CAR as TileId);
  set(12, 42, TILE_CAR as TileId);
  set(14, 34, TILE_CAR as TileId);
  set(8, 8, TILE_CAR as TileId);
  set(10, 8, TILE_CAR as TileId);

  /* ============================================================ */
  /*  LE GARAGE (west, Lv1+) — rows 10-16, cols 3-12              */
  /* ============================================================ */
  // Roof
  fill(10, 3, 1, 10, TILE_ROOF as TileId);
  // Walls
  fill(11, 3, 5, 1, TILE_WALL as TileId);
  fill(11, 12, 5, 1, TILE_WALL as TileId);
  // Interior floor
  fill(11, 4, 5, 8, TILE_FLOOR_OFFICE as TileId);
  // Door on south wall
  set(16, 7, TILE_DOOR as TileId);
  set(16, 8, TILE_DOOR as TileId);
  fill(16, 4, 1, 3, TILE_WALL as TileId);
  fill(16, 9, 1, 4, TILE_WALL as TileId);
  // Furniture inside
  set(11, 5, TILE_DESK as TileId);
  set(11, 6, TILE_COMPUTER as TileId);
  set(12, 5, TILE_CHAIR as TileId);
  set(11, 9, TILE_DESK as TileId);
  set(11, 10, TILE_COMPUTER as TileId);
  set(12, 9, TILE_CHAIR as TileId);
  set(11, 4, TILE_WHITEBOARD as TileId);
  set(14, 11, TILE_COFFEE as TileId);
  set(15, 11, TILE_PLANT as TileId);
  // NPC Le Mentor
  set(13, 8, TILE_NPC as TileId);

  /* ============================================================ */
  /*  L'OPEN SPACE (east, Lv4+) — rows 10-16, cols 33-44         */
  /* ============================================================ */
  if (playerLevel < 4) {
    fill(10, 33, 7, 12, TILE_LOCKED as TileId);
  } else {
    // Roof
    fill(10, 33, 1, 12, TILE_ROOF as TileId);
    // Walls
    fill(11, 33, 5, 1, TILE_WALL as TileId);
    fill(11, 44, 5, 1, TILE_WALL as TileId);
    // Interior floor
    fill(11, 34, 5, 10, TILE_FLOOR_OFFICE as TileId);
    // Door
    set(16, 38, TILE_DOOR as TileId);
    set(16, 39, TILE_DOOR as TileId);
    fill(16, 34, 1, 4, TILE_WALL as TileId);
    fill(16, 40, 1, 5, TILE_WALL as TileId);
    // Rows of desks
    set(11, 35, TILE_DESK as TileId);
    set(11, 37, TILE_DESK as TileId);
    set(11, 39, TILE_DESK as TileId);
    set(11, 41, TILE_DESK as TileId);
    set(12, 35, TILE_CHAIR as TileId);
    set(12, 37, TILE_CHAIR as TileId);
    set(12, 39, TILE_CHAIR as TileId);
    set(12, 41, TILE_CHAIR as TileId);
    set(14, 35, TILE_DESK as TileId);
    set(14, 37, TILE_DESK as TileId);
    set(14, 39, TILE_DESK as TileId);
    set(14, 41, TILE_DESK as TileId);
    set(15, 35, TILE_CHAIR as TileId);
    set(15, 37, TILE_CHAIR as TileId);
    set(15, 39, TILE_CHAIR as TileId);
    set(15, 41, TILE_CHAIR as TileId);
    // Phones + printer
    set(11, 43, TILE_PHONE as TileId);
    set(14, 43, TILE_PHONE as TileId);
    set(15, 43, TILE_BOOKSHELF as TileId);
    // NPC Le Closer
    set(13, 38, TILE_NPC as TileId);
  }

  /* ============================================================ */
  /*  LA TOUR (north, Lv7+) — rows 2-8, cols 19-30               */
  /* ============================================================ */
  if (playerLevel < 7) {
    fill(2, 19, 7, 12, TILE_LOCKED as TileId);
  } else {
    // Roof
    fill(2, 19, 1, 12, TILE_ROOF as TileId);
    // Walls
    fill(3, 19, 5, 1, TILE_WALL as TileId);
    fill(3, 30, 5, 1, TILE_WALL as TileId);
    // Interior floor
    fill(3, 20, 5, 10, TILE_FLOOR_OFFICE as TileId);
    // Door
    set(8, 24, TILE_DOOR as TileId);
    set(8, 25, TILE_DOOR as TileId);
    fill(8, 20, 1, 4, TILE_WALL as TileId);
    fill(8, 26, 1, 5, TILE_WALL as TileId);
    // Executive desk
    set(4, 24, TILE_DESK as TileId);
    set(4, 25, TILE_DESK as TileId);
    set(4, 26, TILE_COMPUTER as TileId);
    set(3, 24, TILE_CHAIR as TileId);
    // Couch + screen
    set(6, 20, TILE_COUCH as TileId);
    set(6, 21, TILE_COUCH as TileId);
    set(3, 28, TILE_WHITEBOARD as TileId);
    set(6, 29, TILE_PLANT as TileId);
    set(3, 20, TILE_BOOKSHELF as TileId);
    // NPC Le Directeur
    set(5, 24, TILE_NPC as TileId);
  }

  /* ============================================================ */
  /*  LE SIEGE SOCIAL (northeast, Lv10+) — rows 2-8, cols 33-44  */
  /* ============================================================ */
  if (playerLevel < 10) {
    fill(2, 33, 7, 12, TILE_LOCKED as TileId);
  } else {
    // Roof
    fill(2, 33, 1, 12, TILE_ROOF as TileId);
    // Walls + gold trim
    fill(3, 33, 5, 1, TILE_WALL as TileId);
    fill(3, 44, 5, 1, TILE_WALL as TileId);
    // Interior luxury floor
    fill(3, 34, 5, 10, TILE_FLOOR_LUXURY as TileId);
    // Door
    set(8, 38, TILE_DOOR as TileId);
    set(8, 39, TILE_DOOR as TileId);
    fill(8, 34, 1, 4, TILE_WALL as TileId);
    fill(8, 40, 1, 5, TILE_WALL as TileId);
    // Boardroom table
    set(5, 36, TILE_TABLE_ROUND as TileId);
    set(5, 37, TILE_TABLE_ROUND as TileId);
    set(5, 38, TILE_TABLE_ROUND as TileId);
    set(5, 39, TILE_TABLE_ROUND as TileId);
    set(5, 40, TILE_TABLE_ROUND as TileId);
    set(4, 36, TILE_CHAIR as TileId);
    set(4, 38, TILE_CHAIR as TileId);
    set(4, 40, TILE_CHAIR as TileId);
    set(6, 36, TILE_CHAIR as TileId);
    set(6, 38, TILE_CHAIR as TileId);
    set(6, 40, TILE_CHAIR as TileId);
    // Screen + plants
    set(3, 38, TILE_WHITEBOARD as TileId);
    set(3, 34, TILE_PLANT as TileId);
    set(3, 43, TILE_PLANT as TileId);
    set(7, 43, TILE_COUCH as TileId);
    // NPC Le CEO
    set(5, 38, TILE_NPC as TileId);
  }

  /* ============================================================ */
  /*  LE PENTHOUSE (far north, Lv13+) — rows 0-4, cols 38-47     */
  /* ============================================================ */
  if (playerLevel < 13) {
    fill(0, 38, 5, 10, TILE_LOCKED as TileId);
  } else {
    // Gold roof
    fill(0, 38, 1, 10, TILE_FLOOR_GOLD as TileId);
    // Walls
    fill(1, 38, 3, 1, TILE_WALL as TileId);
    fill(1, 47, 3, 1, TILE_WALL as TileId);
    // Interior gold floor
    fill(1, 39, 3, 8, TILE_FLOOR_GOLD as TileId);
    // Door
    set(4, 42, TILE_DOOR as TileId);
    set(4, 43, TILE_DOOR as TileId);
    fill(4, 39, 1, 3, TILE_WALL as TileId);
    fill(4, 44, 1, 4, TILE_WALL as TileId);
    // Bar + sky view
    set(1, 40, TILE_DESK as TileId);
    set(1, 41, TILE_DESK as TileId);
    set(1, 42, TILE_COFFEE as TileId);
    set(2, 45, TILE_COUCH as TileId);
    set(2, 46, TILE_COUCH as TileId);
    set(1, 45, TILE_PLANT as TileId);
    // NPC La Legende
    set(2, 42, TILE_NPC as TileId);
  }

  /* ============================================================ */
  /*  ZONE DE FARMING (south, rows 25-32, cols 10-25)             */
  /* ============================================================ */
  fill(25, 10, 8, 16, TILE_FARMING as TileId);
  // Barn
  set(25, 10, TILE_BARN as TileId);
  set(25, 11, TILE_BARN as TileId);
  set(26, 10, TILE_BARN as TileId);
  set(26, 11, TILE_BARN as TileId);
  // Signpost "Zone de Farming"
  set(24, 14, TILE_SIGNPOST as TileId);
  // Some scattered trees in farming
  set(27, 17, TILE_TREE as TileId);
  set(29, 22, TILE_TREE as TileId);
  set(31, 14, TILE_TREE as TileId);

  /* ---- Re-ensure NPC tiles are placed on top ---- */
  for (const npc of NPCS) {
    set(npc.row, npc.col, TILE_NPC as TileId);
  }

  return grid;
}

/* ================================================================== */
/*  Helpers                                                           */
/* ================================================================== */

function getZoneAt(row: number, col: number): ZoneRect | undefined {
  return ZONES.find(
    (z) =>
      row >= z.startRow &&
      row < z.startRow + z.rows &&
      col >= z.startCol &&
      col < z.startCol + z.cols,
  );
}

type Direction = 'up' | 'down' | 'left' | 'right';

const DIR_OFFSETS: Record<Direction, { dr: number; dc: number }> = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/* ================================================================== */
/*  Energy helper (reading from FarmingEncounter localStorage)         */
/* ================================================================== */

const ENERGY_KEY = 'ecs-game-farming-energy';

interface EnergyState {
  remaining: number;
  lastReset: string;
}

function getEnergy(prospectionStat: number): number {
  if (typeof window === 'undefined') return 10;
  try {
    const raw = localStorage.getItem(ENERGY_KEY);
    if (!raw) return 10 + Math.floor(prospectionStat / 2);
    const parsed = JSON.parse(raw) as EnergyState;
    const today = new Date().toDateString();
    if (parsed.lastReset !== today) return 10 + Math.floor(prospectionStat / 2);
    return parsed.remaining;
  } catch {
    return 10 + Math.floor(prospectionStat / 2);
  }
}

/* ================================================================== */
/*  CSS-only tile renderer                                            */
/* ================================================================== */

interface TileRendererProps {
  tileId: TileId;
  row: number;
  col: number;
  isNPCTile: boolean;
  npcName?: string;
  animTick: number;
}

function TileRenderer({ tileId, row, col, isNPCTile, npcName, animTick }: TileRendererProps) {
  const config = TILE_CONFIG[tileId];
  const isGrass = tileId === TILE_GRASS;
  const isFlowers = tileId === TILE_FLOWERS;
  const isWater = tileId === TILE_WATER;
  const isFarming = tileId === TILE_FARMING;
  const isDesk = tileId === TILE_DESK;
  const isDoor = tileId === TILE_DOOR;
  const isLocked = tileId === TILE_LOCKED;
  const isTree = tileId === TILE_TREE;
  const isStreetlight = tileId === TILE_STREETLIGHT;
  const isFountain = tileId === TILE_FOUNTAIN;
  const isComputer = tileId === TILE_COMPUTER;
  const isPlant = tileId === TILE_PLANT;
  const isCoffee = tileId === TILE_COFFEE;
  const isWhiteboard = tileId === TILE_WHITEBOARD;
  const isPhone = tileId === TILE_PHONE;
  const isCouch = tileId === TILE_COUCH;
  const isTableRound = tileId === TILE_TABLE_ROUND;
  const isChair = tileId === TILE_CHAIR;
  const isBookshelf = tileId === TILE_BOOKSHELF;
  const isBench = tileId === TILE_BENCH;
  const isCar = tileId === TILE_CAR;
  const isSignpost = tileId === TILE_SIGNPOST;
  const isBarn = tileId === TILE_BARN;
  const isRoof = tileId === TILE_ROOF;
  const isFloorGold = tileId === TILE_FLOOR_GOLD;

  const bgColor = isNPCTile ? TILE_CONFIG[TILE_FLOOR_OFFICE].bg : config.bg;

  // Grass darker dot pattern
  const hasDot = (row * 3 + col * 7) % 5 === 0;
  // Water shimmer offset
  const shimmerOffset = ((col + animTick) % 3) * 4;

  return (
    <div
      className="relative pixel-art"
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        backgroundColor: bgColor,
      }}
    >
      {/* Grass darker dots */}
      {(isGrass || isFlowers) && hasDot && (
        <div
          className="absolute rounded-full"
          style={{
            width: 3,
            height: 3,
            backgroundColor: '#6AB840',
            top: ((row * 11 + col * 3) % 20) + 4,
            left: ((col * 7 + row * 5) % 22) + 4,
          }}
        />
      )}

      {/* Flower colored dots */}
      {isFlowers && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: 4, height: 4,
              backgroundColor: ['#FF69B4', '#FFEB3B', '#E040FB', '#FF5722'][(row + col) % 4],
              top: 6, left: 10,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 3, height: 3,
              backgroundColor: ['#FFEB3B', '#FF69B4', '#FF5722', '#E040FB'][(row + col) % 4],
              top: 18, left: 22,
            }}
          />
        </>
      )}

      {/* Water animated shimmer */}
      {isWater && (
        <>
          <div
            className="absolute"
            style={{
              width: 8, height: 2,
              backgroundColor: '#5BA0E9',
              top: 10 + shimmerOffset, left: 4,
              opacity: 0.6,
              borderRadius: 1,
            }}
          />
          <div
            className="absolute"
            style={{
              width: 6, height: 2,
              backgroundColor: '#6BB8F7',
              top: 20 - shimmerOffset, left: 18,
              opacity: 0.5,
              borderRadius: 1,
            }}
          />
        </>
      )}

      {/* Farming grass — tall blades with sway */}
      {isFarming && (
        <>
          <div
            className="absolute"
            style={{
              width: 2, height: 14,
              backgroundColor: '#2E6B1B',
              top: 2,
              left: 6 + (animTick % 2),
              transform: `rotate(${animTick % 2 === 0 ? -3 : 3}deg)`,
              transformOrigin: 'bottom center',
              transition: 'transform 0.8s ease-in-out',
            }}
          />
          <div
            className="absolute"
            style={{
              width: 2, height: 16,
              backgroundColor: '#1B5E0A',
              top: 0,
              left: 15 - (animTick % 2),
              transform: `rotate(${animTick % 2 === 0 ? 4 : -4}deg)`,
              transformOrigin: 'bottom center',
              transition: 'transform 0.8s ease-in-out',
            }}
          />
          <div
            className="absolute"
            style={{
              width: 2, height: 12,
              backgroundColor: '#3D7A2A',
              top: 4,
              left: 24 + (animTick % 2),
              transform: `rotate(${animTick % 2 === 0 ? -2 : 2}deg)`,
              transformOrigin: 'bottom center',
              transition: 'transform 0.8s ease-in-out',
            }}
          />
        </>
      )}

      {/* Desk — brown rectangle + blue screen glow */}
      {isDesk && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 24, height: 16, backgroundColor: '#8B6914', border: '1px solid #6D4C11', position: 'relative' }}>
            <div style={{ width: 14, height: 8, backgroundColor: '#4DD0E1', margin: '2px auto 0', boxShadow: '0 0 4px rgba(77,208,225,0.4)' }} />
          </div>
        </div>
      )}

      {/* Computer — screen with glow flicker */}
      {isComputer && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 18, height: 20, position: 'relative' }}>
            <div style={{
              width: 16, height: 12,
              backgroundColor: animTick % 3 === 0 ? '#1A73E8' : '#1565C0',
              border: '2px solid #333',
              boxShadow: `0 0 6px rgba(26,115,232,${animTick % 3 === 0 ? 0.5 : 0.3})`,
            }} />
            <div style={{ width: 6, height: 4, backgroundColor: '#555', margin: '0 auto' }} />
            <div style={{ width: 12, height: 2, backgroundColor: '#444', margin: '0 auto' }} />
          </div>
        </div>
      )}

      {/* Chair */}
      {isChair && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 14, height: 14, backgroundColor: '#5D4037', borderRadius: 2, border: '1px solid #3E2723' }}>
            <div style={{ width: 10, height: 10, backgroundColor: '#795548', margin: '2px auto', borderRadius: 1 }} />
          </div>
        </div>
      )}

      {/* Plant — green on brown pot */}
      {isPlant && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ position: 'relative', width: 16, height: 24 }}>
            <div style={{ width: 12, height: 12, backgroundColor: '#4CAF50', borderRadius: '50%', position: 'absolute', top: 0, left: 2, boxShadow: '2px 2px 0 #388E3C' }} />
            <div style={{ width: 8, height: 10, backgroundColor: '#795548', position: 'absolute', bottom: 0, left: 4, border: '1px solid #5D4037' }} />
          </div>
        </div>
      )}

      {/* Bookshelf */}
      {isBookshelf && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 24, height: 26, backgroundColor: '#6D4C41', border: '1px solid #4E342E', position: 'relative' }}>
            <div style={{ width: 20, height: 5, backgroundColor: '#E53935', margin: '2px auto 0' }} />
            <div style={{ width: 20, height: 1, backgroundColor: '#4E342E', margin: '0 auto' }} />
            <div style={{ width: 20, height: 5, backgroundColor: '#1E88E5', margin: '1px auto 0' }} />
            <div style={{ width: 20, height: 1, backgroundColor: '#4E342E', margin: '0 auto' }} />
            <div style={{ width: 20, height: 5, backgroundColor: '#43A047', margin: '1px auto 0' }} />
          </div>
        </div>
      )}

      {/* Coffee machine */}
      {isCoffee && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 16, height: 22, backgroundColor: '#5D4037', border: '1px solid #3E2723', position: 'relative' }}>
            <div style={{ width: 10, height: 6, backgroundColor: '#333', margin: '3px auto 0' }} />
            <div style={{ width: 8, height: 4, backgroundColor: '#6F4E37', margin: '2px auto 0', borderRadius: 1 }} />
          </div>
        </div>
      )}

      {/* Whiteboard */}
      {isWhiteboard && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 26, height: 20, backgroundColor: '#FAFAFA', border: '2px solid #BDBDBD', position: 'relative' }}>
            <div style={{ width: 14, height: 2, backgroundColor: '#1565C0', position: 'absolute', top: 4, left: 4 }} />
            <div style={{ width: 10, height: 2, backgroundColor: '#E53935', position: 'absolute', top: 9, left: 4 }} />
            <div style={{ width: 16, height: 2, backgroundColor: '#43A047', position: 'absolute', top: 14, left: 4 }} />
          </div>
        </div>
      )}

      {/* Phone */}
      {isPhone && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 12, height: 18, backgroundColor: '#37474F', border: '1px solid #263238', borderRadius: 2, position: 'relative' }}>
            <div style={{ width: 8, height: 10, backgroundColor: '#4FC3F7', margin: '2px auto 0', borderRadius: 1 }} />
            <div style={{ width: 4, height: 4, backgroundColor: '#546E7A', margin: '1px auto 0', borderRadius: '50%' }} />
          </div>
        </div>
      )}

      {/* Couch */}
      {isCouch && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 28, height: 16, backgroundColor: '#8B0000', border: '1px solid #5B0000', borderRadius: 3, position: 'relative' }}>
            <div style={{ width: 24, height: 10, backgroundColor: '#A52A2A', margin: '2px auto 0', borderRadius: 2 }} />
          </div>
        </div>
      )}

      {/* Round table */}
      {isTableRound && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 22, height: 22, backgroundColor: '#A0522D', borderRadius: '50%', border: '2px solid #8B4513', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }} />
        </div>
      )}

      {/* Streetlight — pole + yellow glow */}
      {isStreetlight && (
        <div className="absolute inset-0 flex items-end justify-center">
          <div style={{ position: 'relative', width: 6, height: 28 }}>
            <div style={{ width: 4, height: 22, backgroundColor: '#616161', margin: '0 auto', position: 'absolute', bottom: 0, left: 1 }} />
            <div
              style={{
                width: 10, height: 10,
                backgroundColor: '#FFE082',
                borderRadius: '50%',
                position: 'absolute',
                top: 0, left: -2,
                boxShadow: `0 0 ${animTick % 2 === 0 ? 8 : 12}px rgba(255,224,130,${animTick % 2 === 0 ? 0.5 : 0.7})`,
              }}
            />
          </div>
        </div>
      )}

      {/* Tree — trunk + green canopy */}
      {isTree && (
        <div className="absolute inset-0 flex items-end justify-center">
          <div style={{ position: 'relative', width: 20, height: 30 }}>
            <div
              style={{
                width: 22, height: 18,
                backgroundColor: '#2E7D32',
                borderRadius: '50%',
                position: 'absolute',
                top: 0, left: -1,
                boxShadow: '2px 2px 0 #1B5E20',
                transform: `rotate(${animTick % 2 === 0 ? -1 : 1}deg)`,
                transition: 'transform 1.5s ease-in-out',
              }}
            />
            <div style={{ width: 6, height: 12, backgroundColor: '#5D4037', position: 'absolute', bottom: 0, left: 7 }} />
          </div>
        </div>
      )}

      {/* Bench */}
      {isBench && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 26, height: 12, position: 'relative' }}>
            <div style={{ width: 26, height: 6, backgroundColor: '#6D4C41', borderRadius: 1 }} />
            <div style={{ width: 4, height: 6, backgroundColor: '#5D4037', position: 'absolute', bottom: 0, left: 2 }} />
            <div style={{ width: 4, height: 6, backgroundColor: '#5D4037', position: 'absolute', bottom: 0, right: 2 }} />
          </div>
        </div>
      )}

      {/* Car */}
      {isCar && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ position: 'relative', width: 28, height: 18 }}>
            <div style={{
              width: 28, height: 12,
              backgroundColor: ['#1565C0', '#E53935', '#FFB300', '#43A047'][(row + col) % 4],
              borderRadius: 3,
              position: 'absolute', bottom: 0,
            }} />
            <div style={{
              width: 18, height: 8,
              backgroundColor: ['#1976D2', '#EF5350', '#FFC107', '#66BB6A'][(row + col) % 4],
              borderRadius: '3px 3px 0 0',
              position: 'absolute', top: 0, left: 5,
            }} />
            <div style={{ width: 4, height: 4, backgroundColor: '#333', borderRadius: '50%', position: 'absolute', bottom: -1, left: 3 }} />
            <div style={{ width: 4, height: 4, backgroundColor: '#333', borderRadius: '50%', position: 'absolute', bottom: -1, right: 3 }} />
          </div>
        </div>
      )}

      {/* Sign post */}
      {isSignpost && (
        <div className="absolute inset-0 flex items-end justify-center">
          <div style={{ position: 'relative', width: 20, height: 28 }}>
            <div style={{ width: 20, height: 12, backgroundColor: '#795548', border: '1px solid #5D4037', position: 'absolute', top: 2, borderRadius: 2 }}>
              <div style={{ width: 12, height: 2, backgroundColor: '#FAFAFA', margin: '3px auto 0', opacity: 0.7 }} />
              <div style={{ width: 8, height: 2, backgroundColor: '#FAFAFA', margin: '2px auto 0', opacity: 0.5 }} />
            </div>
            <div style={{ width: 4, height: 14, backgroundColor: '#5D4037', position: 'absolute', bottom: 0, left: 8 }} />
          </div>
        </div>
      )}

      {/* Barn */}
      {isBarn && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 28, height: 26, position: 'relative' }}>
            <div style={{ width: 28, height: 6, backgroundColor: '#8B4513', clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} />
            <div style={{ width: 28, height: 18, backgroundColor: '#A0522D', border: '1px solid #8B4513', position: 'absolute', bottom: 0 }}>
              <div style={{ width: 8, height: 12, backgroundColor: '#6D4C41', margin: '6px auto 0', border: '1px solid #5D4037' }} />
            </div>
          </div>
        </div>
      )}

      {/* Fountain — animated water */}
      {isFountain && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 26, height: 26, position: 'relative' }}>
            <div style={{ width: 26, height: 26, backgroundColor: '#90CAF9', borderRadius: '50%', border: '3px solid #78909C' }} />
            <div style={{
              width: 4, height: animTick % 2 === 0 ? 10 : 12,
              backgroundColor: '#42A5F5',
              position: 'absolute',
              bottom: animTick % 2 === 0 ? 14 : 12,
              left: 11,
              borderRadius: 2,
              opacity: 0.8,
              transition: 'height 0.6s ease, bottom 0.6s ease',
            }} />
          </div>
        </div>
      )}

      {/* Roof tile */}
      {isRoof && (
        <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(90deg, #CC6644 0px, #CC6644 6px, #BB5533 6px, #BB5533 8px)' }} />
      )}

      {/* Door — brown door with gold handle */}
      {isDoor && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: 22, height: 28, backgroundColor: '#8B4513', border: '2px solid #6D3610', borderRadius: '4px 4px 0 0', position: 'relative' }}>
            <div style={{ width: 4, height: 4, backgroundColor: '#FFD700', borderRadius: '50%', position: 'absolute', top: 12, right: 3, boxShadow: '0 0 3px rgba(255,215,0,0.5)' }} />
          </div>
        </div>
      )}

      {/* Gold floor trim */}
      {isFloorGold && (
        <div className="absolute inset-0 pointer-events-none" style={{ borderBottom: '1px solid #FFD700', borderRight: '1px solid #FFD700', opacity: 0.4 }} />
      )}

      {/* Locked zone overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          {(row + col) % 7 === 0 && (
            <span className="text-[10px] opacity-50" style={{ filter: 'grayscale(1)' }}>&#x1F512;</span>
          )}
        </div>
      )}

      {/* NPC exclamation mark */}
      {isNPCTile && npcName && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap z-20 flex flex-col items-center">
          <span className="font-pixel text-[10px] text-red-400 animate-bounce leading-none">&#x2757;</span>
          <span className="font-pixel text-[6px] text-ecs-amber bg-black/80 px-1 py-0.5 rounded-sm mt-0.5">
            {npcName}
          </span>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Virtual Joystick (mobile)                                         */
/* ================================================================== */

interface JoystickProps {
  onMove: (dir: Direction) => void;
  onInteract: () => void;
}

function VirtualJoystick({ onMove, onInteract }: JoystickProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startMove = useCallback((dir: Direction) => {
    onMove(dir);
    intervalRef.current = setInterval(() => onMove(dir), 180);
  }, [onMove]);

  const stopMove = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const btnClass = 'w-11 h-11 bg-black/40 border border-white/20 flex items-center justify-center font-pixel text-[14px] text-white/80 active:bg-white/20 rounded-md select-none';

  return (
    <div className="flex items-center gap-6 mt-4 md:hidden">
      <div className="grid grid-cols-3 gap-1" style={{ width: 132 }}>
        <div />
        <button
          type="button"
          className={btnClass}
          onTouchStart={() => startMove('up')}
          onTouchEnd={stopMove}
          onMouseDown={() => startMove('up')}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
          aria-label="Haut"
        >
          {'\u25B2'}
        </button>
        <div />
        <button
          type="button"
          className={btnClass}
          onTouchStart={() => startMove('left')}
          onTouchEnd={stopMove}
          onMouseDown={() => startMove('left')}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
          aria-label="Gauche"
        >
          {'\u25C0'}
        </button>
        <button
          type="button"
          className="w-11 h-11 bg-ecs-amber/30 border border-ecs-amber/50 flex items-center justify-center font-pixel text-[10px] text-ecs-amber active:bg-ecs-amber/40 rounded-md select-none"
          onClick={onInteract}
          aria-label="Interagir"
        >
          OK
        </button>
        <button
          type="button"
          className={btnClass}
          onTouchStart={() => startMove('right')}
          onTouchEnd={stopMove}
          onMouseDown={() => startMove('right')}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
          aria-label="Droite"
        >
          {'\u25B6'}
        </button>
        <div />
        <button
          type="button"
          className={btnClass}
          onTouchStart={() => startMove('down')}
          onTouchEnd={stopMove}
          onMouseDown={() => startMove('down')}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
          aria-label="Bas"
        >
          {'\u25BC'}
        </button>
        <div />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Props                                                             */
/* ================================================================== */

interface WorldClientProps {
  userId: string;
  level: number;
  totalXP: number;
  businessType: string;
  fullName: string;
}

/* ================================================================== */
/*  Main Component                                                    */
/* ================================================================== */

export default function WorldClient({ userId, level, totalXP, businessType, fullName }: WorldClientProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const setPlayer = usePlayerStore((s) => s.setPlayer);
  const storeLevel = usePlayerStore((s) => s.level);
  const stats = usePlayerStore((s) => s.stats);

  // Init store
  useEffect(() => {
    setPlayer({ level, totalXP, currentStreak: 0 });
  }, [level, totalXP, setPlayer]);

  const avatarVariant = useMemo(() => (hashCode(userId) % 8) + 1, [userId]);
  const xpForNextLevel = useMemo(() => level * 150, [level]);
  const currentXpInLevel = useMemo(() => totalXP % (level * 150), [totalXP, level]);
  const effectiveLevel = storeLevel || level;

  // Map data
  const grid = useMemo(() => buildMap(effectiveLevel), [effectiveLevel]);

  // Player position (spawn in central plaza)
  const [playerRow, setPlayerRow] = useState(18);
  const [playerCol, setPlayerCol] = useState(23);
  const [facing, setFacing] = useState<Direction>('down');
  const [isWalking, setIsWalking] = useState(false);
  const walkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation tick for ambient effects
  const [animTick, setAnimTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setAnimTick((t) => (t + 1) % 100), 800);
    return () => clearInterval(timer);
  }, []);

  // Dialog state
  const [activeDialog, setActiveDialog] = useState<{ speaker: string; text: string; avatarVariant?: number }[] | null>(null);

  // Farming state
  const [showFarming, setShowFarming] = useState(false);
  const farmingCooldownRef = useRef(false);

  // Notebook state
  const [showNotebook, setShowNotebook] = useState(false);

  // Fake player profile popup
  const [selectedFakePlayer, setSelectedFakePlayer] = useState<FakePlayer | null>(null);

  // Door prompt
  const [doorPrompt, setDoorPrompt] = useState<{ row: number; col: number } | null>(null);

  // Current zone display
  const currentZone = useMemo(() => getZoneAt(playerRow, playerCol), [playerRow, playerCol]);

  // Energy for HUD
  const currentEnergy = useMemo(() => getEnergy(stats.prospection), [stats.prospection, animTick]); // eslint-disable-line react-hooks/exhaustive-deps

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

  /* ---- Viewport calculation ---- */

  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ cols: 18, rows: 14 });

  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      setViewportSize({
        cols: Math.max(10, Math.min(MAP_COLS, Math.floor(w / TILE_SIZE))),
        rows: Math.max(8, Math.min(MAP_ROWS, Math.floor(h / TILE_SIZE))),
      });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const VIEWPORT_COLS = viewportSize.cols;
  const VIEWPORT_ROWS = viewportSize.rows;

  /* ---- Movement ---- */

  const canMoveTo = useCallback(
    (row: number, col: number): boolean => {
      if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return false;
      const tile = grid[row][col];
      return TILE_CONFIG[tile].walkable;
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

      // Check if on a door tile -> show door prompt
      const newTile = grid[newRow][newCol];
      if (newTile === TILE_DOOR) {
        setDoorPrompt({ row: newRow, col: newCol });
      } else {
        setDoorPrompt(null);
      }

      // Check farming encounter
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
        let bestDialogue = npc.dialogues[0];
        for (const d of npc.dialogues) {
          if (effectiveLevel >= d.minLevel) {
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

    // Check if on or near sign/signpost
    const adjacentTiles = checkPositions.map((p) =>
      p.r >= 0 && p.r < MAP_ROWS && p.c >= 0 && p.c < MAP_COLS ? grid[p.r][p.c] : null,
    );

    if (adjacentTiles.includes(TILE_SIGNPOST) || adjacentTiles.includes(TILE_SIGN)) {
      const zone = getZoneAt(playerRow, playerCol);
      if (zone?.id === 'plaza') {
        setActiveDialog([
          { speaker: 'Panneau', text: 'Bienvenue \u00e0 Scale Corp City !' },
          { speaker: 'Panneau', text: "Explore les b\u00e2timents, parle aux PNJ et farm des leads au sud !" },
        ]);
      } else if (zone?.id === 'farming') {
        setActiveDialog([
          { speaker: 'Panneau', text: 'Zone de Farming \u2014 R\u00e9colte des leads' },
          { speaker: 'Panneau', text: "Marche dans l'herbe haute pour trouver des leads !" },
        ]);
      } else {
        setActiveDialog([
          { speaker: 'Panneau', text: 'Scale Corp City' },
          { speaker: 'Panneau', text: "Chaque b\u00e2timent cache des opportunit\u00e9s. Continue d'explorer !" },
        ]);
      }
    }
  }, [playerRow, playerCol, activeDialog, showFarming, npcMap, fakePlayerMap, grid, effectiveLevel]);

  /* ---- Keyboard handling ---- */

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }

      if (activeDialog) return;

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
          setShowNotebook((prev) => !prev);
          break;
        case 'Escape':
          setSelectedFakePlayer(null);
          setDoorPrompt(null);
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
        let bestDialogue = npc.dialogues[0];
        for (const d of npc.dialogues) {
          if (effectiveLevel >= d.minLevel) {
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
    [activeDialog, showFarming, showNotebook, npcMap, fakePlayerMap, playerRow, playerCol, movePlayer, effectiveLevel],
  );

  /* ---- Camera offset (smooth follow) ---- */

  const cameraOffsetRow = useMemo(() => {
    const half = Math.floor(VIEWPORT_ROWS / 2);
    return Math.max(0, Math.min(playerRow - half, MAP_ROWS - VIEWPORT_ROWS));
  }, [playerRow, VIEWPORT_ROWS]);

  const cameraOffsetCol = useMemo(() => {
    const half = Math.floor(VIEWPORT_COLS / 2);
    return Math.max(0, Math.min(playerCol - half, MAP_COLS - VIEWPORT_COLS));
  }, [playerCol, VIEWPORT_COLS]);

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
  }, [cameraOffsetRow, cameraOffsetCol, grid, npcMap, VIEWPORT_ROWS, VIEWPORT_COLS]);

  const visibleNPCs = useMemo(() => {
    return NPCS.filter(
      (npc) =>
        npc.row >= cameraOffsetRow &&
        npc.row < cameraOffsetRow + VIEWPORT_ROWS &&
        npc.col >= cameraOffsetCol &&
        npc.col < cameraOffsetCol + VIEWPORT_COLS,
    );
  }, [cameraOffsetRow, cameraOffsetCol, VIEWPORT_ROWS, VIEWPORT_COLS]);

  const visibleFakePlayers = useMemo(() => {
    return FAKE_PLAYERS.filter(
      (fp) =>
        fp.row >= cameraOffsetRow &&
        fp.row < cameraOffsetRow + VIEWPORT_ROWS &&
        fp.col >= cameraOffsetCol &&
        fp.col < cameraOffsetCol + VIEWPORT_COLS,
    );
  }, [cameraOffsetRow, cameraOffsetCol, VIEWPORT_ROWS, VIEWPORT_COLS]);

  /* ---- Farming encounter close ---- */

  const handleFarmingClose = useCallback(() => {
    setShowFarming(false);
    setTimeout(() => {
      farmingCooldownRef.current = false;
    }, 2000);
  }, []);

  /* ---- Online count (static display) ---- */
  const onlineCount = FAKE_PLAYERS.length + 1;

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ecs-black">
      {/* ---- Loading screen ---- */}
      {!mounted && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-ecs-black">
          <div className="font-pixel text-ecs-amber text-sm mb-4 animate-pulse">Chargement du monde...</div>
          <div className="w-48 h-2 bg-ecs-gray-dark rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-ecs-amber to-ecs-orange rounded-full animate-[shimmer-sweep_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
          </div>
        </div>
      )}
      {/* ---- HUD TOP (fixed overlay) ---- */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/60 border-b border-white/10 backdrop-blur-sm z-30">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="font-pixel text-[8px] text-white/60 border border-white/20 px-2 py-1 hover:bg-white/10 transition-colors rounded-sm"
          >
            {'<'} Retour
          </a>
          <span className="font-pixel text-[10px] text-ecs-amber">
            {currentZone?.name ?? 'Scale Corp City'}
          </span>
          <div className="w-32">
            <PixelBar
              label="XP"
              current={currentXpInLevel}
              max={xpForNextLevel}
              size="sm"
              color="xp"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-pixel text-[8px] text-green-400">
            {'\u26A1'} {currentEnergy}
          </span>
          <span className="font-pixel text-[8px] text-white/50">
            Nv.{effectiveLevel}
          </span>
          <button
            type="button"
            onClick={() => setShowNotebook(true)}
            className="font-pixel text-[8px] text-ecs-amber border border-ecs-amber/30 px-2 py-0.5 hover:bg-ecs-amber/10 transition-colors rounded-sm"
          >
            Carnet (F)
          </button>
        </div>
      </div>

      {/* ---- MAP VIEWPORT ---- */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden bg-[#5AA03C]"
        style={{ imageRendering: 'pixelated' }}
        tabIndex={0}
        role="application"
        aria-label="Carte de Scale Corp City"
      >
        {/* Camera wrapper with smooth transition */}
        <div
          className="absolute"
          style={{
            width: MAP_COLS * TILE_SIZE,
            height: MAP_ROWS * TILE_SIZE,
            transform: `translate(${-cameraOffsetCol * TILE_SIZE}px, ${-cameraOffsetRow * TILE_SIZE}px)`,
            transition: 'transform 200ms ease-out',
          }}
        >
          {/* Tile grid */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${MAP_COLS}, ${TILE_SIZE}px)`,
              gridTemplateRows: `repeat(${MAP_ROWS}, ${TILE_SIZE}px)`,
            }}
          >
            {/* Only render visible tiles + buffer */}
            {Array.from({ length: MAP_ROWS * MAP_COLS }).map((_, idx) => {
              const row = Math.floor(idx / MAP_COLS);
              const col = idx % MAP_COLS;

              // Frustum culling: only render tiles near the viewport
              const buffer = 3;
              if (
                row < cameraOffsetRow - buffer ||
                row >= cameraOffsetRow + VIEWPORT_ROWS + buffer ||
                col < cameraOffsetCol - buffer ||
                col >= cameraOffsetCol + VIEWPORT_COLS + buffer
              ) {
                return (
                  <div
                    key={`${row}-${col}`}
                    style={{ width: TILE_SIZE, height: TILE_SIZE, backgroundColor: '#5AA03C' }}
                  />
                );
              }

              const tileId = grid[row][col];
              const key = `${row}-${col}`;
              const npc = npcMap.get(key);

              return (
                <button
                  key={key}
                  type="button"
                  className="p-0 border-0 cursor-pointer"
                  onClick={() => handleTileClick(row, col)}
                  aria-label={`Tuile ${row},${col}`}
                  tabIndex={-1}
                >
                  <TileRenderer
                    tileId={tileId}
                    row={row}
                    col={col}
                    isNPCTile={tileId === TILE_NPC}
                    npcName={npc?.name}
                    animTick={animTick}
                  />
                </button>
              );
            })}
          </div>

          {/* NPC avatars */}
          {visibleNPCs.map((npc) => (
            <div
              key={npc.id}
              className="absolute z-10 pointer-events-none"
              style={{
                left: npc.col * TILE_SIZE + TILE_SIZE / 2 - 8,
                top: npc.row * TILE_SIZE + TILE_SIZE / 2 - 20,
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
                left: fp.col * TILE_SIZE + TILE_SIZE / 2 - 8,
                top: fp.row * TILE_SIZE + TILE_SIZE / 2 - 20,
              }}
            >
              <button
                type="button"
                className="relative"
                onClick={() => setSelectedFakePlayer(fp)}
                aria-label={`Joueur: ${fp.name}`}
              >
                <PixelAvatar variant={fp.variant} size="sm" level={fp.level} />
                {/* Name label */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="font-pixel text-[6px] text-white bg-black/60 px-1 py-0.5 rounded-sm">
                    {fp.name}
                  </span>
                </div>
                {/* Shadow */}
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full"
                  style={{ width: 16, height: 4, backgroundColor: 'rgba(0,0,0,0.2)' }}
                />
              </button>
            </div>
          ))}

          {/* Player character */}
          <div
            className="absolute z-20"
            style={{
              left: playerCol * TILE_SIZE + TILE_SIZE / 2 - 8,
              top: playerRow * TILE_SIZE + TILE_SIZE / 2 - 20,
              transition: 'left 150ms ease-out, top 150ms ease-out',
            }}
          >
            <div className="relative">
              {/* Player shadow */}
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full"
                style={{ width: 18, height: 5, backgroundColor: 'rgba(0,0,0,0.25)' }}
              />
              <PixelAvatar
                variant={avatarVariant}
                size="sm"
                level={effectiveLevel}
                walking={isWalking}
              />
              {/* Player name label */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="font-pixel text-[6px] text-ecs-amber bg-black/80 px-1.5 py-0.5 rounded-sm border border-ecs-amber/30">
                  {fullName.split(' ')[0]}
                </span>
              </div>
              {/* Direction indicator */}
              <div
                className="absolute w-0 h-0 pointer-events-none"
                style={{
                  ...(facing === 'down' && { bottom: -4, left: '50%', transform: 'translateX(-50%)', borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderTop: '4px solid #FFBF00' }),
                  ...(facing === 'up' && { top: -8, left: '50%', transform: 'translateX(-50%)', borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderBottom: '4px solid #FFBF00' }),
                  ...(facing === 'left' && { left: -4, top: '50%', transform: 'translateY(-50%)', borderTop: '3px solid transparent', borderBottom: '3px solid transparent', borderRight: '4px solid #FFBF00' }),
                  ...(facing === 'right' && { right: -4, top: '50%', transform: 'translateY(-50%)', borderTop: '3px solid transparent', borderBottom: '3px solid transparent', borderLeft: '4px solid #FFBF00' }),
                }}
              />
            </div>
          </div>
        </div>

        {/* ---- Door prompt overlay ---- */}
        <AnimatePresence>
          {doorPrompt && !activeDialog && !showFarming && (
            <motion.div
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="font-pixel text-[9px] text-white bg-black/80 border border-ecs-amber/40 px-3 py-1.5 rounded-sm">
                Espace pour entrer
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Dialog overlay ---- */}
        <AnimatePresence>
          {activeDialog && (
            <div className="absolute bottom-0 left-0 right-0 z-40 p-3">
              <PixelDialog
                messages={activeDialog}
                onComplete={() => setActiveDialog(null)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* ---- Fake player profile popup ---- */}
        <AnimatePresence>
          {selectedFakePlayer && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#1a1a2e] border-2 border-ecs-amber/50 p-4 pixel-art rounded-md"
              style={{ minWidth: 200 }}
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
              <div className="font-pixel text-[7px] text-green-400 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                En ligne
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- HUD BOTTOM ---- */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/60 border-t border-white/10 backdrop-blur-sm z-30">
        <span className="font-pixel text-[7px] text-white/40 hidden md:inline">
          WASD/Fl\u00e8ches: D\u00e9placer &bull; Espace: Interagir &bull; F: Carnet de Leads
        </span>
        <span className="font-pixel text-[7px] text-white/40 md:hidden">
          {fullName.split(' ')[0]} &bull; {businessType}
        </span>
        <div className="flex items-center gap-2">
          {currentZone?.id === 'farming' && (
            <span className="font-pixel text-[7px] text-green-400 animate-pulse">
              Zone de Farming
            </span>
          )}
          <span className="font-pixel text-[7px] text-white/30 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
            {onlineCount} en ligne
          </span>
        </div>
      </div>

      {/* ---- Mobile joystick ---- */}
      <div className="flex justify-center bg-black/40 py-2 md:hidden">
        <VirtualJoystick onMove={movePlayer} onInteract={interactWithNearby} />
      </div>

      {/* ---- Farming encounter overlay ---- */}
      <AnimatePresence>
        {showFarming && (
          <FarmingEncounter
            playerLevel={effectiveLevel}
            businessType={businessType}
            onClose={handleFarmingClose}
          />
        )}
      </AnimatePresence>

      {/* ---- Lead notebook modal ---- */}
      <AnimatePresence>
        {showNotebook && (
          <LeadNotebook onClose={() => setShowNotebook(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
