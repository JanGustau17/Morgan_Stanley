'use client';

import dynamic from 'next/dynamic';
import { Download } from 'lucide-react';

const PdfViewer = dynamic(() => import('./PdfViewer').then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[8.5/11] w-full items-center justify-center rounded-xl border border-violet-100 bg-[#f5f3ff]">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-violet-600" />
        <p className="text-sm text-gray-500">Loading flyer…</p>
      </div>
    </div>
  ),
});

interface FlyerPreviewProps {
  lat: number;
  lng: number;
  locationName: string;
  lang: string;
  campaignId: string;
}

export function FlyerPreview({ lat, lng, locationName, lang, campaignId }: FlyerPreviewProps) {
  const flyerUrl = `/api/flyer?lat=${lat}&lng=${lng}&locationName=${encodeURIComponent(locationName)}&lang=${lang}&ref=${campaignId}`;

  return (
    <div>
      <PdfViewer url={flyerUrl} />
      <a
        href={flyerUrl}
        download={`flyer-${campaignId}.pdf`}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-950"
      >
        <Download className="h-4 w-4" />
        Download Flyer
      </a>
    </div>
  );
}
