'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  BarChart3,
  QrCode,
  Users,
  FileText,
  MapPin,
  Search,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { format } from 'date-fns';
import 'mapbox-gl/dist/mapbox-gl.css';

const AdminHeatmap = dynamic(() => import('./AdminHeatmap'), {
  ssr: false,
});

interface Metrics {
  totalCampaigns: number;
  totalConversions: number;
  totalFlyers: number;
  totalVolunteers: number;
}

interface CampaignRow {
  id: string;
  name: string;
  neighborhood: string | null;
  campaign_date: string | null;
  status: string;
  flyers_count: number;
  organizer_name: string;
  volunteer_count: number;
  conversion_count: number;
}

interface RecentSignup {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface AdminDashboardProps {
  metrics: Metrics;
  campaigns: CampaignRow[];
  conversions: { lat: number; lng: number }[];
  recentSignups?: RecentSignup[];
}

type SortKey = 'name' | 'campaign_date' | 'volunteer_count' | 'conversion_count' | 'flyers_count';
type SortDir = 'asc' | 'desc';

const statusOptions = ['all', 'active', 'upcoming', 'completed'] as const;

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== column) return null;
  return sortDir === 'asc' ? (
    <ChevronUp className="inline h-3.5 w-3.5" />
  ) : (
    <ChevronDown className="inline h-3.5 w-3.5" />
  );
}

const METRIC_CARDS: {
  key: keyof Metrics;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: 'totalCampaigns', label: 'Campaigns', icon: <BarChart3 className="h-5 w-5" /> },
  { key: 'totalConversions', label: 'QR Scans', icon: <QrCode className="h-5 w-5" /> },
  { key: 'totalFlyers', label: 'Flyers Distributed', icon: <FileText className="h-5 w-5" /> },
  { key: 'totalVolunteers', label: 'Volunteers', icon: <Users className="h-5 w-5" /> },
];

function statusVariant(status: string): 'active' | 'upcoming' | 'completed' {
  if (status === 'active') return 'active';
  if (status === 'upcoming') return 'upcoming';
  return 'completed';
}

export function AdminDashboard({
  metrics,
  campaigns,
  conversions,
  recentSignups = [],
}: AdminDashboardProps) {
  const [cityFilter, setCityFilter] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('campaign_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];

    if (cityFilter.trim()) {
      const q = cityFilter.toLowerCase();
      result = result.filter(
        (c) =>
          c.neighborhood?.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (dateStart) {
      result = result.filter(
        (c) => c.campaign_date && c.campaign_date >= dateStart
      );
    }
    if (dateEnd) {
      result = result.filter(
        (c) => c.campaign_date && c.campaign_date <= dateEnd
      );
    }

    result.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortKey) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'campaign_date':
          aVal = a.campaign_date ?? '';
          bVal = b.campaign_date ?? '';
          break;
        case 'volunteer_count':
          aVal = a.volunteer_count;
          bVal = b.volunteer_count;
          break;
        case 'conversion_count':
          aVal = a.conversion_count;
          bVal = b.conversion_count;
          break;
        case 'flyers_count':
          aVal = a.flyers_count;
          bVal = b.flyers_count;
          break;
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [campaigns, cityFilter, statusFilter, dateStart, dateEnd, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const mapCenter = useMemo(() => {
    if (conversions.length === 0) return { lat: 40.7128, lng: -74.006 };
    const avgLat =
      conversions.reduce((s, c) => s + c.lat, 0) / conversions.length;
    const avgLng =
      conversions.reduce((s, c) => s + c.lng, 0) / conversions.length;
    return { lat: avgLat, lng: avgLng };
  }, [conversions]);

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRIC_CARDS.map((card) => (
          <Card key={card.key}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className="rounded-lg bg-green-100 p-3 text-green-600">
                {card.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics[card.key].toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent signups + active today placeholder */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Recent signups</h2>
          </CardHeader>
          <CardContent>
            {recentSignups.length === 0 ? (
              <p className="text-sm text-gray-500">No recent signups</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recentSignups.map((u) => (
                  <li key={u.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium text-gray-900 min-w-0 truncate max-w-[140px]">{u.name}</span>
                    <span className="text-gray-500 min-w-0 truncate max-w-[180px]">{u.email}</span>
                    <span className="text-gray-400 shrink-0">{format(new Date(u.created_at), 'MMM d')}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Active today</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Placeholder: connect to activity/logs when available.
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-400">—</p>
          </CardContent>
        </Card>
      </div>

      {/* QR Scan Heatmap */}
      {conversions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                QR Scan Heatmap
              </h2>
              <span className="text-sm text-gray-500">
                ({conversions.length} scans with location)
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] overflow-hidden rounded-b-xl">
              <AdminHeatmap center={mapCenter} conversions={conversions} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Campaigns ({filteredCampaigns.length})
            </h2>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city or name..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <Input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              label="From"
            />
            <Input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              label="To"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th
                  className="cursor-pointer px-6 py-3 font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => toggleSort('name')}
                >
                  Name <SortIcon column="name" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th className="px-6 py-3 font-medium text-gray-600">
                  Organizer
                </th>
                <th
                  className="cursor-pointer px-6 py-3 font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => toggleSort('campaign_date')}
                >
                  Date <SortIcon column="campaign_date" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th
                  className="cursor-pointer px-6 py-3 font-medium text-gray-600 hover:text-gray-900 text-right"
                  onClick={() => toggleSort('volunteer_count')}
                >
                  Volunteers <SortIcon column="volunteer_count" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th
                  className="cursor-pointer px-6 py-3 font-medium text-gray-600 hover:text-gray-900 text-right"
                  onClick={() => toggleSort('conversion_count')}
                >
                  QR Scans <SortIcon column="conversion_count" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th
                  className="cursor-pointer px-6 py-3 font-medium text-gray-600 hover:text-gray-900 text-right"
                  onClick={() => toggleSort('flyers_count')}
                >
                  Flyers <SortIcon column="flyers_count" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th className="px-6 py-3 font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No campaigns match your filters
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {c.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {c.organizer_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {c.campaign_date
                        ? format(new Date(c.campaign_date), 'MMM d, yyyy')
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-gray-900">
                      {c.volunteer_count}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-gray-900">
                      {c.conversion_count}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-gray-900">
                      {c.flyers_count}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant(c.status)} size="sm">
                        {c.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
