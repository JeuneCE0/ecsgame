'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type PixelAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface PixelAvatarProps {
  variant: number;
  size?: PixelAvatarSize;
  level?: number;
  walking?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Pixel data: [x, y, color]                                          */
/* ------------------------------------------------------------------ */

type PixelDef = [number, number, string];

interface CharacterColors {
  hair: string;
  skin: string;
  shirt: string;
  pants: string;
  shoes: string;
  outline: string;
}

const CHARACTER_PALETTES: CharacterColors[] = [
  // 1: Brown hair, light skin, blue shirt
  { hair: '#8B4513', skin: '#FDBCB4', shirt: '#4169E1', pants: '#1A1A2E', shoes: '#333333', outline: '#1A1A1A' },
  // 2: Blonde, light skin, green shirt
  { hair: '#FFD700', skin: '#FDBCB4', shirt: '#228B22', pants: '#2C2C3E', shoes: '#444444', outline: '#1A1A1A' },
  // 3: Black hair, medium skin, red shirt
  { hair: '#1A1A2E', skin: '#D2A679', shirt: '#DC143C', pants: '#1A1A2E', shoes: '#333333', outline: '#1A1A1A' },
  // 4: Red hair, pale skin, purple shirt
  { hair: '#CC3300', skin: '#FFE0D0', shirt: '#8B008B', pants: '#2C2C3E', shoes: '#444444', outline: '#1A1A1A' },
  // 5: Blue hair, light skin, amber shirt
  { hair: '#0066CC', skin: '#FDBCB4', shirt: '#FFBF00', pants: '#1A1A2E', shoes: '#333333', outline: '#1A1A1A' },
  // 6: White hair, dark skin, orange shirt
  { hair: '#E0E0E0', skin: '#8D5524', shirt: '#FF6600', pants: '#2C2C3E', shoes: '#444444', outline: '#1A1A1A' },
  // 7: Green hair, medium skin, pink shirt
  { hair: '#00AA44', skin: '#C68642', shirt: '#FF69B4', pants: '#1A1A2E', shoes: '#333333', outline: '#1A1A1A' },
  // 8: Purple hair, light skin, teal shirt
  { hair: '#9933CC', skin: '#FDBCB4', shirt: '#008080', pants: '#2C2C3E', shoes: '#444444', outline: '#1A1A1A' },
];

function buildCharacterPixels(colors: CharacterColors): PixelDef[] {
  const { hair, skin, shirt, pants, shoes, outline } = colors;
  return [
    // Hair (top of head) — row 0-1
    [3, 0, hair], [4, 0, hair], [5, 0, hair], [6, 0, hair],
    [2, 1, hair], [3, 1, hair], [4, 1, hair], [5, 1, hair], [6, 1, hair], [7, 1, hair],
    // Hair sides + face — row 2
    [2, 2, hair], [3, 2, skin], [4, 2, skin], [5, 2, skin], [6, 2, skin], [7, 2, hair],
    // Face — row 3 (eyes)
    [2, 3, hair], [3, 3, skin], [4, 3, outline], [5, 3, skin], [6, 3, outline], [7, 3, hair],
    // Face — row 4 (mouth)
    [2, 4, hair], [3, 4, skin], [4, 4, skin], [5, 4, '#CC6666'], [6, 4, skin], [7, 4, hair],
    // Neck — row 5
    [4, 5, skin], [5, 5, skin],
    // Shirt — row 6-8
    [2, 6, shirt], [3, 6, shirt], [4, 6, shirt], [5, 6, shirt], [6, 6, shirt], [7, 6, shirt],
    [1, 7, shirt], [2, 7, shirt], [3, 7, shirt], [4, 7, shirt], [5, 7, shirt], [6, 7, shirt], [7, 7, shirt], [8, 7, shirt],
    [1, 8, skin], [2, 8, shirt], [3, 8, shirt], [4, 8, shirt], [5, 8, shirt], [6, 8, shirt], [7, 8, shirt], [8, 8, skin],
    // Pants — row 9-10
    [3, 9, pants], [4, 9, pants], [5, 9, pants], [6, 9, pants],
    [3, 10, pants], [4, 10, pants], [5, 10, pants], [6, 10, pants],
    // Shoes — row 11
    [2, 11, shoes], [3, 11, shoes], [6, 11, shoes], [7, 11, shoes],
  ];
}

function buildAccessoryPixels(level: number): PixelDef[] {
  // Lv 4-6: headband
  if (level >= 4 && level <= 6) {
    return [
      [2, 1, '#FF0000'], [3, 1, '#FF0000'], [4, 1, '#FF0000'],
      [5, 1, '#FF0000'], [6, 1, '#FF0000'], [7, 1, '#FF0000'],
    ];
  }
  // Lv 7-9: cape
  if (level >= 7 && level <= 9) {
    return [
      [0, 6, '#4400AA'], [1, 6, '#4400AA'],
      [0, 7, '#4400AA'], [1, 7, '#5500CC'],
      [0, 8, '#5500CC'], [1, 8, '#5500CC'],
      [0, 9, '#5500CC'], [1, 9, '#6600DD'],
      [0, 10, '#6600DD'],
      [8, 6, '#4400AA'], [9, 6, '#4400AA'],
      [8, 7, '#5500CC'], [9, 7, '#4400AA'],
      [8, 8, '#5500CC'], [9, 8, '#5500CC'],
      [8, 9, '#6600DD'], [9, 9, '#5500CC'],
      [9, 10, '#6600DD'],
    ];
  }
  // Lv 10-12: crown
  if (level >= 10 && level <= 12) {
    return [
      [3, -1, '#FFD700'], [5, -1, '#FFD700'], [7, -1, '#FFD700'],
      [3, 0, '#FFD700'], [4, 0, '#FFD700'], [5, 0, '#FFD700'], [6, 0, '#FFD700'], [7, 0, '#FFD700'],
      [4, -1, '#FF4444'], [6, -1, '#4444FF'],
    ];
  }
  // Lv 13-15: golden aura (rendered separately with CSS)
  return [];
}

/* ------------------------------------------------------------------ */
/*  Size map                                                            */
/* ------------------------------------------------------------------ */

const SIZE_MAP: Record<PixelAvatarSize, number> = {
  sm: 3,
  md: 4,
  lg: 6,
  xl: 8,
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function PixelAvatar({ variant, size = 'md', level = 1, walking = false, className }: PixelAvatarProps) {
  const pixelSize = SIZE_MAP[size];
  const paletteIndex = ((variant - 1) % 8 + 8) % 8;
  const palette = CHARACTER_PALETTES[paletteIndex];

  const characterPixels = useMemo(() => buildCharacterPixels(palette), [palette]);
  const accessoryPixels = useMemo(() => buildAccessoryPixels(level), [level]);

  const allPixels = useMemo(() => [...characterPixels, ...accessoryPixels], [characterPixels, accessoryPixels]);

  const boxShadow = useMemo(() => {
    return allPixels
      .map(([x, y, color]) => `${x * pixelSize}px ${y * pixelSize}px 0 0 ${color}`)
      .join(', ');
  }, [allPixels, pixelSize]);

  // Canvas dimensions (character is ~10 wide, ~13 tall, with offset for accessories)
  const hasGoldenAura = level >= 13;
  const canvasWidth = 10 * pixelSize + pixelSize;
  const canvasHeight = 13 * pixelSize + pixelSize;

  return (
    <div
      className={cn(
        'relative inline-block pixel-art',
        walking ? 'animate-pixel-walk' : 'animate-pixel-bounce',
        hasGoldenAura && 'animate-pixel-aura',
        className,
      )}
      style={{
        width: canvasWidth,
        height: canvasHeight,
      }}
      role="img"
      aria-label={`Avatar pixel art variante ${variant}`}
    >
      {/* The single pixel that anchors box-shadow rendering */}
      <div
        style={{
          position: 'absolute',
          top: pixelSize, // offset for crown/accessory rows
          left: 0,
          width: pixelSize,
          height: pixelSize,
          backgroundColor: 'transparent',
          boxShadow,
        }}
      />

      {/* Golden aura overlay for Lv 13-15 */}
      {hasGoldenAura && (
        <div
          className="absolute -inset-1 rounded-sm pointer-events-none"
          style={{
            boxShadow: '0 0 8px rgba(255, 215, 0, 0.5), 0 0 16px rgba(255, 191, 0, 0.25)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
          }}
        />
      )}
    </div>
  );
}
