'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Phone,
  Handshake,
  Flame,
  Star,
  Crown,
  Target,
  TrendingUp,
  Award,
  Zap,
  X,
  Coins,
  CheckCircle,
} from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type NodeStatus = 'unlocked' | 'current' | 'locked';

interface SkillNode {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof NODE_ICONS;
  xpReward: number;
  status: NodeStatus;
  /** Grid position (col, row) for layout */
  col: number;
  row: number;
  /** IDs of nodes this connects FROM */
  parents: string[];
}

interface SkillTreeProps {
  nodes: SkillNode[];
}

/* ------------------------------------------------------------------ */
/*  Icon map                                                           */
/* ------------------------------------------------------------------ */

const NODE_ICONS = {
  phone: Phone,
  handshake: Handshake,
  flame: Flame,
  star: Star,
  crown: Crown,
  target: Target,
  trending: TrendingUp,
  award: Award,
  zap: Zap,
} as const;

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const NODE_SIZE = 72;
const COL_GAP = 140;
const ROW_GAP = 120;
const PADDING = 60;

function getNodeCenter(col: number, row: number): { x: number; y: number } {
  return {
    x: PADDING + col * COL_GAP + NODE_SIZE / 2,
    y: PADDING + row * ROW_GAP + NODE_SIZE / 2,
  };
}

/* ------------------------------------------------------------------ */
/*  Connection line                                                    */
/* ------------------------------------------------------------------ */

interface ConnectionProps {
  fromCol: number;
  fromRow: number;
  toCol: number;
  toRow: number;
  active: boolean;
}

function Connection({ fromCol, fromRow, toCol, toRow, active }: ConnectionProps) {
  const from = getNodeCenter(fromCol, fromRow);
  const to = getNodeCenter(toCol, toRow);

  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={active ? '#FFBF00' : '#333333'}
      strokeWidth={active ? 2.5 : 1.5}
      strokeDasharray={active ? 'none' : '6 4'}
      strokeLinecap="round"
      opacity={active ? 0.7 : 0.3}
      filter={active ? 'url(#line-glow)' : undefined}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Tree node                                                          */
/* ------------------------------------------------------------------ */

interface TreeNodeProps {
  node: SkillNode;
  onSelect: (node: SkillNode) => void;
}

function TreeNode({ node, onSelect }: TreeNodeProps) {
  const pos = getNodeCenter(node.col, node.row);
  const Icon = NODE_ICONS[node.icon];
  const isUnlocked = node.status === 'unlocked';
  const isCurrent = node.status === 'current';
  const isLocked = node.status === 'locked';

  return (
    <g
      transform={`translate(${pos.x - NODE_SIZE / 2}, ${pos.y - NODE_SIZE / 2})`}
      className="cursor-pointer"
      onClick={() => onSelect(node)}
    >
      {/* Pulsing ring for current */}
      {isCurrent && (
        <>
          <circle
            cx={NODE_SIZE / 2}
            cy={NODE_SIZE / 2}
            r={NODE_SIZE / 2 + 6}
            fill="none"
            stroke="#FFBF00"
            strokeWidth={2}
            opacity={0.3}
          >
            <animate
              attributeName="r"
              values={`${NODE_SIZE / 2 + 4};${NODE_SIZE / 2 + 12};${NODE_SIZE / 2 + 4}`}
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;0.15;0.4"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={NODE_SIZE / 2}
            cy={NODE_SIZE / 2}
            r={NODE_SIZE / 2 + 2}
            fill="none"
            stroke="#FFBF00"
            strokeWidth={1.5}
            opacity={0.5}
          />
        </>
      )}

      {/* Glow behind for unlocked/current */}
      {(isUnlocked || isCurrent) && (
        <circle
          cx={NODE_SIZE / 2}
          cy={NODE_SIZE / 2}
          r={NODE_SIZE / 2}
          fill="none"
          filter="url(#node-glow)"
        />
      )}

      {/* Background circle */}
      <rect
        width={NODE_SIZE}
        height={NODE_SIZE}
        rx={16}
        ry={16}
        fill={
          isLocked
            ? '#1A1A1A'
            : isCurrent
              ? 'url(#current-bg)'
              : '#1E1E1E'
        }
        stroke={
          isLocked
            ? '#2A2A2A'
            : isCurrent
              ? '#FFBF00'
              : 'rgba(255, 191, 0, 0.25)'
        }
        strokeWidth={isLocked ? 1 : 1.5}
        opacity={isLocked ? 0.5 : 1}
      />

      {/* Icon */}
      <foreignObject x={0} y={0} width={NODE_SIZE} height={NODE_SIZE}>
        <div className="flex items-center justify-center w-full h-full">
          {isLocked ? (
            <Lock className="h-5 w-5 text-ecs-gray/30" />
          ) : (
            <Icon
              className={cn(
                'h-6 w-6',
                isCurrent ? 'text-ecs-amber' : 'text-ecs-amber/70'
              )}
              style={
                isCurrent
                  ? { filter: 'drop-shadow(0 0 6px rgba(255, 191, 0, 0.5))' }
                  : isUnlocked
                    ? { filter: 'drop-shadow(0 0 4px rgba(255, 191, 0, 0.3))' }
                    : undefined
              }
            />
          )}
        </div>
      </foreignObject>

      {/* Label below */}
      <foreignObject x={-20} y={NODE_SIZE + 4} width={NODE_SIZE + 40} height={32}>
        <div className="flex justify-center">
          <span
            className={cn(
              'text-[10px] font-display font-bold text-center leading-tight whitespace-nowrap',
              isLocked ? 'text-ecs-gray/30' : isCurrent ? 'text-ecs-amber' : 'text-ecs-gray'
            )}
          >
            {node.label}
          </span>
        </div>
      </foreignObject>

      {/* Unlocked checkmark badge */}
      {isUnlocked && (
        <g transform={`translate(${NODE_SIZE - 10}, -4)`}>
          <circle cx={8} cy={8} r={9} fill="#0C0C0C" />
          <circle cx={8} cy={8} r={7} fill="#22c55e" />
          <foreignObject x={2} y={2} width={12} height={12}>
            <div className="flex items-center justify-center w-full h-full">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          </foreignObject>
        </g>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail panel                                                       */
/* ------------------------------------------------------------------ */

function NodeDetail({ node, onClose }: { node: SkillNode; onClose: () => void }) {
  const Icon = NODE_ICONS[node.icon];
  const isLocked = node.status === 'locked';

  return (
    <motion.div
      className="absolute bottom-4 left-4 right-4 z-20 rounded-xl p-4 border"
      style={{
        background: 'rgba(20, 20, 20, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: isLocked
          ? '1px solid rgba(42, 42, 42, 0.8)'
          : '1px solid rgba(255, 191, 0, 0.15)',
        boxShadow: isLocked ? 'none' : '0 0 20px rgba(255, 191, 0, 0.06)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <button
        className="absolute top-3 right-3 p-1 rounded-full text-ecs-gray hover:text-white transition-colors"
        onClick={onClose}
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-xl border',
            isLocked
              ? 'border-ecs-gray-border bg-ecs-black-light'
              : 'border-ecs-amber/20'
          )}
          style={
            !isLocked
              ? {
                  background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.08), rgba(255, 157, 0, 0.04))',
                }
              : undefined
          }
        >
          {isLocked ? (
            <Lock className="h-4 w-4 text-ecs-gray/40" />
          ) : (
            <Icon className="h-5 w-5 text-ecs-amber" />
          )}
        </div>
        <div>
          <h4 className="font-display font-bold text-white text-sm">{node.label}</h4>
          <span
            className={cn(
              'text-[10px] font-display uppercase tracking-wider',
              node.status === 'unlocked'
                ? 'text-emerald-400'
                : node.status === 'current'
                  ? 'text-ecs-amber'
                  : 'text-ecs-gray/50'
            )}
          >
            {node.status === 'unlocked'
              ? 'Debloque'
              : node.status === 'current'
                ? 'En cours'
                : 'Verrouille'}
          </span>
        </div>
      </div>

      <p className="text-xs text-ecs-gray leading-relaxed mb-3">{node.description}</p>

      <div className="flex items-center gap-1.5">
        <Coins className="h-3.5 w-3.5 text-ecs-amber" />
        <span className="text-xs font-display font-bold text-gradient-amber">
          +{formatXP(node.xpReward)} XP
        </span>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function SkillTree({ nodes }: SkillTreeProps) {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Build a lookup for parents */
  const nodeMap = useMemo(() => {
    const map = new Map<string, SkillNode>();
    for (const node of nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [nodes]);

  /* Compute SVG dimensions */
  const maxCol = useMemo(() => Math.max(...nodes.map((n) => n.col), 0), [nodes]);
  const maxRow = useMemo(() => Math.max(...nodes.map((n) => n.row), 0), [nodes]);
  const svgWidth = PADDING * 2 + maxCol * COL_GAP + NODE_SIZE;
  const svgHeight = PADDING * 2 + maxRow * ROW_GAP + NODE_SIZE + 40; // extra for labels

  /* Build connections */
  const connections = useMemo(() => {
    const lines: ConnectionProps[] = [];
    for (const node of nodes) {
      for (const parentId of node.parents) {
        const parent = nodeMap.get(parentId);
        if (!parent) continue;
        const active = parent.status !== 'locked' && node.status !== 'locked';
        lines.push({
          fromCol: parent.col,
          fromRow: parent.row,
          toCol: node.col,
          toRow: node.row,
          active,
        });
      }
    }
    return lines;
  }, [nodes, nodeMap]);

  const handleSelect = useCallback((node: SkillNode) => {
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="relative rounded-xl border border-ecs-gray-border overflow-hidden bg-ecs-black-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-ecs-gray-border/50">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-ecs-amber" />
          <h3 className="font-display font-bold text-white text-sm">Arbre de progression</h3>
        </div>
        <span className="text-[10px] font-display text-ecs-gray uppercase tracking-wider">
          {nodes.filter((n) => n.status === 'unlocked').length}/{nodes.length} debloques
        </span>
      </div>

      {/* Scrollable tree area */}
      <div
        ref={containerRef}
        className="relative overflow-auto"
        style={{ maxHeight: 520 }}
      >
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="block"
        >
          {/* Definitions */}
          <defs>
            {/* Glow filter for active lines */}
            <filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Glow filter for nodes */}
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" />
              <feFlood floodColor="#FFBF00" floodOpacity="0.15" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>

            {/* Gradient for current node bg */}
            <linearGradient id="current-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 191, 0, 0.08)" />
              <stop offset="100%" stopColor="rgba(255, 157, 0, 0.03)" />
            </linearGradient>
          </defs>

          {/* Grid background dots */}
          {Array.from({ length: Math.ceil(svgWidth / 40) }, (_, xi) =>
            Array.from({ length: Math.ceil(svgHeight / 40) }, (_, yi) => (
              <circle
                key={`${xi}-${yi}`}
                cx={xi * 40}
                cy={yi * 40}
                r={0.5}
                fill="rgba(255, 191, 0, 0.06)"
              />
            ))
          )}

          {/* Connection lines (render behind nodes) */}
          {connections.map((conn, i) => (
            <Connection key={i} {...conn} />
          ))}

          {/* Nodes */}
          {nodes.map((node) => (
            <TreeNode key={node.id} node={node} onSelect={handleSelect} />
          ))}
        </svg>
      </div>

      {/* Detail panel overlay */}
      <AnimatePresence>
        {selectedNode && (
          <NodeDetail node={selectedNode} onClose={handleCloseDetail} />
        )}
      </AnimatePresence>
    </div>
  );
}
