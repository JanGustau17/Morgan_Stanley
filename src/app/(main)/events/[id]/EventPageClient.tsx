'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { UserPlus, CheckCircle2, CalendarDays, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

const EventMap = dynamic(() => import('@/components/map/EventMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-gray-200" />
  ),
});

const MapWithPins = dynamic(
  () => import('./MapWithPins'),
  { ssr: false }
);

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
  const [joined, setJoined] = useState(alreadyJoined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pins, setPins] = useState(initialPins);

  const statusVariant =
    status === 'active' ? 'active' as const
    : status === 'completed' ? 'completed' as const
    : 'upcoming' as const;

  async function handleJoin() {
    if (!isSignedIn) {
      router.push('/auth');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/join`, { method: 'POST' });
      if (res.status === 409) { setJoined(true); return; }
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? 'Failed to join');
        return;
      }
      setJoined(true);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handlePinAdded(pin: { lat: number; lng: number }) {
    setPins((prev) => [...prev, pin]);
  }

  return (
    <>
      {/* Full-bleed map hero */}
      <div className="relative h-[520px] w-full overflow-hidden">
        {mapCenter ? (
          <EventMap
            lat={mapCenter.lat}
            lng={mapCenter.lng}
            locationName={mapCenter.name}
            containerClassName="h-full w-full"
          />
        ) : (
          <div className="h-full w-full bg-violet-50" />
        )}

        {/* Overlay card */}
        <div className="absolute bottom-0 left-0 right-0 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm rounded-none sm:rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={statusVariant} size="sm">{status}</Badge>
            {language !== 'en' && (
              <Badge variant="level" size="sm" className="bg-violet-600">
                {language.toUpperCase()}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
            {campaignName}
          </h1>

          <div className="flex flex-col gap-1.5 text-sm text-gray-600 mb-5">
            {campaignDate && (
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 shrink-0 text-violet-600" />
                {formatDate(campaignDate)}
              </div>
            )}
            {locationName && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-violet-600" />
                {locationName}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 shrink-0 text-violet-600" />
              {volunteersCount} / {volunteersNeeded} volunteers
            </div>
          </div>

          {joined ? (
            <div className="inline-flex items-center gap-2 rounded-lg bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700">
              <CheckCircle2 className="h-5 w-5" />
              You&apos;ve joined this event!
            </div>
          ) : (
            <button
              onClick={handleJoin}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-violet-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Join This Event
            </button>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {/* Flyer Coverage Map (only for joined volunteers) */}
      {joined && (
        <section className="space-y-3 px-4 py-6 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900">Flyer Coverage</h2>
          <p className="text-sm text-gray-500">
            Click the map to drop a pin where you&apos;ve placed flyers, or upload a geotagged photo.
          </p>
          <MapWithPins
            campaignId={campaignId}
            pins={pins}
            center={mapCenter ?? { lat: 40.7128, lng: -74.006 }}
            onPinAdded={handlePinAdded}
          />
        </section>
      )}
    </>
  );
}
