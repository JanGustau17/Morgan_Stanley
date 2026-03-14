import { Leaf } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { CampaignFilters } from '@/components/campaign/CampaignFilters';
import type { CampaignWithVolunteers } from '@/lib/types';

export default async function HomePage() {
  let typedCampaigns: CampaignWithVolunteers[] = [];
  const volunteerCounts: Record<string, number> = {};

  try {
    const supabase = createServiceClient();

    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .order('campaign_date', { ascending: false });

    const { data: volunteerRows } = await supabase
      .from('campaign_volunteers')
      .select('campaign_id');

    if (volunteerRows) {
      for (const row of volunteerRows) {
        volunteerCounts[row.campaign_id] =
          (volunteerCounts[row.campaign_id] ?? 0) + 1;
      }
    }

    typedCampaigns = (campaigns as CampaignWithVolunteers[]) ?? [];
  } catch {
    // Supabase not configured yet -- show empty state
  }

  return (
    <>
      <section className="-mx-4 -mt-8 mb-10 bg-gradient-to-br from-green-600 via-green-500 to-emerald-400 px-4 py-16 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            🍋 Lemontree
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-green-50 max-w-xl mx-auto">
            Connecting food-insecure families to free food resources through
            community flyering.
          </p>
        </div>
      </section>

      {typedCampaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Leaf className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No campaigns yet</p>
          <p className="text-sm mt-1">
            Be the first to create a flyering campaign!
          </p>
        </div>
      ) : (
        <CampaignFilters
          campaigns={typedCampaigns}
          volunteerCounts={volunteerCounts}
        />
      )}
    </>
  );
}
