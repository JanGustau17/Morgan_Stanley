'use client';

import { LEVELS } from '@/lib/points';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LevelBadge({ level, size = 'md', className }: LevelBadgeProps) {
  const info = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  return (
    <StatusBadge
      variant="level"
      size={size}
      icon={info.emoji}
      label={info.name}
      className={className}
    />
  );
}
