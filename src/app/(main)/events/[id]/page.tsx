import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, MapPin, Users, ArrowRight } from 'lucide-react';
import { auth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { VolunteerList } from '@/components/campaign/VolunteerList';
import { QRCode } from '@/components/campaign/QRCode';
import { ShareButtons } from '@/components/social/ShareButtons';
import { EventPageClient } from './EventPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('name, neighborhood')
    .eq('id', id)
    .single();

  if (!campaign) return { title: 'Event Not Found' };

  return {
    title: `${campaign.name} | Lemontree`,
    description: `Join the flyering event in ${campaign.neighborhood ?? 'your area'}`,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (!campaign) notFound();

  const { data: volunteerRows } = await supabase
    .from('campaign_volunteers')
    .select('volunteer_id, volunteers(id, name, avatar_url)')
    .eq('campaign_id', id);

  const volunteers = (volunteerRows ?? [])
    .map((row: Record<string, unknown>) => row.volunteers)
    .filter(Boolean) as { id: string; name: string | null; avatar_url: string | null }[];

  const { data: flyerPins } = await supabase
    .from('flyer_pins')
    .select('lat, lng')
    .eq('campaign_id', id);

  const session = await auth();
  const volunteerId = session?.user
    ? ((session.user as unknown as Record<string, unknown>).volunteerId as string | undefined)
    : undefined;

  const alreadyJoined = volunteerId
    ? volunteers.some((v) => v.id === volunteerId)
    : false;

  const statusVariant = campaign.status === 'active'
    ? 'active' as const
    : campaign.status === 'completed'
      ? 'completed' as const
      : 'upcoming' as const;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const eventUrl = `${baseUrl}/events/${id}`;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Cover Image */}
      {campaign.cover_image_url && (
        <div className="relative h-48 w-full overflow-hidden rounded-xl sm:h-64">
          <Image
            src={campaign.cover_image_url}
            alt={campaign.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
          />
        </div>
      )}

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant} size="sm">
                {campaign.status}
              </Badge>
              {campaign.language !== 'en' && (
                <Badge variant="level" size="sm">
                  {campaign.language.toUpperCase()}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {campaign.name}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {campaign.campaign_date && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-green-600" />
              {formatDate(campaign.campaign_date)}
            </div>
          )}
          {campaign.location_name && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-green-600" />
              {campaign.location_name}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-green-600" />
            {volunteers.length} / {campaign.volunteers_needed} volunteers
          </div>
        </div>
      </div>

      {/* Join Button + Map (client) */}
      <EventPageClient
        campaignId={id}
        alreadyJoined={alreadyJoined}
        isSignedIn={!!session?.user}
        pins={flyerPins ?? []}
        mapCenter={
          campaign.lat != null && campaign.lng != null
            ? { lat: campaign.lat, lng: campaign.lng, name: campaign.location_name ?? campaign.name }
            : null
        }
      />

      {/* Volunteers */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Volunteers</h2>
        <VolunteerList volunteers={volunteers} />
      </section>

      {/* Share & QR */}
      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Spread the Word</h2>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex-1">
            <ShareButtons
              url={eventUrl}
              title={`Join "${campaign.name}" on Lemontree!`}
              description={`Help distribute food resource flyers in ${campaign.neighborhood ?? 'your community'}.`}
            />
          </div>
          <div className="shrink-0">
            <QRCode campaignId={id} volunteerId={volunteerId} />
          </div>
        </div>
      </section>

      {/* Coordination Link */}
      <div className="flex justify-center pb-4">
        <Link
          href={`/events/${id}/coordination`}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
        >
          Go to Coordination Page
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
