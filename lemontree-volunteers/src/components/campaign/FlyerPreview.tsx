'use client';

import { useState } from 'react';

interface FlyerPreviewProps {
  lat: number;
  lng: number;
  locationName: string;
  lang: string;
  campaignId: string;
}

export function FlyerPreview({
  lat,
  lng,
  locationName,
  lang,
  campaignId,
}: FlyerPreviewProps) {
  const [loading, setLoading] = useState(true);

  const src = `/api/flyer?lat=${lat}&lng=${lng}&locationName=${encodeURIComponent(locationName)}&lang=${lang}&ref=${campaignId}`;

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-600" />
            <p className="text-sm text-gray-500">Loading flyer preview…</p>
          </div>
        </div>
      )}
      <iframe
        src={src}
        title="Flyer Preview"
        className="aspect-[8.5/11] w-full"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
