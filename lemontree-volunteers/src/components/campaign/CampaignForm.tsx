'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const campaignSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  neighborhood: z.string().min(1, 'Neighborhood is required'),
  campaign_date: z.string().min(1, 'Date is required'),
  location_name: z.string().min(1, 'Location name is required'),
  lat: z.coerce.number({ error: 'Latitude is required' }),
  lng: z.coerce.number({ error: 'Longitude is required' }),
  target_group: z.enum(['families', 'students', 'seniors']),
  language: z.enum(['en', 'es']),
  volunteers_needed: z.coerce
    .number()
    .min(1, 'At least 1 volunteer needed')
    .max(50, 'Maximum 50 volunteers'),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const STEPS = ['Event Details', 'Target & Language', 'Location', 'Review'] as const;

export function CampaignForm() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema) as never,
    defaultValues: {
      language: 'en',
      target_group: 'families',
      volunteers_needed: 5,
      lat: 0,
      lng: 0,
    },
  });

  const fieldsPerStep: (keyof CampaignFormData)[][] = [
    ['name', 'campaign_date', 'neighborhood', 'location_name'],
    ['target_group', 'language', 'volunteers_needed'],
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
      router.push(`/events/${campaign.id}`);
    } catch {
      setSubmitting(false);
    }
  }

  const values = getValues();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                i <= step
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 ${
                  i < step ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-sm font-medium text-gray-600">
        {STEPS[step]}
      </p>

      {/* Step 1: Event Details */}
      {step === 0 && (
        <div className="space-y-4">
          <Input
            label="Campaign Name"
            placeholder="e.g. Spring Food Drive Outreach"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Date"
            type="date"
            error={errors.campaign_date?.message}
            {...register('campaign_date')}
          />
          <Input
            label="Neighborhood"
            placeholder="e.g. East Harlem"
            error={errors.neighborhood?.message}
            {...register('neighborhood')}
          />
          <Input
            label="Location Name"
            placeholder="e.g. Community Center on 5th Ave"
            error={errors.location_name?.message}
            {...register('location_name')}
          />
        </div>
      )}

      {/* Step 2: Target & Language */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="w-full">
            <label
              htmlFor="target_group"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Target Group
            </label>
            <select
              id="target_group"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              {...register('target_group')}
            >
              <option value="families">Families</option>
              <option value="students">Students</option>
              <option value="seniors">Seniors</option>
            </select>
            {errors.target_group && (
              <p className="mt-1.5 text-sm text-red-600">
                {errors.target_group.message}
              </p>
            )}
          </div>

          <div className="w-full">
            <label
              htmlFor="language"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Flyer Language
            </label>
            <select
              id="language"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              {...register('language')}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>
            {errors.language && (
              <p className="mt-1.5 text-sm text-red-600">
                {errors.language.message}
              </p>
            )}
          </div>

          <Input
            label="Volunteers Needed"
            type="number"
            min={1}
            max={50}
            error={errors.volunteers_needed?.message}
            {...register('volunteers_needed')}
          />
        </div>
      )}

      {/* Step 3: Location */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Enter the coordinates for the flyering location. A map picker will
            be available in a future update.
          </p>
          <Input
            label="Latitude"
            type="number"
            step="any"
            placeholder="e.g. 40.7945"
            error={errors.lat?.message}
            {...register('lat')}
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            placeholder="e.g. -73.9380"
            error={errors.lng?.message}
            {...register('lng')}
          />
        </div>
      )}

      {/* Step 4: Review */}
      {step === 3 && (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-5">
          <h3 className="font-semibold text-gray-900">Review Your Campaign</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="font-medium text-gray-500">Name</dt>
            <dd className="text-gray-900">{values.name}</dd>

            <dt className="font-medium text-gray-500">Date</dt>
            <dd className="text-gray-900">{values.campaign_date}</dd>

            <dt className="font-medium text-gray-500">Neighborhood</dt>
            <dd className="text-gray-900">{values.neighborhood}</dd>

            <dt className="font-medium text-gray-500">Location</dt>
            <dd className="text-gray-900">{values.location_name}</dd>

            <dt className="font-medium text-gray-500">Target Group</dt>
            <dd className="capitalize text-gray-900">{values.target_group}</dd>

            <dt className="font-medium text-gray-500">Language</dt>
            <dd className="uppercase text-gray-900">{values.language}</dd>

            <dt className="font-medium text-gray-500">Volunteers</dt>
            <dd className="text-gray-900">{values.volunteers_needed}</dd>

            <dt className="font-medium text-gray-500">Coordinates</dt>
            <dd className="text-gray-900">
              {values.lat}, {values.lng}
            </dd>
          </dl>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={goBack}>
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={goNext}>
            Next
          </Button>
        ) : (
          <Button type="submit" loading={submitting}>
            Create Campaign
          </Button>
        )}
      </div>
    </form>
  );
}
