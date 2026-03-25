'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarDisplayProps {
  avatarUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
}

const sizeMap: Record<string, { container: string; text: string; dot: string }> = {
  sm: { container: 'h-8 w-8', text: 'text-xs', dot: 'h-2.5 w-2.5' },
  md: { container: 'h-10 w-10', text: 'text-sm', dot: 'h-3 w-3' },
  lg: { container: 'h-14 w-14', text: 'text-lg', dot: 'h-3.5 w-3.5' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function AvatarDisplay({ avatarUrl, name, size = 'md', online }: AvatarDisplayProps) {
  const sizeStyle = sizeMap[size];

  return (
    <div className="relative inline-flex shrink-0">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          width={56}
          height={56}
          className={cn(
            'rounded-full border border-ecs-gray-border object-cover',
            sizeStyle.container
          )}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full border border-ecs-gray-border bg-ecs-black-light font-display font-bold text-ecs-gray',
            sizeStyle.container,
            sizeStyle.text
          )}
        >
          {getInitials(name)}
        </div>
      )}

      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-ecs-black-card',
            sizeStyle.dot,
            online ? 'bg-green-500' : 'bg-ecs-gray-dark'
          )}
        />
      )}
    </div>
  );
}
