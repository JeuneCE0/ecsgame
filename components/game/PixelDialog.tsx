'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PixelAvatar } from '@/components/game/PixelAvatar';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface DialogMessage {
  speaker: string;
  text: string;
  avatarVariant?: number;
}

interface PixelDialogProps {
  messages: DialogMessage[];
  onComplete?: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const CHAR_DELAY_MS = 30;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function PixelDialog({ messages, onComplete, className }: PixelDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charIndexRef = useRef(0);

  const currentMessage = messages[currentIndex] as DialogMessage | undefined;
  const isLastMessage = currentIndex >= messages.length - 1;

  // Typewriter effect
  useEffect(() => {
    if (!currentMessage) return;

    charIndexRef.current = 0;
    setDisplayedText('');
    setIsTyping(true);

    const fullText = currentMessage.text;

    function typeNextChar() {
      if (charIndexRef.current < fullText.length) {
        charIndexRef.current += 1;
        setDisplayedText(fullText.slice(0, charIndexRef.current));
        timerRef.current = setTimeout(typeNextChar, CHAR_DELAY_MS);
      } else {
        setIsTyping(false);
      }
    }

    timerRef.current = setTimeout(typeNextChar, CHAR_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentMessage]);

  const handleAdvance = useCallback(() => {
    if (!currentMessage) return;

    // If still typing, skip to full text
    if (isTyping) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setDisplayedText(currentMessage.text);
      setIsTyping(false);
      return;
    }

    // If last message, close dialog
    if (isLastMessage) {
      setIsVisible(false);
      onComplete?.();
      return;
    }

    // Advance to next message
    setCurrentIndex((prev) => prev + 1);
  }, [isTyping, isLastMessage, currentMessage, onComplete]);

  if (!currentMessage || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn('relative', className)}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <button
            type="button"
            className="w-full text-left focus:outline-none"
            onClick={handleAdvance}
            aria-label="Continuer le dialogue"
          >
            <div
              className="pixel-dialog-border relative bg-[#0a0a2e] p-4"
              style={{ minHeight: 100 }}
            >
              {/* Speaker name */}
              <div className="absolute -top-3 left-4 px-2 bg-[#0a0a2e]">
                <span className="font-pixel text-[10px] text-ecs-amber tracking-wider">
                  {currentMessage.speaker}
                </span>
              </div>

              <div className="flex gap-4 items-start pt-2">
                {/* Portrait */}
                {currentMessage.avatarVariant !== undefined && (
                  <div className="shrink-0">
                    <PixelAvatar
                      variant={currentMessage.avatarVariant}
                      size="md"
                      walking={false}
                    />
                  </div>
                )}

                {/* Text area */}
                <div className="flex-1 min-h-[48px]">
                  <p className="font-pixel text-[10px] leading-[1.8] text-white/90 whitespace-pre-wrap">
                    {displayedText}
                    {isTyping && (
                      <span className="animate-pixel-cursor inline-block ml-0.5 w-[8px] h-[10px] bg-white/80 align-middle" />
                    )}
                  </p>
                </div>
              </div>

              {/* Continue triangle */}
              {!isTyping && (
                <div className="absolute bottom-2 right-3">
                  <span className="animate-pixel-cursor font-pixel text-xs text-ecs-amber">
                    {'\u25BC'}
                  </span>
                </div>
              )}

              {/* Message counter */}
              <div className="absolute bottom-2 left-4">
                <span className="font-pixel text-[8px] text-white/30">
                  {currentIndex + 1}/{messages.length}
                </span>
              </div>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
