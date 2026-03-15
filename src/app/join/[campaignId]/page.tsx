import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/server';

interface JoinPageProps {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export default async function JoinPage({ params, searchParams }: JoinPageProps) {
  const { campaignId } = await params;
  const { ref } = await searchParams;

  if (ref) {
    try {
      const supabase = createServiceClient();
      const headersList = await headers();

      const ip =
        headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        headersList.get('x-real-ip') ??
        'unknown';

      const today = new Date().toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('scan_logs')
        .select('id')
        .eq('volunteer_id', ref)
        .eq('ip_address', ip)
        .eq('scan_date', today)
        .single();

      if (!existing) {
        await supabase.from('scan_logs').insert({
          volunteer_id: ref,
          campaign_id: campaignId,
          ip_address: ip,
          scan_date: today,
          scan_type: 'qr_scan',
        });

        await supabase.from('point_events').insert({
          volunteer_id: ref,
          campaign_id: campaignId,
          event_type: 'qr_signup',
          points: 50,
        });

        await supabase.rpc('increment_points', {
          volunteer_id_input: ref,
          points_input: 50,
        });
      }
    } catch {
      // Silently fail — visitor still gets redirected
    }
  }

  const target = ref
    ? `/events/${campaignId}?ref=${encodeURIComponent(ref)}`
    : `/events/${campaignId}`;

  redirect(target);
}