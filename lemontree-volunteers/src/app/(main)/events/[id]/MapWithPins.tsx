'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import FlyerHeatmap from '@/components/map/FlyerHeatmap';
import PinDropper from '@/components/map/PinDropper';
import 'leaflet/dist/leaflet.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapWithPinsProps {
  campaignId: string;
  pins: { lat: number; lng: number }[];
  center: { lat: number; lng: number };
  onPinAdded: (pin: { lat: number; lng: number }) => void;
}

export default function MapWithPins({ campaignId, pins, center, onPinAdded }: MapWithPinsProps) {
  return (
    <div className="relative h-[400px] overflow-hidden rounded-xl border border-gray-200">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyerHeatmap pins={pins} />
        <PinDropper campaignId={campaignId} onPinAdded={onPinAdded} />
      </MapContainer>
    </div>
  );
}
