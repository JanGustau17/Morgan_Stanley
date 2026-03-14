'use client';

import Link from 'next/link';
import { MapPin, Calendar, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { Campaign } from '@/lib/types';

interface CampaignCardProps {
  campaign: Campaign;
  volunteerCount: number;
}

function statusVariant(status: string): 'active' | 'upcoming' | 'completed' {
  if (status === 'active') return 'active';
  if (status === 'upcoming') return 'upcoming';
  return 'completed';
}

export function CampaignCard({ campaign, volunteerCount }: CampaignCardProps) {
  return (
    <Link href={`/events/${campaign.id}`} className="block">
      <Card hover className="h-full">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {campaign.name}
            </h3>
            <Badge variant={statusVariant(campaign.status)} size="sm">
              {campaign.status}
            </Badge>
          </div>

          {campaign.neighborhood && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{campaign.neighborhood}</span>
            </div>
          )}

          {campaign.campaign_date && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{formatDate(campaign.campaign_date)}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              {volunteerCount} / {campaign.volunteers_needed} volunteers
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
