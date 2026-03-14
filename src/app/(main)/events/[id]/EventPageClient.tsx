'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { UserPlus, CheckCircle2, CalendarDays, MapPin, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const EventMap = dynamic(() => import('@/components/map/EventMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-gray-200" />,
});

const MapWithPins = dynamic(() => import('./MapWithPins'), { ssr: false });

interface EventPageClientProps {
  campaignId: string;
  alreadyJoined: boolean;
  isSignedIn: boolean;
  pins: { lat: number; lng: number }[];
  mapCenter: { lat: number; lng: number; name: string } | null;
  campaignName: string;
  campaignDate: string | null;
  locationName: string | null;
  volunteersCount: number;
  volunteersNeeded: number;
  status: string;
  language: string;
}

const statusBadgeClass: Record<string, string> = {
  active:    'bg-amber-100 text-amber-700',
  upcoming:  'bg-gray-100 text-gray-600',
  completed: 'bg-gray-100 text-gray-400',
};

export function EventPageClient({
  campaignId,
  alreadyJoined,
  isSignedIn,
  pins: initialPins,
  mapCenter,
  campaignName,
  campaignDate,
  locationName,
  volunteersCount,
  volunteersNeeded,
  status,
  language,
}: EventPageClientProps) {
  const router = useRouter();
  const [joined, setJoined]   = useState(alreadyJoined);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [pins, setPins]       = useState(initialPins);

  async function handleJoin() {
    if (!isSignedIn) { router.push('/auth'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/join`, { method: 'POST' });
      if (res.status === 409) { setJoined(true); return; }
      if (!res.ok) { setError((await res.json()).error ?? 'Failed to join'); return; }
      setJoined(true);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Full-bleed map — no overlay */}
      <div className="h-[400px] w-full overflow-hidden">
        {mapCenter ? (
          <EventMap
            lat={mapCenter.lat}
            lng={mapCenter.lng}
            locationName={mapCenter.name}
            containerClassName="h-full w-full"
          />
        ) : (
          <div className="h-full w-full bg-gray-100" />
        )}
      </div>

      {/* Event header — below the map */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass[status] ?? statusBadgeClass.upcoming}`}>
            {status}
          </span>
          {language !== 'en' && (
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              {language.toUpperCase()}
            </span>
          )}
        </div>

        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {campaignName}
        </h1>

        <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-500">
          {campaignDate && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 shrink-0 text-indigo-400" />
              {formatDate(campaignDate)}
            </span>
          )}
          {locationName && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-indigo-400" />
              {locationName}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 shrink-0 text-indigo-400" />
            {volunteersCount} / {volunteersNeeded} volunteers
          </span>
        </div>

        {joined ? (
          <div className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-5 py-3 text-sm font-semibold text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            You&apos;ve joined this event!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleJoin}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-900 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-indigo-950 disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
            >
              {loading
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                : <UserPlus className="h-5 w-5" />}
              Join This Event
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}
      </div>

      {/* Flyer coverage map (joined volunteers only) */}
      {joined && (
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold text-gray-900">Flyer Coverage</h2>
            <p className="mb-4 text-sm text-gray-500">
              Click the map to drop a pin where you&apos;ve placed flyers.
            </p>
            <MapWithPins
              campaignId={campaignId}
              pins={pins}
              center={mapCenter ?? { lat: 40.7128, lng: -74.006 }}
              onPinAdded={(pin) => setPins((p) => [...p, pin])}
            />
          </div>
        </div>
      )}
    </>
  );
}
