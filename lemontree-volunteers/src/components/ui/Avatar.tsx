import Image from 'next/image';
import { cn, getInitials } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: Size;
  className?: string;
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

const imageSizes: Record<Size, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizeClass = sizeStyles[size];
  const px = imageSizes[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? 'Avatar'}
        width={px}
        height={px}
        className={cn('rounded-full object-cover', sizeClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-green-600 font-medium text-white',
        sizeClass,
        className,
      )}
      aria-label={name ?? 'Avatar'}
    >
      {getInitials(name ?? null)}
    </div>
  );
}
