'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { haversineDistance } from '@/lib/utils';
import type { CampaignWithVolunteers } from '@/lib/types';

type FilterType = 'all' | 'active' | 'upcoming' | 'nearby';

interface CampaignFiltersProps {
  campaigns: CampaignWithVolunteers[];
  volunteerCounts: Record<string, number>;
  children: (filtered: CampaignWithVolunteers[], counts: Record<string, number>) => React.ReactNode;
}

export function CampaignFilters({
  campaigns,
  volunteerCounts,
  children,
}: CampaignFiltersProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [newestFirst, setNewestFirst] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (userLocation) {
      setFilter('nearby');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setFilter('nearby');
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      },
    );
  }, [userLocation]);

  useEffect(() => {
    if (filter === 'nearby' && !userLocation) {
      requestLocation();
    }
  }, [filter, userLocation, requestLocation]);

  const filtered = useMemo(() => {
    let result = [...campaigns];

    if (filter === 'active') {
      result = result.filter((c) => c.status === 'active');
    } else if (filter === 'upcoming') {
      result = result.filter((c) => c.status === 'upcoming');
    }

    if (filter === 'nearby' && userLocation) {
      result.sort((a, b) => {
        const distA =
          a.lat != null && a.lng != null
            ? haversineDistance(userLocation.lat, userLocation.lng, a.lat, a.lng)
            : Infinity;
        const distB =
          b.lat != null && b.lng != null
            ? haversineDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
            : Infinity;
        return distA - distB;
      });
    } else {
      result.sort((a, b) => {
        const dateA = a.campaign_date ? new Date(a.campaign_date).getTime() : 0;
        const dateB = b.campaign_date ? new Date(b.campaign_date).getTime() : 0;
        return newestFirst ? dateB - dateA : dateA - dateB;
      });
    }

    return result;
  }, [campaigns, filter, newestFirst, userLocation]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'nearby', label: 'Nearby' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {filters.map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? 'primary' : 'outline'}
            size="sm"
            loading={key === 'nearby' && geoLoading}
            onClick={() => (key === 'nearby' ? requestLocation() : setFilter(key))}
          >
            {label}
          </Button>
        ))}

        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNewestFirst((prev) => !prev)}
            className="flex items-center gap-1.5"
          >
            <ArrowUpDown className="h-4 w-4" />
            {newestFirst ? 'Newest' : 'Oldest'}
          </Button>
        </div>
      </div>

      {children(filtered, volunteerCounts)}
    </div>
  );
}
