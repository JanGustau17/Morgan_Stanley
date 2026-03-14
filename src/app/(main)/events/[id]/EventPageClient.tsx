'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { UserPlus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const EventMap = dynamic(() => import('@/components/map/EventMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
    </div>
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
}

export function EventPageClient({
  campaignId,
  alreadyJoined,
  isSignedIn,
  pins: initialPins,
  mapCenter,
}: EventPageClientProps) {
  const router = useRouter();
  const [joined, setJoined] = useState(alreadyJoined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pins, setPins] = useState(initialPins);

  async function handleJoin() {
    if (!isSignedIn) {
      router.push('/auth');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/join`, {
        method: 'POST',
      });

      if (res.status === 409) {
        setJoined(true);
        return;
      }

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
      {/* Join Button */}
      <div>
        {joined ? (
          <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            You&apos;ve joined this event!
          </div>
        ) : (
          <Button onClick={handleJoin} loading={loading} size="lg">
            <UserPlus className="mr-2 h-5 w-5" />
            Join This Event
          </Button>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Meeting Point Map */}
      {mapCenter && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Location</h2>
          <EventMap lat={mapCenter.lat} lng={mapCenter.lng} locationName={mapCenter.name} />
        </section>
      )}

      {/* Flyer Pin Map */}
      {joined && (
        <section className="space-y-3">
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
