'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2 } from 'lucide-react';
import { uploadFile } from '@/lib/supabase/upload';
import { cn, getInitials } from '@/lib/utils';

interface AvatarUploadProps {
  currentUrl: string | null;
  name: string | null;
  volunteerId: string;
}

export function AvatarUpload({ currentUrl, name, volunteerId }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile('avatars', volunteerId, file);

      const res = await fetch('/api/profile/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: url }),
      });

      if (res.ok) {
        setAvatarUrl(url);
      }
    } catch {
      // Upload failed silently
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="relative">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name ?? 'Avatar'}
          width={80}
          height={80}
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div
          className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-600 text-2xl font-medium text-white"
          aria-label={name ?? 'Avatar'}
        >
          {getInitials(name ?? null)}
        </div>
      )}

      <label
        className={cn(
          'absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white shadow-md ring-2 ring-white transition-colors hover:bg-gray-50',
          uploading && 'pointer-events-none',
        )}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        ) : (
          <Camera className="h-4 w-4 text-gray-600" />
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}
