'use client';

import { Avatar } from '@/components/ui/Avatar';

interface VolunteerItem {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

interface VolunteerListProps {
  volunteers: VolunteerItem[];
}

export function VolunteerList({ volunteers }: VolunteerListProps) {
  if (volunteers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-violet-200 bg-[#f5f3ff] px-6 py-10 text-center">
        <p className="text-sm text-muted">No volunteers yet</p>
        <p className="mt-1 text-xs text-gray-400">
          Be the first to join this event!
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {volunteers.map((v) => (
        <div
          key={v.id}
          className="flex shrink-0 flex-col items-center gap-1.5"
        >
          <Avatar src={v.avatar_url} name={v.name} size="lg" />
          <span className="max-w-[72px] truncate text-xs font-medium text-gray-700">
            {v.name ?? 'Volunteer'}
          </span>
        </div>
      ))}
    </div>
  );
}
