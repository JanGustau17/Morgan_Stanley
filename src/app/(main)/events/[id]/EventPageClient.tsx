'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { UserPlus, CheckCircle2, CalendarDays, MapPin, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { FoodBankPin } from '@/components/map/EventMap';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const EventMap = dynamic(() => import('@/components/map/EventMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse" style={{ background: '#e8e0cc' }} />,
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

const statusBadgeStyle: Record<string, React.CSSProperties> = {
  active:    { background: '#ffcc1022', color: '#7a5f00' },
  upcoming:  { background: '#f0f0ee',   color: '#888'    },
  completed: { background: '#f0f0ee',   color: '#aaa'    },
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
  const [joined, setJoined]     = useState(alreadyJoined);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [pins, setPins]         = useState(initialPins);
  const [foodBanks, setFoodBanks] = useState<FoodBankPin[]>([]);

  useEffect(() => {
    if (!mapCenter || !MAPBOX_TOKEN) return;
    const { lat, lng } = mapCenter;

    fetch(`/api/resources/nearby?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (!Array.isArray(data.resources)) return;
        const top4 = data.resources.slice(0, 4) as Array<{
          id: string;
          name: string | null;
          addressStreet1: string | null;
          city: string | null;
          state: string | null;
          zipCode: string | null;
          resourceType: { id: 'FOOD_PANTRY' | 'SOUP_KITCHEN' };
        }>;

        const pins = await Promise.all(
          top4.map(async (r) => {
            const addr = [r.addressStreet1, r.city, r.state, r.zipCode]
              .filter(Boolean)
              .join(', ');
            if (!addr) return null;
            try {
              const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addr)}.json` +
                  `?access_token=${MAPBOX_TOKEN}&limit=1&types=address,poi`,
              );
              const geo = await res.json();
              const [fbLng, fbLat] = geo.features?.[0]?.center ?? [];
              if (fbLat == null || fbLng == null) return null;
              return {
                id: r.id,
                name: r.name,
                lat: fbLat,
                lng: fbLng,
                type: r.resourceType.id,
                address: addr,
              } satisfies FoodBankPin;
            } catch {
              return null;
            }
          }),
        );

        setFoodBanks(pins.filter((p): p is FoodBankPin => p !== null));
      })
      .catch(() => {});
  }, [mapCenter]);

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
      {/* Full-bleed map */}
      <div className="h-[400px] w-full overflow-hidden">
        {mapCenter ? (
          <EventMap
            lat={mapCenter.lat}
            lng={mapCenter.lng}
            locationName={mapCenter.name}
            containerClassName="h-full w-full"
            foodBanks={foodBanks}
          />
        ) : (
          <div className="h-full w-full" style={{ background: '#e8e0cc' }} />
        )}
      </div>

      {/* Event header */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
            style={statusBadgeStyle[status] ?? statusBadgeStyle.upcoming}
          >
            {status}
          </span>
          {language !== 'en' && (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ background: '#5C3D8F22', color: '#5C3D8F' }}
            >
              {language.toUpperCase()}
            </span>
          )}
        </div>

        <h1
          className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: '#101726', fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {campaignName}
        </h1>

        <div className="mb-6 flex flex-wrap gap-4 text-sm" style={{ color: '#101726', opacity: 0.6 }}>
          {campaignDate && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 shrink-0" style={{ color: '#008A81' }} />
              {formatDate(campaignDate)}
            </span>
          )}
          {locationName && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" style={{ color: '#008A81' }} />
              {locationName}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 shrink-0" style={{ color: '#008A81' }} />
            {volunteersCount} / {volunteersNeeded} volunteers
          </span>
        </div>

        {joined ? (
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
            style={{ background: '#008A8115', color: '#008A81' }}
          >
            <CheckCircle2 className="h-5 w-5" />
            You&apos;ve joined this event!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleJoin}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
              style={{ background: '#5C3D8F' }}
            >
              {loading
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                : <UserPlus className="h-5 w-5" />}
              Join This Event
            </button>
            {error && <p className="text-sm" style={{ color: '#e53e3e' }}>{error}</p>}
          </div>
        )}
      </div>

      {/* Flyer coverage map (joined volunteers only) */}
      {joined && (
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: '#e8e0cc' }}>
            <h2
              className="mb-1 text-lg font-semibold"
              style={{ color: '#101726', fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Flyer Coverage
            </h2>
            <p className="mb-4 text-sm" style={{ color: '#101726', opacity: 0.6 }}>
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
