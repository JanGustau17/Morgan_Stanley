'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FlyerStep } from '@/components/campaign/FlyerStep';
import { NeighborhoodAutocomplete } from '@/components/campaign/NeighborhoodAutocomplete';
import type { DraftPayload } from '@/app/api/campaigns/draft/route';

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
  location_name: z.string().min(1, 'Location name is required'),
  lat: z.coerce.number({ error: 'Latitude is required' }),
  lng: z.coerce.number({ error: 'Longitude is required' }),
  language: z.enum(['en', 'es', 'zh', 'ar', 'fr', 'ht']),
  volunteers_needed: z.coerce
    .number()
    .min(1, 'At least 1 volunteer needed')
    .max(50, 'Maximum 50 volunteers'),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const STEPS = ['Details', 'Location', 'Flyer'] as const;

const LANGUAGES = [
  { id: 'en' as const, label: 'English' },
  { id: 'es' as const, label: 'Spanish' },
  { id: 'zh' as const, label: 'Chinese' },
  { id: 'ar' as const, label: 'Arabic' },
  { id: 'fr' as const, label: 'French' },
  { id: 'ht' as const, label: 'Haitian Creole' },
];

export function CampaignForm({ volunteerId }: { volunteerId?: string }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
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
      volunteers_needed: 5,
      lat: 0,
      lng: 0,
    },
  });

  const watchedLanguage = watch('language');
  const watchedLat = watch('lat');
  const watchedLng = watch('lng');
  const watchedLocationName = watch('location_name');
  const watchedNeighborhood = watch('neighborhood');

  // Load draft on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/campaigns/draft');
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const draft: DraftPayload | null = data.draft ?? null;
        if (!draft || cancelled) { setDraftLoaded(true); return; }
        if (draft.step != null) setStep(Math.min(draft.step, STEPS.length - 1));
        if (draft.name != null) setValue('name', draft.name);
        if (draft.campaign_date != null) setValue('campaign_date', draft.campaign_date);
        if (draft.neighborhood != null) setValue('neighborhood', draft.neighborhood);
        if (draft.location_name != null) setValue('location_name', draft.location_name);
        if (draft.lat != null) setValue('lat', draft.lat);
        if (draft.lng != null) setValue('lng', draft.lng);
        if (draft.language != null) setValue('language', draft.language as CampaignFormData['language']);
        if (draft.volunteers_needed != null) setValue('volunteers_needed', draft.volunteers_needed);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setDraftLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [setValue]);

  const fieldsPerStep: (keyof CampaignFormData)[][] = [
    ['name', 'campaign_date', 'neighborhood', 'location_name', 'language', 'volunteers_needed'],
    ['lat', 'lng'],
    [],
  ];

  async function goNext() {
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function saveDraft() {
    setSavingDraft(true);
    try {
      const values = getValues();
      await fetch('/api/campaigns/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          name: values.name,
          campaign_date: values.campaign_date,
          neighborhood: values.neighborhood,
          location_name: values.location_name,
          lat: values.lat,
          lng: values.lng,
          language: values.language,
          volunteers_needed: values.volunteers_needed,
        }),
      });
    } catch {
      // ignore
    } finally {
      setSavingDraft(false);
    }
  }

  async function onSubmit(data: CampaignFormData) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create campaign');
      }
      const campaign = await res.json();
      await fetch('/api/campaigns/draft', { method: 'DELETE' });
      router.push(`/events/${campaign.id}`);
    } catch {
      setSubmitting(false);
    }
  }

  if (!draftLoaded) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" aria-label="Loading" />
      </div>
    );
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {/* Step indicator */}
      <div className="relative flex justify-between">
        {/* connector lines */}
        {STEPS.map((_, i) =>
          i < STEPS.length - 1 ? (
            <div
              key={`line-${i}`}
              className={`absolute top-4 h-0.5 transition-colors ${i < step ? 'bg-[#5C3D8F]' : 'bg-[#101726]/10'}`}
              style={{
                left: `${(i + 0.5) * (100 / STEPS.length)}%`,
                right: `${(STEPS.length - i - 1.5) * (100 / STEPS.length)}%`,
              }}
            />
          ) : null
        )}
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1.5 z-10" style={{ width: `${100 / STEPS.length}%` }}>
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i < step
                  ? 'bg-[#5C3D8F] text-white cursor-pointer'
                  : i === step
                    ? 'bg-[#5C3D8F]/10 text-[#5C3D8F] border-2 border-[#5C3D8F]'
                    : 'bg-[#101726]/8 text-[#101726]/30'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </button>
            <span className={`text-[11px] font-medium ${i <= step ? 'text-[#5C3D8F]' : 'text-[#101726]/30'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1 — Details */}
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
            <Input
              label="Volunteers Needed *"
              type="number"
              min={1}
              max={50}
              error={errors.volunteers_needed?.message}
              {...register('volunteers_needed')}
            />
          </div>
          <NeighborhoodAutocomplete
            value={watchedNeighborhood ?? ''}
            onChange={(v) => setValue('neighborhood', v, { shouldValidate: true })}
            placeholder="e.g. East Harlem"
            error={errors.neighborhood?.message}
            label="Neighborhood *"
          />
          <Input
            label="Location Name *"
            placeholder="e.g. Community Center on 5th Ave"
            error={errors.location_name?.message}
            {...register('location_name')}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Flyer Language</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setValue('language', lang.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-all ${
                    watchedLanguage === lang.id
                      ? 'bg-[#5C3D8F] text-white border-[#5C3D8F]'
                      : 'bg-white text-gray-600 border-[#101726]/15 hover:border-[#5C3D8F]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Location */}
      {step === 1 && (
        <div className="space-y-2">
          <LocationPicker
            initialQuery={[watchedLocationName, watchedNeighborhood].filter(Boolean).join(', ')}
            lat={watchedLat ?? 0}
            lng={watchedLng ?? 0}
            onChange={(lat, lng) => {
              setValue('lat', lat, { shouldValidate: true });
              setValue('lng', lng, { shouldValidate: true });
            }}
          />
          {(errors.lat || errors.lng) && (
            <p className="text-sm text-red-600">Please place a pin on the map to set the location.</p>
          )}
        </div>
      )}

      {/* Step 3 — Flyer */}
      {step === 2 && (
        <FlyerStep
          lat={watchedLat ?? 0}
          lng={watchedLng ?? 0}
          locationName={watchedLocationName ?? ''}
          lang={watchedLanguage ?? 'en'}
          volunteerId={volunteerId}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={goBack}>← Back</Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={saveDraft}
            disabled={savingDraft || submitting}
          >
            {savingDraft ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Saving…</> : 'Save draft'}
          </Button>
        </div>

        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={goNext}>Next →</Button>
        ) : (
          <Button type="button" loading={submitting} onClick={() => handleSubmit(onSubmit)()}>
            🚀 Create Campaign
          </Button>
        )}
      </div>
    </form>
  );
}
