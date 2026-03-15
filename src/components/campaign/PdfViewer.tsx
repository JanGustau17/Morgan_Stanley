'use client';

import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Use unpkg CDN for the worker — version is pinned to the installed package
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageDataUrls, setPageDataUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderPdf() {
      try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        const urls: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const containerWidth = containerRef.current?.clientWidth ?? 400;
          const viewport = page.getViewport({ scale: 1 });
          const scale = (containerWidth / viewport.width) * 2; // 2x for retina
          const scaledViewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;

          await page.render({ canvas, viewport: scaledViewport }).promise;
          if (cancelled) return;
          urls.push(canvas.toDataURL('image/png'));
        }

        setPageDataUrls(urls);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load PDF');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    renderPdf();
    return () => { cancelled = true; };
  }, [url]);

  if (loading) {
    return (
      <div ref={containerRef} className="flex aspect-[8.5/11] w-full items-center justify-center rounded-xl border border-violet-100 bg-[#f5f3ff]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-violet-600" />
          <p className="text-sm text-gray-500">Rendering flyer…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full overflow-hidden rounded-xl border border-violet-100 shadow-sm">
      {pageDataUrls.map((dataUrl, i) => (
        <img
          key={i}
          src={dataUrl}
          alt={`Flyer page ${i + 1}`}
          className="w-full block"
        />
      ))}
    </div>
  );
}
