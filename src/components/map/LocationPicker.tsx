'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import type { MapMouseEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, MapPin, Loader2, X } from 'lucide-react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Suggestion {
  id: string;
  text: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

interface LocationPickerProps {
  initialQuery: string;
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ initialQuery, lat, lng, onChange }: LocationPickerProps) {
  const hasCoords = lat !== 0 || lng !== 0;

  const [viewState, setViewState] = useState({
    longitude: hasCoords ? lng : -74.006,
    latitude: hasCoords ? lat : 40.7128,
    zoom: hasCoords ? 15 : 12,
  });
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(
    hasCoords ? { lat, lng } : null,
  );

  // ── Search state ──
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // ── Initial geocode (seeds the pin from step-1 values, once) ──
  const geocodedQueryRef = useRef<string>('');
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (!initialQuery || !MAPBOX_TOKEN) return;
    if (hasCoords) return;
    if (geocodedQueryRef.current === initialQuery) return;

    geocodedQueryRef.current = initialQuery;
    setGeocoding(true);

    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(initialQuery)}.json` +
        `?access_token=${MAPBOX_TOKEN}&limit=1&types=place,neighborhood,address,poi`,
    )
      .then((r) => r.json())
      .then((data) => {
        const feature = data.features?.[0];
        if (feature) {
          const [geoLng, geoLat] = feature.center as [number, number];
          setMarkerPos({ lat: geoLat, lng: geoLng });
          setViewState({ longitude: geoLng, latitude: geoLat, zoom: 14 });
          onChange(geoLat, geoLng);
        }
      })
      .catch(() => {})
      .finally(() => setGeocoding(false));
  }, [initialQuery, hasCoords, onChange]);

  // ── Sync marker when manual lat/lng inputs change ──
  const prevLatRef = useRef(lat);
  const prevLngRef = useRef(lng);
  useEffect(() => {
    const latChanged = lat !== prevLatRef.current;
    const lngChanged = lng !== prevLngRef.current;
    prevLatRef.current = lat;
    prevLngRef.current = lng;
    if ((latChanged || lngChanged) && (lat !== 0 || lng !== 0)) {
      setMarkerPos({ lat, lng });
      setViewState((v) => ({ ...v, longitude: lng, latitude: lat, zoom: Math.max(v.zoom, 13) }));
    }
  }, [lat, lng]);

  // ── Close suggestions on outside click ──
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // ── Debounced autocomplete fetch ──
  function handleSearchInput(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (!MAPBOX_TOKEN) return;
      setSearching(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json` +
            `?access_token=${MAPBOX_TOKEN}&limit=5&types=place,neighborhood,address,poi`,
        );
        const data = await res.json();
        const features: Suggestion[] = (data.features ?? []).map((f: {
          id: string;
          text: string;
          place_name: string;
          center: [number, number];
        }) => ({
          id: f.id,
          text: f.text,
          place_name: f.place_name,
          center: f.center,
        }));
        setSuggestions(features);
        setShowSuggestions(features.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  function handleSelect(suggestion: Suggestion) {
    const [sLng, sLat] = suggestion.center;
    setMarkerPos({ lat: sLat, lng: sLng });
    setViewState({ longitude: sLng, latitude: sLat, zoom: 15 });
    onChange(sLat, sLng);
    setQuery(suggestion.place_name);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.lngLat;
      setMarkerPos({ lat: clickLat, lng: clickLng });
      onChange(clickLat, clickLng);
    },
    [onChange],
  );

  const handleDrag = useCallback(
    (e: { lngLat: { lat: number; lng: number } }) => {
      const { lat: dLat, lng: dLng } = e.lngLat;
      setMarkerPos({ lat: dLat, lng: dLng });
      onChange(dLat, dLng);
    },
    [onChange],
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
        Map unavailable — set NEXT_PUBLIC_MAPBOX_TOKEN
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* ── Search box ── */}
      <div ref={searchContainerRef} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search for an address or place…"
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
          {searching && (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-gray-400" />
          )}
          {!searching && query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); }}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                onClick={() => handleSelect(s)}
                className="flex w-full items-start gap-2.5 border-b border-gray-50 px-4 py-3 text-left last:border-0 hover:bg-green-50 transition-colors"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{s.text}</div>
                  <div className="text-xs text-gray-500 truncate">{s.place_name}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Map ── */}
      <div className="relative h-96 overflow-hidden rounded-xl border border-gray-200">
        {geocoding && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow">
              <Loader2 className="h-4 w-4 animate-spin text-green-600" />
              Finding location…
            </div>
          </div>
        )}

        <Map
          {...viewState}
          onMove={(e) => setViewState(e.viewState)}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          onClick={handleMapClick}
          cursor="crosshair"
        >
          <NavigationControl position="top-right" showCompass={false} />

          {markerPos && (
            <Marker
              longitude={markerPos.lng}
              latitude={markerPos.lat}
              anchor="bottom"
              draggable
              onDrag={handleDrag}
              onDragEnd={handleDrag}
            />
          )}
        </Map>

        {!markerPos && !geocoding && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-600 shadow">
            <MapPin className="mr-1 inline h-3 w-3 text-green-600" />
            Search above or click map to place pin
          </div>
        )}

        {markerPos && (
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow">
            {markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}
          </div>
        )}

        {markerPos && (
          <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1.5 text-xs text-gray-500 shadow">
            Drag to adjust
          </div>
        )}
      </div>
    </div>
  );
}
