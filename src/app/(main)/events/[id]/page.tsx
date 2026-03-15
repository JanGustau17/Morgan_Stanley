import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { auth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { VolunteerList } from '@/components/campaign/VolunteerList';
import { QRCode } from '@/components/campaign/QRCode';
import { ShareButtons } from '@/components/social/ShareButtons';
import { FlyerPreview } from '@/components/campaign/FlyerPreview';
import { EventPageClient } from './EventPageClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
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

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: campaign } = await supabase.from('campaigns').select('*').eq('id', id).single();
  if (!campaign) notFound();

  const { data: volunteerRows } = await supabase
    .from('campaign_volunteers')
    .select('volunteer_id, volunteers(id, name, avatar_url)')
    .eq('campaign_id', id);

  const volunteers = (volunteerRows ?? [])
    .map((row: Record<string, unknown>) => row.volunteers)
    .filter(Boolean) as { id: string; name: string | null; avatar_url: string | null }[];

  const { data: flyerPins } = await supabase.from('flyer_pins').select('lat, lng').eq('campaign_id', id);

  const session = await auth();
  const volunteerId = session?.user
    ? ((session.user as unknown as Record<string, unknown>).volunteerId as string | undefined)
    : undefined;

  const alreadyJoined = volunteerId ? volunteers.some((v) => v.id === volunteerId) : false;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const eventUrl = `${baseUrl}/events/${id}`;
  const hasFlyer = campaign.lat != null && campaign.lng != null && campaign.location_name;
  const fillPct = Math.min(100, (volunteers.length / campaign.volunteers_needed) * 100);

  return (
    <div className="relative left-1/2 -translate-x-1/2 w-screen mt-[60px]" style={{ background: '#fff6E0' }}>

      {/* Map + event header + flyer coverage (client) */}
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
        campaignName={campaign.name}
        campaignDate={campaign.campaign_date ?? null}
        locationName={campaign.location_name ?? null}
        volunteersCount={volunteers.length}
        volunteersNeeded={campaign.volunteers_needed}
        status={campaign.status}
        language={campaign.language ?? 'en'}
      />

      {/* Single-column content */}
      <div className="mx-auto max-w-3xl space-y-5 px-4 pb-10">

        {/* Volunteers */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: '#e8e0cc' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: '#101726', fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Volunteers
            </h2>
            <span className="text-sm font-semibold" style={{ color: '#008A81' }}>
              {volunteers.length} / {campaign.volunteers_needed} joined
            </span>
          </div>
          <div className="mb-5 h-1.5 overflow-hidden rounded-full" style={{ background: '#e8e0cc' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${fillPct}%`, background: '#008A81' }}
            />
          </div>
          <VolunteerList volunteers={volunteers} />
        </section>

        {/* Spread the Word */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: '#e8e0cc' }}>
          <h2 className="mb-5 text-lg font-semibold" style={{ color: '#101726', fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Spread the Word
          </h2>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex-1">
              <ShareButtons url={eventUrl} title={`Join "${campaign.name}" on Lemontree!`} />
            </div>
            <div className="shrink-0 flex flex-col items-center gap-2">
              <QRCode campaignId={id} volunteerId={volunteerId} />
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#101726', opacity: 0.4 }}>
                Scan to join
              </p>
            </div>
          </div>
        </section>

        {/* Event Flyer */}
        {hasFlyer && (
          <section className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: '#e8e0cc' }}>
            <h2 className="mb-1 text-lg font-semibold" style={{ color: '#101726', fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Event Flyer
            </h2>
            <p className="mb-4 text-sm" style={{ color: '#101726', opacity: 0.6 }}>
              Share or print this to spread the word.
            </p>
            <FlyerPreview
              lat={campaign.lat}
              lng={campaign.lng}
              locationName={campaign.location_name}
              lang={campaign.language ?? 'en'}
              campaignId={id}
            />
          </section>
        )}
      </div>

      {/* Full-width coordination CTA */}
      <div className="px-4 py-12" style={{ background: '#008A81' }}>
        <div className="mx-auto max-w-3xl flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Event Day
            </p>
            <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Ready to coordinate?
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Manage your team and track flyer coverage in real time.
            </p>
          </div>
          <Link
            href={`/events/${id}/coordination`}
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold shadow-lg transition-colors hover:bg-[#fff6E0]"
            style={{ color: '#101726' }}
          >
            Go to Coordination Page
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
