import { cn } from '@/lib/utils';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-20 text-center px-6',
        className,
      )}
    >
      {icon && (
        <div className="text-5xl mb-4 opacity-60">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-[#101726] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#101726]/55 max-w-xs leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: '#5C3D8F' }}
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: '#5C3D8F' }}
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
