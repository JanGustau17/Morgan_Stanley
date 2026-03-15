'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { uploadFile } from '@/lib/supabase/upload';
import { FlyerStep } from '@/components/campaign/FlyerStep';

const LocationPicker = dynamic(
  () => import('@/components/map/LocationPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
        <div className="h-5 w-5 animate-spin rounded-full border-4 border-gray-300 border-t-green-600" />
      </div>
    ),
  },
);

const campaignSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  neighborhood: z.string().min(1, 'Neighborhood is required'),
  campaign_date: z.string().min(1, 'Date is required'),
  campaign_time: z.string().optional(),
  location_name: z.string().min(1, 'Location name is required'),
  meeting_point: z.string().optional(),
  location_notes: z.string().optional(),
  description: z.string().optional(),
  lat: z.coerce.number({ error: 'Latitude is required' }),
  lng: z.coerce.number({ error: 'Longitude is required' }),
  target_group: z.enum(['families', 'students', 'seniors', 'general']),
  language: z.enum(['en', 'es', 'zh', 'ar', 'fr', 'ht']),
  volunteers_needed: z.coerce
    .number()
    .min(1, 'At least 1 volunteer needed')
    .max(50, 'Maximum 50 volunteers'),
  flyer_goal: z.coerce.number().min(1).optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const STEPS = ['Details', 'Audience', 'Location', 'Flyer', 'Review'] as const;

const TARGET_GROUPS = [
  { id: 'families' as const, label: 'Families', icon: '👨‍👩‍👧‍👦', desc: 'Parents & children' },
  { id: 'students' as const, label: 'Students', icon: '🎓', desc: 'College & high school' },
  { id: 'seniors' as const, label: 'Seniors', icon: '🧓', desc: 'Older adults 60+' },
  { id: 'general' as const, label: 'Everyone', icon: '🌍', desc: 'General community' },
];

const LANGUAGES = [
  { id: 'en' as const, label: 'English' },
  { id: 'es' as const, label: 'Spanish' },
  { id: 'zh' as const, label: 'Chinese' },
  { id: 'ar' as const, label: 'Arabic' },
  { id: 'fr' as const, label: 'French' },
  { id: 'ht' as const, label: 'Haitian Creole' },
];

function QRPlaceholder({ value, size = 120 }: { value: string; size?: number }) {
  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  };
  const grid = 21;
  const cell = size / grid;
  const h = hash(value || 'lemontree');
  const cells: React.ReactElement[] = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const isCorner = (r < 7 && c < 7) || (r < 7 && c >= grid - 7) || (r >= grid - 7 && c < 7);
      const isBorder =
        isCorner &&
        (r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= grid - 7 && (r === grid - 1 || r === grid - 7)) ||
          (c >= grid - 7 && (c === grid - 1 || c === grid - 7)));
      const isInner =
        (isCorner && r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
        (isCorner && r >= 2 && r <= 4 && c >= grid - 5 && c <= grid - 3) ||
        (isCorner && r >= grid - 5 && r <= grid - 3 && c >= 2 && c <= 4);
      const pseudoRand = ((h * (r + 1) * (c + 1) + r * 7 + c * 13) % 100) > 45;
      if (isBorder || isInner || (!isCorner && pseudoRand)) {
        cells.push(
          <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} rx={0.8} fill="#16a34a" />
        );
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" rx={8} />
      {cells}
    </svg>
  );
}

export function CampaignForm({ volunteerId }: { volunteerId?: string }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema) as never,
    defaultValues: {
      language: 'en',
      target_group: 'families',
      volunteers_needed: 5,
      lat: 0,
      lng: 0,
      flyer_goal: 200,
    },
  });

  const watchedTargetGroup = watch('target_group');
  const watchedLanguage = watch('language');
  const watchedLat = watch('lat');
  const watchedLng = watch('lng');
  const watchedLocationName = watch('location_name');
  const watchedNeighborhood = watch('neighborhood');

  const fieldsPerStep: (keyof CampaignFormData)[][] = [
    ['name', 'campaign_date', 'neighborhood', 'location_name'],
    ['target_group', 'language', 'volunteers_needed'],
    ['lat', 'lng'],
    [], // Flyer step — no form fields to validate
    [], // Review
  ];

  async function goNext() {
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function removeCover() {
    setCoverFile(null);
    setCoverPreview(null);
    if (coverRef.current) coverRef.current.value = '';
  }

  async function onSubmit(data: CampaignFormData) {
    setSubmitting(true);
    try {
      let cover_image_url: string | null = null;
      if (coverFile) {
        setCoverUploading(true);
        try {
          cover_image_url = await uploadFile('campaign-images', 'covers', coverFile);
        } catch {
          // Continue without cover image
        } finally {
          setCoverUploading(false);
        }
      }
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, cover_image_url }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create campaign');
      }
      const campaign = await res.json();
      router.push(`/events/${campaign.id}`);
    } catch {
      setSubmitting(false);
    }
  }

  const values = getValues();
  const eventSlug = (values.name || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
  const shareUrl = `foodhelpline.org/events/${eventSlug}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(`https://${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  i < step
                    ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700'
                    : i === step
                      ? 'bg-green-100 text-green-700 border-2 border-green-600'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </button>
              <span className={`text-xs font-medium ${i <= step ? 'text-green-700' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-3 mt-[-1.25rem] rounded ${i < step ? 'bg-green-600' : 'bg-gray-200'} transition-colors`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <Input
            label="Campaign Name *"
            placeholder="e.g. Spring Food Drive Outreach"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date *" type="date" error={errors.campaign_date?.message} {...register('campaign_date')} />
            <Input label="Time" type="time" {...register('campaign_time')} />
          </div>
          <Input
            label="Neighborhood *"
            placeholder="e.g. East Harlem"
            error={errors.neighborhood?.message}
            {...register('neighborhood')}
          />
          <Input
            label="Location Name *"
            placeholder="e.g. Community Center on 5th Ave"
            error={errors.location_name?.message}
            {...register('location_name')}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[80px] resize-y"
              placeholder="Tell volunteers what to expect..."
              {...register('description')}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Cover Image <span className="text-gray-400">(optional)</span>
            </label>
            {coverPreview ? (
              <div className="relative">
                <img src={coverPreview} alt="Cover preview" className="h-40 w-full rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-green-400 hover:bg-green-50">
                <ImagePlus className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload a cover image</span>
                <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
              </label>
            )}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Target Audience</label>
            <div className="grid grid-cols-2 gap-3">
              {TARGET_GROUPS.map((g) => {
                const selected = watchedTargetGroup === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setValue('target_group', g.id)}
                    className={`flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all ${
                      selected ? 'border-green-600 bg-green-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-1">{g.icon}</span>
                    <span className="text-sm font-bold text-gray-900">{g.label}</span>
                    <span className="text-xs text-gray-500 mt-0.5">{g.desc}</span>
                  </button>
                );
              })}
            </div>
            {errors.target_group && <p className="mt-1.5 text-sm text-red-600">{errors.target_group.message}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Flyer Language</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const selected = watchedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setValue('language', lang.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold border transition-all ${
                      selected ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
            {errors.language && <p className="mt-1.5 text-sm text-red-600">{errors.language.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Volunteers Needed"
              type="number"
              min={1}
              max={50}
              error={errors.volunteers_needed?.message}
              {...register('volunteers_needed')}
            />
            <Input label="Flyer Goal" type="number" min={1} placeholder="e.g. 200" {...register('flyer_goal')} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <LocationPicker
            initialQuery={[watchedLocationName, watchedNeighborhood].filter(Boolean).join(', ')}
            lat={watchedLat ?? 0}
            lng={watchedLng ?? 0}
            onChange={(lat, lng) => {
              setValue('lat', lat, { shouldValidate: true });
              setValue('lng', lng, { shouldValidate: true });
            }}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Latitude *" type="number" step="any" placeholder="e.g. 40.7945" error={errors.lat?.message} {...register('lat')} />
            <Input label="Longitude *" type="number" step="any" placeholder="e.g. -73.9380" error={errors.lng?.message} {...register('lng')} />
          </div>
          <Input label="Meeting Point" placeholder="e.g. Corner of 181st & Broadway" {...register('meeting_point')} />
          <Input label="Additional Notes" placeholder="e.g. Parking available on 182nd St" {...register('location_notes')} />
        </div>
      )}

      {step === 3 && (
        <FlyerStep
          lat={watchedLat ?? 0}
          lng={watchedLng ?? 0}
          locationName={watchedLocationName ?? ''}
          lang={watchedLanguage ?? 'en'}
          volunteerId={volunteerId}
        />
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-amber-50 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3">{values.name || 'Untitled Campaign'}</h3>
            <div className="grid gap-2 text-sm">
              {[
                ['📅', values.campaign_date ? `${values.campaign_date}${values.campaign_time ? ` at ${values.campaign_time}` : ''}` : 'No date set'],
                ['📍', `${values.location_name || '—'}, ${values.neighborhood || '—'}`],
                ['🏁', values.meeting_point || 'No meeting point set'],
                ['🎯', `Goal: ${values.flyer_goal || '—'} flyers`],
                ['👥', `${values.volunteers_needed} volunteers needed`],
                ['🌐', LANGUAGES.find((l) => l.id === values.language)?.label || 'English'],
                ['🫂', TARGET_GROUPS.find((g) => g.id === values.target_group)?.label || 'General'],
              ].map(([icon, text], i) => (
                <div key={i} className="flex items-center gap-3 text-gray-700">
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          {coverPreview && (
            <div>
              <p className="mb-1.5 text-sm font-medium text-gray-500">Cover Image</p>
              <img src={coverPreview} alt="Cover" className="h-32 w-full rounded-lg object-cover" />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Shareable Event Link</label>
            <div className="flex gap-2 items-center">
              <div className="flex-1 rounded-lg bg-gray-100 px-3 py-2.5 font-mono text-sm text-green-700 font-semibold truncate">{shareUrl}</div>
              <Button type="button" variant={copied ? 'primary' : 'outline'} size="md" onClick={handleCopy}>
                {copied ? '✓ Copied' : 'Copy'}
              </Button>
            </div>
          </div>
          <div className="flex gap-5 items-start">
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <QRPlaceholder value={shareUrl} size={100} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Volunteers can scan this QR code to RSVP instantly. Every scan is tracked for your impact metrics.
              </p>
              <Button type="button" variant="outline" size="sm">Download QR Code</Button>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Share on Social Media</label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'WhatsApp', emoji: '💬', bg: 'bg-green-50 text-green-700 border-green-200' },
                { name: 'Instagram', emoji: '📸', bg: 'bg-pink-50 text-pink-700 border-pink-200' },
                { name: 'X / Twitter', emoji: '🐦', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
                { name: 'Facebook', emoji: '👍', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
              ].map((s) => (
                <button
                  key={s.name}
                  type="button"
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:opacity-80 ${s.bg}`}
                >
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={goBack}>← Back</Button>
        ) : (
          <div />
        )}
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={goNext}>Next →</Button>
        ) : (
          <Button type="submit" loading={submitting}>
            {coverUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading image...
              </span>
            ) : (
              '🚀 Create Campaign'
            )}
          </Button>
        )}
      </div>
    </form>
  );
}