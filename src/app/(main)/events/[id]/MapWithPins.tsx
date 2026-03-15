'use client';

import { useState, useCallback } from 'react';
import Map, { NavigationControl } from 'react-map-gl/mapbox';
import FlyerHeatmap from '@/components/map/FlyerHeatmap';
import PinDropper from '@/components/map/PinDropper';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MapLayerMouseEvent } from 'mapbox-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapWithPinsProps {
  campaignId: string;
  pins: { lat: number; lng: number }[];
  center: { lat: number; lng: number };
  onPinAdded: (pin: { lat: number; lng: number }) => void;
}

export default function MapWithPins({ campaignId, pins, center, onPinAdded }: MapWithPinsProps) {
  const [clickedPoint, setClickedPoint] = useState<{ lat: number; lng: number } | null>(null);

  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    setClickedPoint({ lat: e.lngLat.lat, lng: e.lngLat.lng });
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="relative h-[400px] overflow-hidden rounded-xl border border-gray-200 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
        Map unavailable. Set NEXT_PUBLIC_MAPBOX_TOKEN in your environment.
      </div>
    );
  }

  return (
    <div className="relative h-[400px] overflow-hidden rounded-xl border border-gray-200">
      <Map
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: 14,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN!}
        onClick={handleClick}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <FlyerHeatmap pins={pins} />
        <PinDropper
          campaignId={campaignId}
          onPinAdded={onPinAdded}
          clickedPoint={clickedPoint}
        />
      </Map>
    </div>
  );
}
