'use client';

import { useEffect, useState } from 'react';
import QRCodeLib from 'qrcode';
import { Button } from '@/components/ui/Button';

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
      color: { dark: '#166534', light: '#ffffff' },
    })
      .then(setDataUrl)
      .catch(() => setError('Failed to generate QR code'));
  }, [campaignId, volunteerId]);

  function handleDownload() {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr-${campaignId}.png`;
    link.click();
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div className="flex h-[300px] w-[300px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <img
        src={dataUrl}
        alt="Campaign QR Code"
        width={300}
        height={300}
        className="rounded-lg border border-gray-200"
      />
      <Button variant="outline" size="sm" onClick={handleDownload}>
        Download QR Code
      </Button>
    </div>
  );
}
