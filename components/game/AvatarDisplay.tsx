'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarDisplayProps {
  avatarUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
}

const sizeMap: Record<string, {
  container: string;
  text: string;
  dot: string;
  ring: number;
  imgSize: number;
}> = {
  sm: { container: 'h-8 w-8', text: 'text-xs', dot: 'h-2.5 w-2.5', ring: 36, imgSize: 32 },
  md: { container: 'h-10 w-10', text: 'text-sm', dot: 'h-3 w-3', ring: 44, imgSize: 40 },
  lg: { container: 'h-14 w-14', text: 'text-lg', dot: 'h-3.5 w-3.5', ring: 60, imgSize: 56 },
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
      {/* Animated rotating gradient ring */}
      <div
        className="absolute rounded-full animate-rotate-gradient"
        style={{
          width: sizeStyle.ring,
          height: sizeStyle.ring,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'conic-gradient(from 0deg, #FFBF00, #FF9D00, transparent, #FFBF00)',
          opacity: 0.6,
        }}
      />

      {/* Dark background ring (gap between gradient and avatar) */}
      <div
        className="absolute rounded-full"
        style={{
          width: sizeStyle.ring - 3,
          height: sizeStyle.ring - 3,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#0C0C0C',
        }}
      />

      {/* Avatar content */}
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          width={sizeStyle.imgSize}
          height={sizeStyle.imgSize}
          className={cn(
            'relative z-10 rounded-full object-cover',
            sizeStyle.container
          )}
        />
      ) : (
        <div
          className={cn(
            'relative z-10 flex items-center justify-center rounded-full font-display font-bold',
            sizeStyle.container,
            sizeStyle.text
          )}
          style={{
            background: 'linear-gradient(135deg, #1E1E1E 0%, #141414 100%)',
            color: '#FFBF00',
          }}
        >
          {getInitials(name)}
        </div>
      )}

      {/* Online status dot with pulse */}
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 z-20 rounded-full border-2 border-ecs-black',
            sizeStyle.dot,
            online
              ? 'bg-green-500 animate-online-pulse'
              : 'bg-ecs-gray-dark'
          )}
        />
      )}
    </div>
  );
}
