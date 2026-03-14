'use client';

import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/mapbox';
import type { HeatmapLayer } from 'mapbox-gl';

interface FlyerHeatmapProps {
  pins: { lat: number; lng: number }[];
}

const heatmapLayerStyle: Omit<HeatmapLayer, 'id' | 'source'> = {
  type: 'heatmap',
  paint: {
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 17, 3],
    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 17, 25],
    'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 17, 0.6],
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(0,0,0,0)',
      0.2, 'rgb(103,169,207)',
      0.4, 'rgb(209,229,240)',
      0.6, 'rgb(253,219,199)',
      0.8, 'rgb(239,138,98)',
      1, 'rgb(178,24,43)',
    ],
  },
};

export default function FlyerHeatmap({ pins }: FlyerHeatmapProps) {
  const geojson = useMemo<GeoJSON.FeatureCollection>(() => ({
    type: 'FeatureCollection',
    features: pins.map((p) => ({
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
    })),
  }), [pins]);

  if (pins.length === 0) return null;

  return (
    <Source id="flyer-heat" type="geojson" data={geojson}>
      <Layer id="flyer-heatmap" {...heatmapLayerStyle} />
    </Source>
  );
}
