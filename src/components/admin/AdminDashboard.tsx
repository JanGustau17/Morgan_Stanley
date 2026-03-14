'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer } from 'react-leaflet';
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
import 'leaflet/dist/leaflet.css';

const FlyerHeatmap = dynamic(() => import('@/components/map/FlyerHeatmap'), {
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

interface AdminDashboardProps {
  metrics: Metrics;
  campaigns: CampaignRow[];
  conversions: { lat: number; lng: number }[];
}

type SortKey = 'name' | 'campaign_date' | 'volunteer_count' | 'conversion_count' | 'flyers_count';
type SortDir = 'asc' | 'desc';

const statusOptions = ['all', 'active', 'upcoming', 'completed'] as const;

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

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="inline h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="inline h-3.5 w-3.5" />
    );
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
              <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={11}
                className="h-full w-full"
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FlyerHeatmap pins={conversions} />
              </MapContainer>
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
                  Name <SortIcon column="name" />
                </th>
                <th className="px-6 py-3 font-medium text-gray-600">
                  Organizer
                </th>
                <th
                  className="cursor-pointer px-6 py-3 font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => toggleSort('campaign_date')}
                >
                  Date <SortIcon column="campaign_date" />
                </th>
                <th
                  className="cursor-pointer px-6 py-3 font-medium text-gray-600 hover:text-gray-900 text-right"
                  onClick={() => toggleSort('volunteer_count')}
                >
                  Volunteers <SortIcon column="volunteer_count" />
                </th>
                <th
                  className="cursor-pointer px-6 py-3 font-medium text-gray-600 hover:text-gray-900 text-right"
                  onClick={() => toggleSort('conversion_count')}
                >
                  QR Scans <SortIcon column="conversion_count" />
                </th>
                <th
                  className="cursor-pointer px-6 py-3 font-medium text-gray-600 hover:text-gray-900 text-right"
                  onClick={() => toggleSort('flyers_count')}
                >
                  Flyers <SortIcon column="flyers_count" />
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
