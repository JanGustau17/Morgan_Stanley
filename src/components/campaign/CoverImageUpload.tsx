'use client';

import { useRef, useCallback, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp';

interface CoverImageUploadProps {
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  uploading?: boolean;
  disabled?: boolean;
}

export function CoverImageUpload({
  previewUrl,
  onFileSelect,
  onRemove,
  uploading = false,
  disabled = false,
}: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = useCallback(
    (file: File) => {
      if (!file.type.match(/^image\/(jpeg|png|webp)$/i)) {
        return { error: 'Please use JPEG, PNG, or WebP.' };
      }
      if (file.size > MAX_SIZE_BYTES) {
        return { error: `Image must be under ${MAX_SIZE_MB} MB.` };
      }
      onFileSelect(file);
      return { error: null };
    },
    [onFileSelect]
  );

  const [validationError, setValidationError] = useState<string | null>(null);
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValidationError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const result = validateAndSet(file);
    if (result.error) setValidationError(result.error);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setValidationError(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const result = validateAndSet(file);
    if (result.error) setValidationError(result.error);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">
        Cover image <span className="font-normal text-gray-400">(optional)</span>
      </p>
      <p className="text-xs text-gray-500">
        Recommended 16:9, min 800×450. Looks best on mobile and social shares.
      </p>

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <img
            src={previewUrl}
            alt="Cover preview"
            className="h-40 w-full object-cover sm:h-48"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/20" />
          <div className="absolute right-2 top-2 flex gap-2">
            {!disabled && (
              <>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-full bg-white/90 p-2 text-gray-700 shadow hover:bg-white disabled:opacity-50"
                  aria-label="Replace image"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={uploading}
                  className="rounded-full bg-white/90 p-2 text-gray-700 shadow hover:bg-white disabled:opacity-50"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-sm font-medium text-white">Uploading…</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`flex min-h-[140px] sm:min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/80 px-4 py-6 transition-colors hover:border-green-400 hover:bg-green-50/80 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 ${
            disabled ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-500">
            <ImageIcon className="h-6 w-6" />
          </div>
          <span className="text-center text-sm font-medium text-gray-600">
            Drag and drop an image, or <span className="text-green-600">browse</span>
          </span>
          <span className="text-xs text-gray-400">JPEG, PNG or WebP, up to {MAX_SIZE_MB} MB</span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleInputChange}
            className="sr-only"
            disabled={disabled}
          />
        </label>
      )}

      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}
    </div>
  );
}
