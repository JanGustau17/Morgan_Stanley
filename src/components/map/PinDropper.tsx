'use client';

import { useRef, useState, useEffect } from 'react';
import { Marker, Popup } from 'react-map-gl/mapbox';
import { Camera, MapPin } from 'lucide-react';
import exifr from 'exifr';

interface PinDropperProps {
  campaignId: string;
  onPinAdded: (pin: { lat: number; lng: number }) => void;
  clickedPoint: { lat: number; lng: number } | null;
}

export default function PinDropper({ campaignId, onPinAdded, clickedPoint }: PinDropperProps) {
  const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (clickedPoint) {
      setPendingPin(clickedPoint);
    }
  }, [clickedPoint]);

  async function handleConfirm() {
    if (!pendingPin) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/flyer-pins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: pendingPin.lat, lng: pendingPin.lng }),
      });

      if (res.ok) {
        onPinAdded({ lat: pendingPin.lat, lng: pendingPin.lng });
        setPendingPin(null);
      }
    } catch {
      onPinAdded({ lat: pendingPin.lat, lng: pendingPin.lng });
      setPendingPin(null);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setPendingPin(null);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const gps = await exifr.gps(file);
      if (gps) {
        setPendingPin({ lat: gps.latitude, lng: gps.longitude });
      }
    } catch {
      // No GPS data in photo
    }

    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <>
      {pendingPin && (
        <>
          <Marker longitude={pendingPin.lng} latitude={pendingPin.lat} anchor="bottom" />
          <Popup
            longitude={pendingPin.lng}
            latitude={pendingPin.lat}
            anchor="top"
            onClose={handleCancel}
            closeOnClick={false}
          >
            <div className="flex flex-col gap-2 p-1">
              <p className="text-sm font-medium">Drop a flyer pin here?</p>
              <p className="text-xs text-gray-500">
                {pendingPin.lat.toFixed(5)}, {pendingPin.lng.toFixed(5)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirm}
                  disabled={saving}
                  className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving\u2026' : 'Confirm'}
                </button>
                <button
                  onClick={handleCancel}
                  className="rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Popup>
        </>
      )}

      <div className="absolute bottom-4 left-4 z-10 flex gap-2">
        <div className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-lg">
          <MapPin className="mr-1 inline h-3.5 w-3.5" />
          Click map to drop pin
        </div>

        <label className="cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-lg transition-colors hover:bg-gray-50">
          <Camera className="mr-1 inline h-3.5 w-3.5" />
          Upload Photo
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </label>
      </div>
    </>
  );
}
