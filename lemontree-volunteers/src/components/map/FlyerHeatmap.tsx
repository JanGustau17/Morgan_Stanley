'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface FlyerHeatmapProps {
  pins: { lat: number; lng: number }[];
}

export default function FlyerHeatmap({ pins }: FlyerHeatmapProps) {
  const map = useMap();

  useEffect(() => {
    if (pins.length === 0) return;

    const points: L.HeatLatLngTuple[] = pins.map((p) => [p.lat, p.lng, 1]);

    const heat = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
    });

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, pins]);

  return null;
}
