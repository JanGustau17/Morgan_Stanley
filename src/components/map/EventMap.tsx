'use client';

import { useState } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface FoodBankPin {
  id: string;
  name: string | null;
  lat: number;
  lng: number;
  type: 'FOOD_PANTRY' | 'SOUP_KITCHEN';
  address: string | null;
}

interface EventMapProps {
  lat: number;
  lng: number;
  locationName: string;
  containerClassName?: string;
  foodBanks?: FoodBankPin[];
}

export default function EventMap({ lat, lng, locationName, containerClassName = 'h-[400px] overflow-hidden rounded-xl border border-gray-200', foodBanks = [] }: EventMapProps) {
  const [showPopup, setShowPopup] = useState(true);
  const [activeFoodBank, setActiveFoodBank] = useState<string | null>(null);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`${containerClassName} flex items-center justify-center bg-gray-100 text-gray-500 text-sm`}>
        Map unavailable. Set NEXT_PUBLIC_MAPBOX_TOKEN in your environment.
      </div>
    );
  }

  return (
    <div className={containerClassName} style={{ position: 'relative' }}>
      {foodBanks.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 10, left: 10, zIndex: 10,
          background: 'rgba(255,255,255,0.92)', borderRadius: 8,
          padding: '6px 10px', fontSize: 11, boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#16a34a', display: 'inline-block', border: '1.5px solid white' }} />
            <span style={{ color: '#374151' }}>Food Pantry</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f97316', display: 'inline-block', border: '1.5px solid white' }} />
            <span style={{ color: '#374151' }}>Soup Kitchen</span>
          </div>
        </div>
      )}
      <Map
        initialViewState={{ longitude: lng, latitude: lat, zoom: 15 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN!}
        scrollZoom
      >
        <NavigationControl position="top-right" showCompass={false} />
        <Marker
          longitude={lng}
          latitude={lat}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setShowPopup(true);
          }}
        />
        {showPopup && (
          <Popup
            longitude={lng}
            latitude={lat}
            anchor="top"
            onClose={() => setShowPopup(false)}
            closeOnClick={false}
          >
            <span className="font-medium">{locationName}</span>
          </Popup>
        )}

        {foodBanks.map((fb) => (
          <Marker
            key={fb.id}
            longitude={fb.lng}
            latitude={fb.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setActiveFoodBank(activeFoodBank === fb.id ? null : fb.id);
            }}
          >
            <div
              title={fb.name ?? ''}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: fb.type === 'SOUP_KITCHEN' ? '#f97316' : '#16a34a',
                border: '2.5px solid white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              {fb.type === 'SOUP_KITCHEN' ? '🍲' : '🥦'}
            </div>
          </Marker>
        ))}

        {foodBanks.map((fb) =>
          activeFoodBank === fb.id ? (
            <Popup
              key={`popup-${fb.id}`}
              longitude={fb.lng}
              latitude={fb.lat}
              anchor="top"
              onClose={() => setActiveFoodBank(null)}
              closeOnClick={false}
            >
              <div style={{ maxWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{fb.name}</div>
                {fb.address && <div style={{ fontSize: 11, color: '#555' }}>{fb.address}</div>}
                <div style={{ fontSize: 11, marginTop: 3, color: fb.type === 'SOUP_KITCHEN' ? '#f97316' : '#16a34a', fontWeight: 600 }}>
                  {fb.type === 'SOUP_KITCHEN' ? 'Soup Kitchen' : 'Food Pantry'}
                </div>
              </div>
            </Popup>
          ) : null,
        )}
      </Map>
    </div>
  );
}
