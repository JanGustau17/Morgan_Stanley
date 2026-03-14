'use client';

import {
  QrCode,
  Share2,
  UserPlus,
  Megaphone,
  MapPin,
  FileText,
  Globe,
  Flame,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { PointEvent } from '@/lib/types';

interface PointsHistoryProps {
  events: PointEvent[];
}

const EVENT_META: Record<string, { label: string; icon: typeof QrCode }> = {
  qr_signup: { label: 'QR code sign-up', icon: QrCode },
  social_signup: { label: 'Social media sign-up', icon: Share2 },
  volunteer_joined: { label: 'Volunteer joined your event', icon: UserPlus },
  campaign_created: { label: 'Created a campaign', icon: Megaphone },
  flyer_pinned: { label: 'Pinned a flyer location', icon: MapPin },
  report_submitted: { label: 'Submitted a report', icon: FileText },
  new_neighborhood: { label: 'New neighborhood reached', icon: Globe },
  streak_bonus: { label: 'Streak bonus', icon: Flame },
};

export function PointsHistory({ events }: PointsHistoryProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-6 text-center">
        No points earned yet
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {events.map((event) => {
        const meta = EVENT_META[event.event_type] ?? {
          label: event.event_type,
          icon: FileText,
        };
        const Icon = meta.icon;

        return (
          <li
            key={event.id}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {meta.label}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(event.created_at)}
              </p>
            </div>
            <span className="text-sm font-semibold text-green-600">
              +{event.points}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
