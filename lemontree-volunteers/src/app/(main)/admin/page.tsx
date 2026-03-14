import { redirect } from 'next/navigation';
import { Shield } from 'lucide-react';
import { auth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as Record<string, unknown> | undefined)?.role;
  if (role !== 'admin') redirect('/');

  const supabase = createServiceClient();

  const [
    { count: campaignsCount },
    { count: conversionsCount },
    { data: flyersData },
    { count: volunteersCount },
    { data: conversionsWithGeo },
    { data: campaignsRaw },
  ] = await Promise.all([
    supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('conversions')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('campaigns')
      .select('flyers_count'),
    supabase
      .from('volunteers')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('conversions')
      .select('lat, lng')
      .not('lat', 'is', null)
      .not('lng', 'is', null),
    supabase
      .from('campaigns')
      .select(`
        id,
        name,
        neighborhood,
        campaign_date,
        status,
        flyers_count,
        organizer_id,
        organizer:volunteers!campaigns_organizer_id_fkey(id, name, email, avatar_url)
      `)
      .order('campaign_date', { ascending: false }),
  ]);

  const totalFlyers = (flyersData ?? []).reduce(
    (sum, c) => sum + (c.flyers_count ?? 0),
    0
  );

  const campaignIds = (campaignsRaw ?? []).map((c) => c.id);

  let volunteerCounts: Record<string, number> = {};
  let conversionCounts: Record<string, number> = {};

  if (campaignIds.length > 0) {
    const { data: cvData } = await supabase
      .from('campaign_volunteers')
      .select('campaign_id');

    if (cvData) {
      volunteerCounts = cvData.reduce<Record<string, number>>((acc, row) => {
        acc[row.campaign_id] = (acc[row.campaign_id] || 0) + 1;
        return acc;
      }, {});
    }

    const { data: convData } = await supabase
      .from('conversions')
      .select('campaign_id');

    if (convData) {
      conversionCounts = convData.reduce<Record<string, number>>((acc, row) => {
        acc[row.campaign_id] = (acc[row.campaign_id] || 0) + 1;
        return acc;
      }, {});
    }
  }

  const campaigns = (campaignsRaw ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
    neighborhood: c.neighborhood as string | null,
    campaign_date: c.campaign_date as string | null,
    status: c.status as string,
    flyers_count: c.flyers_count as number,
    organizer_name:
      ((c.organizer as unknown as Record<string, unknown> | null)?.name as string | null) ??
      ((c.organizer as unknown as Record<string, unknown> | null)?.email as string | null) ??
      'Unknown',
    volunteer_count: volunteerCounts[c.id as string] ?? 0,
    conversion_count: conversionCounts[c.id as string] ?? 0,
  }));

  const conversions = (conversionsWithGeo ?? []).map((c) => ({
    lat: c.lat as number,
    lng: c.lng as number,
  }));

  const metrics = {
    totalCampaigns: campaignsCount ?? 0,
    totalConversions: conversionsCount ?? 0,
    totalFlyers,
    totalVolunteers: volunteersCount ?? 0,
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-lg bg-green-100 p-2">
          <Shield className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">
            Platform overview and campaign management
          </p>
        </div>
      </div>

      <AdminDashboard
        metrics={metrics}
        campaigns={campaigns}
        conversions={conversions}
      />
    </div>
  );
}
