'use client';

import { LEVELS } from '@/lib/points';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
  lg: 'px-4 py-1.5 text-base gap-2',
} as const;

export function LevelBadge({ level, size = 'md', className }: LevelBadgeProps) {
  const info = LEVELS.find((l) => l.level === level) ?? LEVELS[0];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        'bg-green-100 text-green-800 border border-green-200',
        sizeStyles[size],
        className,
      )}
    >
      <span>{info.emoji}</span>
      <span>{info.name}</span>
    </span>
  );
}
