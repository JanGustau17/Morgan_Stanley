'use client';

import { useEffect, useState } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  campaignId: string;
  volunteerId?: string;
}

export function QRCode({ campaignId, volunteerId }: QRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `${window.location.origin}/join/${campaignId}${volunteerId ? '?ref=' + volunteerId : ''}`;

    QRCodeLib.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(setDataUrl)
      .catch(() => setError('Failed to generate QR code'));
  }, [campaignId, volunteerId]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div className="flex h-[200px] w-[200px] items-center justify-center rounded-lg bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="Campaign QR Code"
      width={200}
      height={200}
      className="rounded-lg"
    />
  );
}
