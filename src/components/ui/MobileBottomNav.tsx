'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, MapPin, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/#events', label: 'Events', icon: Calendar },
  { href: '/resources', label: 'Resources', icon: MapPin },
  { href: '/forum', label: 'Forum', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[#e8e0cc] safe-area-inset-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href.replace('/#', '/'));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 min-h-[44px] min-w-[44px] transition-colors',
                isActive ? 'text-[#5C3D8F]' : 'text-[#101726]/45 hover:text-[#101726]/70'
              )}
            >
              <Icon
                className={cn('w-5 h-5', isActive && 'stroke-2')}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span className={cn('text-[10px] font-medium', isActive ? 'font-bold' : '')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
