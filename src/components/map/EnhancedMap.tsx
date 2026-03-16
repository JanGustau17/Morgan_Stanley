'use client';

import { useState, useEffect, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, GeolocateControl } from 'react-map-gl/mapbox';
import FlyerHeatmap from './FlyerHeatmap';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Resource {
  id?: string;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  distance?: number;
  type?: string;
}

interface EnhancedMapProps {
  lat: number;
  lng: number;
  locationName: string;
  containerClassName?: string;
  showResources?: boolean;
  showHeatmap?: boolean;
  flyerPins?: { lat: number; lng: number }[];
  campaigns?: { id: string; name: string; lat: number; lng: number; status: string; volunteer_count?: number }[];
  mapStyle?: 'streets' | 'satellite' | 'outdoors' | 'light' | 'dark';
}

const MAP_STYLES: Record<string, string> = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
};

export default function EnhancedMap({
  lat,
  lng,
  locationName,
  containerClassName = 'h-[450px] overflow-hidden rounded-2xl border border-gray-200 shadow-sm',
  showResources = false,
  showHeatmap = false,
  flyerPins = [],
  campaigns = [],
  mapStyle = 'streets',
}: EnhancedMapProps) {
  const [showPopup, setShowPopup] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<typeof campaigns[0] | null>(null);
  const [currentStyle, setCurrentStyle] = useState(mapStyle);
  const [loadingResources, setLoadingResources] = useState(false);

  const fetchResources = useCallback(async () => {
    if (!showResources || !lat || !lng) return;
    setLoadingResources(true);
    try {
      const res = await fetch(`/api/resources/nearby?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.resources)) {
          setResources(data.resources);
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingResources(false);
    }
  }, [showResources, lat, lng]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`${containerClassName} flex items-center justify-center bg-gray-100 text-gray-500 text-sm`}>
        Map unavailable. Set NEXT_PUBLIC_MAPBOX_TOKEN in your environment.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={containerClassName}>
        <Map
          initialViewState={{ longitude: lng, latitude: lat, zoom: 14 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAP_STYLES[currentStyle]}
          mapboxAccessToken={MAPBOX_TOKEN}
          scrollZoom
        >
          <NavigationControl position="top-right" showCompass />
          <FullscreenControl position="top-right" />
          <GeolocateControl position="top-right" trackUserLocation />

          {/* Main event marker */}
          <Marker
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setShowPopup(true);
              setSelectedResource(null);
              setSelectedCampaign(null);
            }}
          >
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#5C3D8F] border-3 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold animate-bounce">
                📍
              </div>
            </div>
          </Marker>

          {showPopup && (
            <Popup
              longitude={lng}
              latitude={lat}
              anchor="top"
              onClose={() => setShowPopup(false)}
              closeOnClick={false}
              className="rounded-xl"
            >
              <div className="px-1 py-0.5">
                <div className="font-bold text-sm text-gray-900">{locationName}</div>
                <div className="text-xs text-gray-500 mt-0.5">Event location</div>
              </div>
            </Popup>
          )}

          {/* Nearby resource markers */}
          {resources.map((r, i) => {
            const rLat = r.lat ?? r.latitude;
            const rLng = r.lng ?? r.longitude;
            if (!rLat || !rLng) return null;
            return (
              <Marker
                key={r.id || i}
                longitude={rLng}
                latitude={rLat}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedResource(r);
                  setSelectedCampaign(null);
                  setShowPopup(false);
                }}
              >
                <div className="w-7 h-7 rounded-full bg-[#008A81] border-2 border-white shadow-md flex items-center justify-center text-xs cursor-pointer hover:scale-110 transition-transform">
                  🍎
                </div>
              </Marker>
            );
          })}

          {/* Campaign markers */}
          {campaigns.map((c) => {
            if (!c.lat || !c.lng || (c.lat === lat && c.lng === lng)) return null;
            return (
              <Marker
                key={c.id}
                longitude={c.lng}
                latitude={c.lat}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedCampaign(c);
                  setSelectedResource(null);
                  setShowPopup(false);
                }}
              >
                <div className={`w-7 h-7 rounded-full border-2 border-white shadow-md flex items-center justify-center text-xs cursor-pointer hover:scale-110 transition-transform ${
                  c.status === 'active' ? 'bg-[#ffcc10]' : 'bg-gray-300'
                }`}>
                  📣
                </div>
              </Marker>
            );
          })}

          {/* Resource popup */}
          {selectedResource && (selectedResource.lat ?? selectedResource.latitude) && (
            <Popup
              longitude={(selectedResource.lng ?? selectedResource.longitude)!}
              latitude={(selectedResource.lat ?? selectedResource.latitude)!}
              anchor="top"
              onClose={() => setSelectedResource(null)}
              closeOnClick={false}
            >
              <div className="px-1 py-0.5 max-w-[200px]">
                <div className="font-bold text-sm text-gray-900">{selectedResource.name}</div>
                {selectedResource.address && (
                  <div className="text-xs text-gray-500 mt-0.5">{selectedResource.address}</div>
                )}
                {selectedResource.distance !== undefined && (
                  <div className="text-xs text-[#008A81] font-medium mt-1">
                    📏 {Number(selectedResource.distance).toFixed(1)} mi away
                  </div>
                )}
                {selectedResource.type && (
                  <div className="inline-block text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full mt-1">
                    {selectedResource.type}
                  </div>
                )}
              </div>
            </Popup>
          )}

          {/* Campaign popup */}
          {selectedCampaign && (
            <Popup
              longitude={selectedCampaign.lng}
              latitude={selectedCampaign.lat}
              anchor="top"
              onClose={() => setSelectedCampaign(null)}
              closeOnClick={false}
            >
              <div className="px-1 py-0.5 max-w-[200px]">
                <div className="font-bold text-sm text-gray-900">{selectedCampaign.name}</div>
                <div className={`inline-block text-xs px-1.5 py-0.5 rounded-full mt-1 ${
                  selectedCampaign.status === 'active' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedCampaign.status}
                </div>
                {selectedCampaign.volunteer_count !== undefined && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    👥 {selectedCampaign.volunteer_count} volunteers
                  </div>
                )}
              </div>
            </Popup>
          )}

          {/* Heatmap overlay */}
          {showHeatmap && <FlyerHeatmap pins={flyerPins} />}
        </Map>

        {/* Loading indicator for resources */}
        {loadingResources && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-[#008A81] border-t-transparent rounded-full animate-spin" />
            Finding resources…
          </div>
        )}
      </div>

      {/* Map controls bar */}
      <div className="flex items-center justify-between mt-3 gap-2">
        {/* Style switcher */}
        <div className="flex gap-1.5">
          {(['streets', 'satellite', 'outdoors', 'dark'] as const).map((style) => (
            <button
              key={style}
              onClick={() => setCurrentStyle(style)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
                currentStyle === style
                  ? 'bg-[#5C3D8F] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>

        {/* Legend */}
        {(showResources || campaigns.length > 0) && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#5C3D8F]" /> Event
            </span>
            {showResources && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#008A81]" /> Food Resource
              </span>
            )}
            {campaigns.length > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#ffcc10]" /> Campaign
              </span>
            )}
          </div>
        )}
      </div>

      {/* Nearby resources list */}
      {showResources && resources.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
            🍎 Nearby Food Resources
            <span className="text-xs font-normal text-gray-400">({resources.length} found)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {resources.slice(0, 6).map((r, i) => (
              <button
                key={r.id || i}
                onClick={() => {
                  setSelectedResource(r);
                  setShowPopup(false);
                  setSelectedCampaign(null);
                }}
                className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-100 bg-white hover:border-[#008A81]/30 hover:shadow-sm transition-all text-left min-h-[44px]"
              >
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 text-sm">
                  🍎
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">{r.name}</div>
                  {r.address && (
                    <div className="text-xs text-gray-500 truncate mt-0.5">{r.address}</div>
                  )}
                  {r.distance !== undefined && (
                    <div className="text-xs text-[#008A81] font-medium mt-0.5">
                      {Number(r.distance).toFixed(1)} mi
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
