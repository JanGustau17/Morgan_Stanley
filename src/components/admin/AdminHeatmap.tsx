'use client';

import Map from 'react-map-gl/mapbox';
import FlyerHeatmap from '@/components/map/FlyerHeatmap';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface AdminHeatmapProps {
  center: { lat: number; lng: number };
  conversions: { lat: number; lng: number }[];
}

export default function AdminHeatmap({ center, conversions }: AdminHeatmapProps) {
  return (
    <Map
      initialViewState={{
        longitude: center.lng,
        latitude: center.lat,
        zoom: 11,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
      scrollZoom={false}
    >
      <FlyerHeatmap pins={conversions} />
    </Map>
  );
}
