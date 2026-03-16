'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface LandingHeatmapProps {
  pins: { lat: number; lng: number }[];
}

export default function LandingHeatmap({ pins }: LandingHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: pins.length > 0
        ? [pins.reduce((s, p) => s + p.lng, 0) / pins.length,
           pins.reduce((s, p) => s + p.lat, 0) / pins.length]
        : [-74.006, 40.7128],
      zoom: pins.length > 0 ? 11 : 10,
      interactive: false,
      attributionControl: false,
      logoPosition: 'bottom-right',
    });

    mapRef.current = map;

    map.on('load', () => {
      const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: 'FeatureCollection',
        features: pins.map((p) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
          properties: {},
        })),
      };

      map.addSource('pins', { type: 'geojson', data: geojson });

      // Heatmap layer
      map.addLayer({
        id: 'pins-heat',
        type: 'heatmap',
        source: 'pins',
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': 1.5,
          'heatmap-radius': 40,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,   'rgba(0,0,0,0)',
            0.2, 'rgba(92,61,143,0.4)',
            0.5, 'rgba(0,138,129,0.75)',
            0.8, 'rgba(0,138,129,0.95)',
            1,   'rgba(0,100,95,1)',
          ],
          'heatmap-opacity': 0.9,
        },
      });


      // Fit to pins if there are any
      if (pins.length > 1) {
        const bounds = pins.reduce(
          (b, p) => b.extend([p.lng, p.lat]),
          new mapboxgl.LngLatBounds([pins[0].lng, pins[0].lat], [pins[0].lng, pins[0].lat]),
        );
        map.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 0 });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [pins]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
