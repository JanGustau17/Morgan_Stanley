import { cn } from '@/lib/utils';

type Variant = 'active' | 'upcoming' | 'completed' | 'level';
type Size = 'sm' | 'md';

interface BadgeProps {
  variant: Variant;
  size?: Size;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  active: 'bg-green-100 text-green-800',
  upcoming: 'bg-amber-100 text-amber-800',
  completed: 'bg-gray-100 text-gray-600',
  level: 'bg-green-600 text-white',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({
  variant,
  size = 'md',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
