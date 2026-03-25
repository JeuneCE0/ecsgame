'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type BackgroundVariant = 'grid' | 'particles' | 'hexagons' | 'circuits';

interface GameBackgroundProps {
  variant?: BackgroundVariant;
  className?: string;
}

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Perspective grid */}
      <div
        className="absolute inset-0"
        style={{
          perspective: '500px',
          perspectiveOrigin: '50% 30%',
        }}
      >
        <div
          className="absolute w-[200%] h-[200%] -left-1/2 -top-1/4"
          style={{
            transform: 'rotateX(60deg)',
            backgroundImage: `
              linear-gradient(rgba(255, 191, 0, 0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 191, 0, 0.06) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 70%)',
          }}
        />
      </div>

      {/* Accent horizontal lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 49.5%, rgba(255, 191, 0, 0.03) 49.5%, rgba(255, 191, 0, 0.03) 50.5%, transparent 50.5%)
          `,
          backgroundSize: '100% 120px',
          maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
        }}
      />

      {/* Corner accent glow */}
      <div
        className="absolute top-0 left-0 w-1/3 h-1/3"
        style={{
          background: 'radial-gradient(ellipse at 0% 0%, rgba(255, 191, 0, 0.04) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-1/3 h-1/3"
        style={{
          background: 'radial-gradient(ellipse at 100% 100%, rgba(255, 157, 0, 0.03) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}

interface Particle {
  id: number;
  x: string;
  y: string;
  size: number;
  duration: number;
  delay: number;
  drift: number;
}

function ParticlesBackground() {
  const particles: Particle[] = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: `${(i * 37 + 13) % 100}%`,
        y: `${(i * 53 + 7) % 100}%`,
        size: 1 + (i % 4) * 0.8,
        duration: 6 + (i % 5) * 2,
        delay: (i % 7) * 0.8,
        drift: ((i % 3) - 1) * 20,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0 ? '#FF9D00' : '#FFBF00',
            boxShadow: `0 0 ${p.size * 3}px ${p.size}px rgba(255, 191, 0, 0.15)`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, p.drift, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Subtle radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(12, 12, 12, 0.8) 100%)',
        }}
      />
    </div>
  );
}

function HexagonsBackground() {
  const hexSize = 60;
  const hexH = hexSize * 0.866;
  const rows = 12;
  const cols = 14;

  const hexagons = useMemo(() => {
    const result: Array<{ id: string; cx: number; cy: number; delay: number }> = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const offset = row % 2 === 0 ? 0 : hexH;
        result.push({
          id: `${row}-${col}`,
          cx: col * hexH * 2 + offset - hexH * 2,
          cy: row * hexSize * 1.5 - hexSize,
          delay: ((row + col) % 8) * 0.5,
        });
      }
    }
    return result;
  }, []);

  function hexPoints(cx: number, cy: number, r: number): string {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {hexagons.map((hex) => (
          <motion.polygon
            key={hex.id}
            points={hexPoints(hex.cx, hex.cy, hexSize * 0.48)}
            fill="none"
            stroke="rgba(255, 191, 0, 0.04)"
            strokeWidth="0.5"
            animate={{
              stroke: [
                'rgba(255, 191, 0, 0.02)',
                'rgba(255, 191, 0, 0.08)',
                'rgba(255, 191, 0, 0.02)',
              ],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: hex.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>

      {/* Central fade */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(12, 12, 12, 0.9) 100%)',
        }}
      />
    </div>
  );
}

interface CircuitNode {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}

function CircuitsBackground() {
  const circuits: CircuitNode[] = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        const baseX = (i * 127 + 50) % 1200;
        const baseY = (i * 89 + 30) % 800;
        const isHorizontal = i % 2 === 0;
        const length = 40 + (i % 5) * 30;

        return {
          id: i,
          x1: baseX,
          y1: baseY,
          x2: isHorizontal ? baseX + length : baseX,
          y2: isHorizontal ? baseY : baseY + length,
          delay: (i % 6) * 1.5,
        };
      }),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
        {/* Static circuit lines */}
        {circuits.map((c) => (
          <g key={c.id}>
            <line
              x1={c.x1}
              y1={c.y1}
              x2={c.x2}
              y2={c.y2}
              stroke="rgba(255, 191, 0, 0.06)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            {/* Node dots at endpoints */}
            <circle cx={c.x1} cy={c.y1} r="2" fill="rgba(255, 191, 0, 0.08)" />
            <circle cx={c.x2} cy={c.y2} r="2" fill="rgba(255, 191, 0, 0.08)" />
          </g>
        ))}

        {/* Animated pulse traveling along lines */}
        {circuits
          .filter((_, i) => i % 3 === 0)
          .map((c) => {
            const dx = c.x2 - c.x1;
            const dy = c.y2 - c.y1;
            return (
              <motion.circle
                key={`pulse-${c.id}`}
                r="3"
                fill="#FFBF00"
                opacity="0.6"
                style={{
                  filter: 'blur(1px)',
                  boxShadow: '0 0 6px rgba(255, 191, 0, 0.8)',
                }}
                animate={{
                  cx: [c.x1, c.x1 + dx, c.x1],
                  cy: [c.y1, c.y1 + dy, c.y1],
                  opacity: [0, 0.7, 0],
                }}
                transition={{
                  duration: 3 + (c.id % 3),
                  repeat: Infinity,
                  delay: c.delay,
                  ease: 'easeInOut',
                }}
              />
            );
          })}

        {/* Additional branching lines for complexity */}
        {circuits
          .filter((_, i) => i % 4 === 0)
          .map((c) => {
            const midX = (c.x1 + c.x2) / 2;
            const midY = (c.y1 + c.y2) / 2;
            const branchLen = 30 + (c.id % 3) * 20;
            const isHoriz = c.x1 !== c.x2;

            return (
              <g key={`branch-${c.id}`}>
                <line
                  x1={midX}
                  y1={midY}
                  x2={isHoriz ? midX : midX + branchLen}
                  y2={isHoriz ? midY + branchLen : midY}
                  stroke="rgba(255, 191, 0, 0.04)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
                <circle
                  cx={isHoriz ? midX : midX + branchLen}
                  cy={isHoriz ? midY + branchLen : midY}
                  r="1.5"
                  fill="rgba(255, 191, 0, 0.06)"
                />
              </g>
            );
          })}
      </svg>

      {/* Edge fade */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(12, 12, 12, 0.85) 100%)',
        }}
      />
    </div>
  );
}

export function GameBackground({ variant = 'grid', className }: GameBackgroundProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 -z-10 pointer-events-none overflow-hidden',
        className
      )}
    >
      {variant === 'grid' && <GridBackground />}
      {variant === 'particles' && <ParticlesBackground />}
      {variant === 'hexagons' && <HexagonsBackground />}
      {variant === 'circuits' && <CircuitsBackground />}
    </div>
  );
}
