'use client';

import { type ReactNode, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: ReactNode;
  side?: TooltipSide;
  children: ReactNode;
}

interface TooltipPosition {
  top: number;
  left: number;
  arrowTop: number;
  arrowLeft: number;
  arrowRotation: number;
  transformOrigin: string;
}

const ARROW_SIZE = 6;
const OFFSET = 10;

function getPosition(
  triggerRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  side: TooltipSide
): TooltipPosition {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  const centerX = triggerRect.left + scrollX + triggerRect.width / 2;
  const centerY = triggerRect.top + scrollY + triggerRect.height / 2;

  switch (side) {
    case 'top':
      return {
        top: triggerRect.top + scrollY - tooltipHeight - OFFSET,
        left: centerX - tooltipWidth / 2,
        arrowTop: tooltipHeight - 1,
        arrowLeft: tooltipWidth / 2 - ARROW_SIZE,
        arrowRotation: 180,
        transformOrigin: 'bottom center',
      };
    case 'bottom':
      return {
        top: triggerRect.bottom + scrollY + OFFSET,
        left: centerX - tooltipWidth / 2,
        arrowTop: -ARROW_SIZE * 2 + 1,
        arrowLeft: tooltipWidth / 2 - ARROW_SIZE,
        arrowRotation: 0,
        transformOrigin: 'top center',
      };
    case 'left':
      return {
        top: centerY - tooltipHeight / 2,
        left: triggerRect.left + scrollX - tooltipWidth - OFFSET,
        arrowTop: tooltipHeight / 2 - ARROW_SIZE,
        arrowLeft: tooltipWidth - 1,
        arrowRotation: 270,
        transformOrigin: 'center right',
      };
    case 'right':
      return {
        top: centerY - tooltipHeight / 2,
        left: triggerRect.right + scrollX + OFFSET,
        arrowTop: tooltipHeight / 2 - ARROW_SIZE,
        arrowLeft: -ARROW_SIZE * 2 + 1,
        arrowRotation: 90,
        transformOrigin: 'center left',
      };
  }
}

export function Tooltip({ content, side = 'top', children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    setPosition(
      getPosition(triggerRect, tooltipRect.width, tooltipRect.height, side)
    );
  }, [side]);

  useLayoutEffect(() => {
    if (visible) {
      // Small delay to ensure tooltip is rendered before measuring
      const frame = requestAnimationFrame(updatePosition);
      return () => cancelAnimationFrame(frame);
    }
  }, [visible, updatePosition]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="inline-flex"
      >
        {children}
      </div>

      <AnimatePresence>
        {visible && (
          <motion.div
            ref={tooltipRef}
            className="fixed z-[70] max-w-xs"
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              visibility: position ? 'visible' : 'hidden',
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 22,
              mass: 0.6,
            }}
          >
            {/* Glass card */}
            <div
              className="relative rounded-lg px-3 py-2 text-sm text-white/90"
              style={{
                background: 'rgba(20, 20, 20, 0.92)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 191, 0, 0.15)',
                boxShadow:
                  '0 8px 24px rgba(0,0,0,0.5), 0 0 12px rgba(255, 191, 0, 0.06)',
              }}
            >
              {/* Amber accent top border */}
              <div
                className="absolute top-0 left-2 right-2 h-[2px] rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, #FFBF00, #FF9D00, transparent)',
                }}
              />

              {content}
            </div>

            {/* Arrow */}
            {position && (
              <div
                className="absolute"
                style={{
                  top: position.arrowTop,
                  left: position.arrowLeft,
                  width: 0,
                  height: 0,
                  borderLeft: `${ARROW_SIZE}px solid transparent`,
                  borderRight: `${ARROW_SIZE}px solid transparent`,
                  borderBottom: `${ARROW_SIZE}px solid rgba(20, 20, 20, 0.92)`,
                  transform: `rotate(${position.arrowRotation}deg)`,
                  filter: 'drop-shadow(0 -1px 0 rgba(255, 191, 0, 0.15))',
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
