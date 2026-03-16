'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'event' | 'donation' | 'badge' | 'volunteer' | 'pantry';
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: string;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'event',
    title: 'New event near you',
    description: 'Brooklyn Flyer Blitz is happening this Saturday at 10am',
    time: '2m ago',
    read: false,
    icon: '📅',
  },
  {
    id: '2',
    type: 'badge',
    title: 'Badge earned!',
    description: "You've earned the 'First Flyer' badge. Keep it up!",
    time: '1h ago',
    read: false,
    icon: '🏅',
  },
  {
    id: '3',
    type: 'volunteer',
    title: 'Someone joined your event',
    description: 'Alex M. joined your Queens Outreach Campaign',
    time: '3h ago',
    read: true,
    icon: '👋',
  },
  {
    id: '4',
    type: 'donation',
    title: 'Donation impact update',
    description: 'Your contributions helped 47 families find food this week',
    time: '1d ago',
    read: true,
    icon: '💚',
  },
];

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-[#101726] hover:bg-black/8 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-[#e8e0cc] shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e0cc]">
              <span className="font-semibold text-[#101726] text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[#008A81] font-medium hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-[#f0ece0]">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#101726]/45">
                  <div className="text-3xl mb-2">🔔</div>
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 hover:bg-[#fff6E0] transition-colors flex gap-3 items-start',
                      !n.read && 'bg-[#fffdf4]'
                    )}
                  >
                    <span className="text-xl mt-0.5 shrink-0">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-sm leading-snug', n.read ? 'text-[#101726]/70 font-normal' : 'text-[#101726] font-semibold')}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-[#5C3D8F] mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-[#101726]/50 leading-snug mt-0.5 line-clamp-2">
                        {n.description}
                      </p>
                      <p className="text-[10px] text-[#101726]/35 mt-1">{n.time}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="px-4 py-3 border-t border-[#e8e0cc]">
              <p className="text-xs text-center text-[#101726]/40">
                Notifications update in real time
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
