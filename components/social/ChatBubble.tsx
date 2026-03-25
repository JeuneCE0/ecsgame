'use client';

import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  content: string;
  createdAt: string;
  isSent: boolean;
  isRead: boolean;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatBubble({ content, createdAt, isSent, isRead }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn('flex', isSent ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5',
          isSent
            ? 'bg-gradient-to-br from-ecs-amber/90 to-ecs-orange/80 text-black'
            : 'bg-white/[0.06] backdrop-blur-sm border border-white/[0.06] text-white/90'
        )}
      >
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {content}
        </p>

        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isSent ? 'justify-end' : 'justify-start'
          )}
        >
          <span
            className={cn(
              'text-[10px]',
              isSent ? 'text-black/50' : 'text-white/30'
            )}
          >
            {formatTime(createdAt)}
          </span>

          {isSent && (
            <span className={cn('text-black/50')}>
              {isRead ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
