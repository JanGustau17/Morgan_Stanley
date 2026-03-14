'use client';

import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface EventMapProps {
  lat: number;
  lng: number;
  locationName: string;
}

export default function EventMap({ lat, lng, locationName }: EventMapProps) {
  const [showPopup, setShowPopup] = useState(true);

  return (
    <div className="h-[400px] overflow-hidden rounded-xl border border-gray-200">
      <Map
        initialViewState={{ longitude: lng, latitude: lat, zoom: 15 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        scrollZoom={false}
      >
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
