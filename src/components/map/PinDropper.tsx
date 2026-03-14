'use client';

import { useRef, useState, useEffect } from 'react';
import { Marker, Popup } from 'react-map-gl/mapbox';
import { Camera, MapPin, Loader2, ImageIcon } from 'lucide-react';
import exifr from 'exifr';
import { uploadFile } from '@/lib/supabase/upload';

interface PinDropperProps {
  campaignId: string;
  onPinAdded: (pin: { lat: number; lng: number }) => void;
  clickedPoint: { lat: number; lng: number } | null;
}

export default function PinDropper({ campaignId, onPinAdded, clickedPoint }: PinDropperProps) {
  const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number } | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (clickedPoint) {
      setPendingPin(clickedPoint);
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  }, [clickedPoint]);

  async function handleConfirm() {
    if (!pendingPin) return;
    setSaving(true);

    let photoUrl: string | null = null;

    if (photoFile) {
      setUploading(true);
      try {
        photoUrl = await uploadFile('flyer-photos', campaignId, photoFile);
      } catch {
        // Upload failed, continue without photo
      } finally {
        setUploading(false);
      }
    }

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/flyer-pins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: pendingPin.lat,
          lng: pendingPin.lng,
          photo_url: photoUrl,
        }),
      });

      if (res.ok) {
        onPinAdded({ lat: pendingPin.lat, lng: pendingPin.lng });
        resetState();
      }
    } catch {
      onPinAdded({ lat: pendingPin.lat, lng: pendingPin.lng });
      resetState();
    } finally {
      setSaving(false);
    }
  }

  function resetState() {
    setPendingPin(null);
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  function handleCancel() {
    resetState();
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));

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

              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Flyer photo"
                  className="h-16 w-full rounded object-cover"
                />
              )}

              {!photoFile && (
                <label className="flex cursor-pointer items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200">
                  <ImageIcon className="h-3 w-3" />
                  Attach photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleConfirm}
                  disabled={saving}
                  className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {uploading ? 'Uploading\u2026' : 'Saving\u2026'}
                    </span>
                  ) : (
                    'Confirm'
                  )}
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
