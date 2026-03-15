'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const FlyerStep = dynamic(
  () => import('./FlyerStep').then((m) => m.FlyerStep),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading flyer…
      </div>
    ),
  },
);

interface FlyerStepWrapperProps {
  lat: number;
  lng: number;
  locationName: string;
  lang: string;
  campaignId: string;
  volunteerId?: string;
}

export function FlyerStepWrapper(props: FlyerStepWrapperProps) {
  return <FlyerStep {...props} />;
}
