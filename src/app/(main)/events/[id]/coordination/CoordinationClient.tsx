'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { CalendarDays, MapPin, Users, MapIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { ChatWindow } from '@/components/chat/ChatWindow';

const MapWithPins = dynamic(() => import('../MapWithPins'), {
  ssr: false,
  loading: () => (
    <div
      className="h-[380px] w-full animate-pulse rounded-xl"
      style={{ background: '#e8e0cc' }}
    />
  ),
});

interface Props {
  campaignId: string;
  campaign: {
    name: string;
    neighborhood: string | null;
    location_name: string | null;
    campaign_date: string | null;
    volunteers_needed: number;
    status: string;
    lat: number | null;
    lng: number | null;
  };
  volunteers: { id: string; name: string | null; avatar_url: string | null }[];
  initialPins: { lat: number; lng: number }[];
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string | null;
}

const statusBadgeStyle: Record<string, React.CSSProperties> = {
  active:    { background: '#ffcc1022', color: '#7a5f00', borderColor: '#ffcc1044' },
  upcoming:  { background: '#f0f0ee',   color: '#666',    borderColor: '#e8e0cc'   },
  completed: { background: '#e8e0cc',   color: '#999',    borderColor: '#d4cfc0'   },
};

const TASKS = [
  'Print flyers',
  'Distribute in target area',
  'Take photos of posted flyers',
  'Report back to organizer',
];

export default function CoordinationClient({
  campaignId,
  campaign,
  volunteers,
  initialPins,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: Props) {
  const [pins, setPins] = useState(initialPins);
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({});

  const fillPct = Math.min(100, (volunteers.length / campaign.volunteers_needed) * 100);
  const badgeStyle = statusBadgeStyle[campaign.status] ?? statusBadgeStyle.upcoming;
  const mapCenter =
    campaign.lat != null && campaign.lng != null
      ? { lat: campaign.lat, lng: campaign.lng }
      : { lat: 40.7128, lng: -74.006 };

  function toggleTask(i: number) {
    setCheckedTasks((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  return (
    <div className="min-h-screen mt-[60px]" style={{ background: '#fff6E0' }}>

      {/* ── Main grid ── */}
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Live Flyer Coverage */}
          <div
            className="rounded-2xl border bg-white shadow-sm overflow-hidden"
            style={{ borderColor: '#e8e0cc' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#e8e0cc' }}>
              <div>
                <h2
                  className="text-base font-semibold"
                  style={{ color: '#101726', fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Live Flyer Coverage
                </h2>
                <p className="text-xs mt-0.5" style={{ color: '#101726', opacity: 0.55 }}>
                  Click the map to log a flyer drop
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: '#008A8115', color: '#008A81' }}
                >
                  <MapIcon className="h-3 w-3" />
                  {pins.length} {pins.length === 1 ? 'pin' : 'pins'}
                </div>
              </div>
            </div>
            <div className="p-4">
              <MapWithPins
                campaignId={campaignId}
                pins={pins}
                center={mapCenter}
                onPinAdded={(pin) => setPins((p) => [...p, pin])}
              />
            </div>
          </div>

          {/* Team Chat */}
          <div
            className="rounded-2xl border bg-white shadow-sm overflow-hidden"
            style={{ borderColor: '#e8e0cc' }}
          >
            <ChatWindow
              campaignId={campaignId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
            />
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Campaign Stats */}
          <div
            className="rounded-2xl border bg-white p-5 shadow-sm"
            style={{ borderColor: '#e8e0cc' }}
          >
            <h2
              className="mb-4 text-base font-semibold"
              style={{ color: '#101726', fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Campaign Stats
            </h2>
            <dl className="space-y-3">
              {campaign.campaign_date && (
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="h-4 w-4 shrink-0" style={{ color: '#008A81' }} />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#101726', opacity: 0.4 }}>Date</dt>
                    <dd className="text-sm font-medium" style={{ color: '#101726' }}>{formatDate(campaign.campaign_date)}</dd>
                  </div>
                </div>
              )}
              {(campaign.location_name ?? campaign.neighborhood) && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: '#008A81' }} />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#101726', opacity: 0.4 }}>Location</dt>
                    <dd className="text-sm font-medium" style={{ color: '#101726' }}>{campaign.location_name ?? campaign.neighborhood}</dd>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 shrink-0" style={{ color: '#008A81' }} />
                <div className="flex-1 min-w-0">
                  <dt className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#101726', opacity: 0.4 }}>Volunteers</dt>
                  <dd className="text-sm font-medium" style={{ color: '#101726' }}>
                    {volunteers.length} / {campaign.volunteers_needed} joined
                  </dd>
                </div>
              </div>
            </dl>

            {/* Progress bar */}
            <div className="mt-4 h-1.5 overflow-hidden rounded-full" style={{ background: '#e8e0cc' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${fillPct}%`, background: '#008A81' }}
              />
            </div>
            <p className="mt-1.5 text-right text-[11px] font-semibold" style={{ color: '#008A81' }}>
              {Math.round(fillPct)}% full
            </p>

            <div className="mt-3 pt-3 border-t" style={{ borderColor: '#e8e0cc' }}>
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize"
                style={badgeStyle}
              >
                {campaign.status}
              </span>
            </div>
          </div>

          {/* Volunteers */}
          <div
            className="rounded-2xl border bg-white p-5 shadow-sm"
            style={{ borderColor: '#e8e0cc' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                className="text-base font-semibold"
                style={{ color: '#101726', fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Volunteers
              </h2>
              <span className="text-xs font-bold" style={{ color: '#008A81' }}>
                {volunteers.length} {volunteers.length === 1 ? 'volunteer' : 'volunteers'}
              </span>
            </div>

            {volunteers.length === 0 ? (
              <p className="text-sm" style={{ color: '#101726', opacity: 0.45 }}>
                No volunteers yet.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {volunteers.map((v) => (
                  <li key={v.id} className="flex items-center gap-2.5">
                    <Avatar src={v.avatar_url} name={v.name} size="sm" />
                    <span
                      className="truncate text-sm font-medium"
                      style={{ color: '#101726' }}
                    >
                      {v.name ?? 'Anonymous'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Day-of Checklist */}
          <div
            className="rounded-2xl border bg-white p-5 shadow-sm"
            style={{ borderColor: '#e8e0cc' }}
          >
            <h2
              className="mb-1 text-base font-semibold"
              style={{ color: '#101726', fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Day-of Checklist
            </h2>
            <p className="mb-4 text-xs" style={{ color: '#101726', opacity: 0.5 }}>
              Track your progress for today
            </p>
            <ul className="space-y-3">
              {TASKS.map((task, i) => {
                const checked = !!checkedTasks[i];
                return (
                  <li key={task}>
                    <label className="flex cursor-pointer items-start gap-3 group">
                      <div className="relative mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTask(i)}
                          className="sr-only"
                        />
                        <div
                          className="h-4 w-4 rounded border-2 flex items-center justify-center transition-colors"
                          style={{
                            borderColor: checked ? '#008A81' : '#e8e0cc',
                            background: checked ? '#008A81' : 'white',
                          }}
                        >
                          {checked && (
                            <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span
                        className="text-sm transition-colors"
                        style={{
                          color: checked ? '#008A81' : '#101726',
                          textDecoration: checked ? 'line-through' : 'none',
                          opacity: checked ? 0.6 : 1,
                        }}
                      >
                        {task}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>

            {/* Progress indicator */}
            {Object.values(checkedTasks).some(Boolean) && (
              <div className="mt-4 pt-3 border-t" style={{ borderColor: '#e8e0cc' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold" style={{ color: '#101726', opacity: 0.5 }}>
                    Progress
                  </span>
                  <span className="text-xs font-bold" style={{ color: '#008A81' }}>
                    {Object.values(checkedTasks).filter(Boolean).length} / {TASKS.length}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: '#e8e0cc' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(Object.values(checkedTasks).filter(Boolean).length / TASKS.length) * 100}%`,
                      background: '#ffcc10',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
