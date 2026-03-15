'use client';

import { useState } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface EventMapProps {
  lat: number;
  lng: number;
  locationName: string;
  containerClassName?: string;
}

export default function EventMap({ lat, lng, locationName, containerClassName = 'h-[400px] overflow-hidden rounded-xl border border-gray-200' }: EventMapProps) {
  const [showPopup, setShowPopup] = useState(true);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`${containerClassName} flex items-center justify-center bg-gray-100 text-gray-500 text-sm`}>
        Map unavailable. Set NEXT_PUBLIC_MAPBOX_TOKEN in your environment.
      </div>
    );
  }

  return (
    <div className={containerClassName}>
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
      </Map>
    </div>
  );
}
