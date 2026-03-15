'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Download, ArrowLeftRight, Loader2 } from 'lucide-react';
import QRCodeLib from 'qrcode';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Shift {
  startTime: string;
  endTime: string;
  recurrencePattern: string | null;
}

interface Resource {
  id: string;
  name: string | null;
  addressStreet1: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  resourceType: { id: 'FOOD_PANTRY' | 'SOUP_KITCHEN'; name: string };
  contacts: { phone: string }[];
  shifts: Shift[];
  travelSummary?: { distance: number | null };
  usageLimitCount: number | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_NAMES: Record<string, string> = {
  MO: 'Monday', TU: 'Tuesday', WE: 'Wednesday', TH: 'Thursday',
  FR: 'Friday', SA: 'Saturday', SU: 'Sunday',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).toLowerCase();
}

function metersToMiles(m: number): string {
  return (m / 1609.34).toFixed(2) + ' mi.';
}

function parseRecurrence(rrule: string): string {
  const parts = Object.fromEntries(rrule.split(';').map((p) => p.split('=')));
  const weekly = (parts.FREQ ?? '').toUpperCase() === 'WEEKLY';
  const days = (parts.BYDAY ?? '').split(',').map((d: string) => DAY_NAMES[d]).filter(Boolean);
  if (!days.length) return '';
  return `${weekly ? 'every week on' : 'on'} ${days.join(', ')}`;
}

function getScheduleLines(shifts: Shift[]): string[] {
  return shifts.slice(0, 3).map((s) => {
    const time = `${formatTime(s.startTime)}–${formatTime(s.endTime)}`;
    const recur = s.recurrencePattern ? parseRecurrence(s.recurrencePattern) : '';
    return recur ? `${time}\n${recur}` : time;
  });
}

// ─── QR Code Hook ─────────────────────────────────────────────────────────────

function useQRCode(url: string) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!url) return;
    QRCodeLib.toDataURL(url, {
      width: 280,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(setDataUrl)
      .catch(() => {});
  }, [url]);
  return dataUrl;
}

// ─── Flyer Mockup — all inline styles so html2canvas captures correctly ────────

export const FLYER_PRINT_ID = 'lemontree-flyer-printable';

interface FlyerMockupProps {
  locationName: string;
  resources: (Resource | null)[];
  date: string;
  qrDataUrl: string | null;
}

export function FlyerMockup({ locationName, resources, date, qrDataUrl }: FlyerMockupProps) {
  const slots = [...resources, null, null, null, null].slice(0, 4);

  return (
    <div
      id={FLYER_PRINT_ID}
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        width: '100%',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '22px 24px 14px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 34, fontStyle: 'italic', color: '#111827', letterSpacing: '-0.5px', lineHeight: 1 }}>
          lemontree
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 7 }}>
          Free Food Near {locationName || 'Your Location'}
        </div>
      </div>

      {/* 2×2 resource grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 10 }}>
        {slots.map((r, i) => (
          <div key={i} style={{ background: '#f3f4f6', borderRadius: 8, padding: '12px 14px', minHeight: 155 }}>
            {r ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#111827', lineHeight: 1.4, marginBottom: 6 }}>
                  {r.name}
                </div>
                {r.addressStreet1 && (
                  <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5 }}>
                    {r.addressStreet1}<br />
                    {[r.city, r.state, r.zipCode].filter(Boolean).join(', ')}
                  </div>
                )}
                {r.contacts[0]?.phone && (
                  <div style={{ fontSize: 11, color: '#374151', marginTop: 3 }}>{r.contacts[0].phone}</div>
                )}
                {r.travelSummary?.distance != null && (
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{metersToMiles(r.travelSummary.distance)}</div>
                )}
                {r.usageLimitCount != null && (
                  <div style={{ fontSize: 11, color: '#6b7280' }}>
                    {r.usageLimitCount} requirement{r.usageLimitCount !== 1 ? 's' : ''} appl{r.usageLimitCount !== 1 ? 'y' : 'ies'}
                  </div>
                )}
                <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', marginTop: 8, marginBottom: 3 }}>
                  {r.resourceType.id === 'SOUP_KITCHEN' ? 'Free Meals:' : 'Free Groceries:'}
                </div>
                {getScheduleLines(r.shifts).map((line, j) => (
                  <div key={j} style={{ fontSize: 11, color: '#374151', lineHeight: 1.5, whiteSpace: 'pre-line', marginBottom: 1 }}>
                    {line}
                  </div>
                ))}
              </>
            ) : (
              <div style={{ color: '#d1d5db', fontSize: 11 }}>—</div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', gap: 16, padding: '10px 14px 16px', alignItems: 'flex-start', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ flexShrink: 0 }}>
          {qrDataUrl ? (
            <img src={qrDataUrl} width={110} height={110} alt="QR Code" style={{ display: 'block' }} />
          ) : (
            <div style={{ width: 110, height: 110, background: '#f3f4f6' }} />
          )}
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.65, paddingTop: 2 }}>
          <div style={{ color: '#111827', fontWeight: 500 }}>
            Scan to view full details about each resource, including reviews and wait times!
          </div>
          <div style={{ marginTop: 6 }}>
            This flyer was generated on <span style={{ textDecoration: 'underline' }}>{date}</span>. Free food
            resources change schedules &amp; requirements often. For up-to-date information &amp; more food access tools, visit:
          </div>
          <div style={{ color: '#16a34a', fontWeight: 700, fontSize: 12, marginTop: 5 }}>
            foodhelpline.org
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PDF Download ─────────────────────────────────────────────────────────────

async function downloadAsPDF(locationName: string) {
  const el = document.getElementById(FLYER_PRINT_ID);
  if (!el) return;

  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  // Clone the element so we can strip card styling without touching the live DOM
  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.cssText = [
    'width: 680px',
    'position: absolute',
    'left: -9999px',
    'top: 0',
    'border-radius: 0',
    'border: none',
    'box-shadow: none',
    'background: #ffffff',
  ].join('; ');
  document.body.appendChild(clone);

  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    width: clone.scrollWidth,
    height: clone.scrollHeight,
    windowWidth: clone.scrollWidth,
  });

  document.body.removeChild(clone);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;

  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;

  // Scale to fit within page — no clipping
  const aspectRatio = canvas.width / canvas.height;
  let printW = maxW;
  let printH = printW / aspectRatio;

  if (printH > maxH) {
    printH = maxH;
    printW = printH * aspectRatio;
  }

  const offsetX = (pageW - printW) / 2;
  pdf.addImage(imgData, 'PNG', offsetX, margin, printW, printH);
  pdf.save(`flyer-${(locationName || 'food-resources').replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

// ─── Resource Slot Card ───────────────────────────────────────────────────────

function ResourceSlotCard({
  resource,
  slotIndex,
  alternatives,
  onSwap,
}: {
  resource: Resource | null;
  slotIndex: number;
  alternatives: Resource[];
  onSwap: (slotIndex: number, resource: Resource) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative rounded-lg border border-gray-200 bg-white px-3 py-2">
      {resource ? (
        <div className="pr-7">
          <div className="font-semibold text-xs text-gray-900 leading-tight line-clamp-2">{resource.name}</div>
          <div className="text-[11px] text-gray-500 mt-0.5 truncate">
            {[resource.addressStreet1, resource.city].filter(Boolean).join(', ')}
          </div>
          {resource.travelSummary?.distance != null && (
            <div className="text-[11px] text-gray-400">{metersToMiles(resource.travelSummary.distance)}</div>
          )}
          <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-px rounded-full ${
            resource.resourceType.id === 'SOUP_KITCHEN' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
          }`}>
            {resource.resourceType.id === 'SOUP_KITCHEN' ? 'Soup Kitchen' : 'Food Pantry'}
          </span>
        </div>
      ) : (
        <div className="text-[11px] text-gray-400 italic py-1">Empty slot</div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="absolute top-2 right-2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        title="Swap"
      >
        <ArrowLeftRight className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute top-8 right-0 z-30 w-64 rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Swap with nearby
          </div>
          <div className="max-h-56 overflow-y-auto">
            {alternatives.length === 0 ? (
              <div className="px-3 py-4 text-xs text-gray-400 text-center">No other resources available</div>
            ) : (
              alternatives.map((alt) => (
                <button
                  key={alt.id}
                  type="button"
                  onClick={() => { onSwap(slotIndex, alt); setOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="text-xs font-semibold text-gray-900 leading-tight">{alt.name}</div>
                  <div className="text-[11px] text-gray-500 truncate">{alt.addressStreet1}</div>
                  {alt.travelSummary?.distance != null && (
                    <div className="text-[11px] text-gray-400">{metersToMiles(alt.travelSummary.distance)}</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

interface FlyerStepProps {
  lat: number;
  lng: number;
  locationName: string;
  lang: string;
  volunteerId?: string;
  campaignId?: string;
}

export function FlyerStep({ lat, lng, locationName, lang: _lang, volunteerId, campaignId }: FlyerStepProps) {
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [selected, setSelected] = useState<(Resource | null)[]>([null, null, null, null]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric',
  });

  const qrUrl =
    campaignId && campaignId !== 'preview' && volunteerId
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${campaignId}?ref=${volunteerId}`
      : `https://www.foodhelpline.org/locations/${lat},${lng}`;

  const qrDataUrl = useQRCode(qrUrl);

  useEffect(() => {
    if (!lat || !lng || (lat === 0 && lng === 0)) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    fetch(`/api/resources/nearby?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error || !Array.isArray(data.resources)) {
          setError(
            data.upstream === 422
              ? 'No food resources found near this location. Try different coordinates.'
              : 'Could not load nearby food resources. Check your coordinates.',
          );
          return;
        }
        const resources: Resource[] = data.resources;
        setAllResources(resources);
        const soups = resources.filter((r) => r.resourceType.id === 'SOUP_KITCHEN');
        const pantries = resources.filter((r) => r.resourceType.id === 'FOOD_PANTRY');
        const auto = [...soups.slice(0, 1), ...pantries.slice(0, 3)].slice(0, 4);
        setSelected([...auto, null, null, null, null].slice(0, 4) as (Resource | null)[]);
      })
      .catch(() => setError('Could not load nearby food resources. Check your coordinates.'))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  const handleSwap = useCallback((slotIndex: number, resource: Resource) => {
    setSelected((prev) => { const next = [...prev]; next[slotIndex] = resource; return next; });
  }, []);

  const getAlternatives = (slotIndex: number) => {
    const otherIds = new Set(selected.filter((r, i) => i !== slotIndex && r).map((r) => r!.id));
    return allResources.filter((r) => !otherIds.has(r.id));
  };

  const handleDownload = async () => {
    setDownloading(true);
    try { await downloadAsPDF(locationName || 'flyer'); }
    finally { setDownloading(false); }
  };

  if (!lat || !lng || (lat === 0 && lng === 0)) {
    return (
      <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50 p-8 text-center">
        <p className="text-sm font-semibold text-orange-700">No location set</p>
        <p className="text-xs text-orange-600 mt-1">Go back to the Location step and enter your campaign coordinates.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-sm text-gray-500">Finding nearby food resources…</p>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">{error}</div>;
  }

  return (
    <div id="flyer-step-container" className="flex gap-4 items-stretch">

      {/* ── Left: flyer preview ── */}
      <div className="flex-1 min-w-0">
        <FlyerMockup locationName={locationName} resources={selected} date={today} qrDataUrl={qrDataUrl} />
      </div>

      {/* ── Right: customize + download, stretches to match flyer height ── */}
      <div className="w-44 flex flex-col gap-2 shrink-0">

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">Customize</span>
          <span className="text-[11px] text-gray-400">{allResources.length} nearby</span>
        </div>

        {/* 4 resource cards — flex-1 so they fill the space above the button */}
        <div className="flex flex-col gap-1.5 flex-1">
          {selected.map((r, i) => (
            <ResourceSlotCard key={i} resource={r} slotIndex={i} alternatives={getAlternatives(i)} onSwap={handleSwap} />
          ))}
        </div>

        {/* Download button pinned to the bottom */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || !qrDataUrl}
          className="flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 w-full"
          style={{ background: '#101726' }}
        >
          {downloading ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
          ) : (
            <><Download className="h-3.5 w-3.5" /> Download PDF</>
          )}
        </button>

      </div>
    </div>
  );
}
