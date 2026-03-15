'use client';

import Map, { NavigationControl } from 'react-map-gl/mapbox';
import FlyerHeatmap from '@/components/map/FlyerHeatmap';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface AdminHeatmapProps {
  center: { lat: number; lng: number };
  conversions: { lat: number; lng: number }[];
}

export default function AdminHeatmap({ center, conversions }: AdminHeatmapProps) {
  if (!MAPBOX_TOKEN) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
        Map unavailable. Set NEXT_PUBLIC_MAPBOX_TOKEN in your environment.
      </div>
    );
  }

  return (
    <Map
      initialViewState={{
        longitude: center.lng,
        latitude: center.lat,
        zoom: 11,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN!}
      scrollZoom
    >
      <NavigationControl position="top-right" showCompass={false} />
      <FlyerHeatmap pins={conversions} />
    </Map>
  );
}
