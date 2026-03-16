'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Phone, ExternalLink, ChevronRight, Loader2, Filter } from 'lucide-react';
import dynamic from 'next/dynamic';

const EnhancedMap = dynamic(() => import('@/components/map/EnhancedMap'), { ssr: false });

interface Resource {
  id?: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  distance?: number;
  phone?: string;
  website?: string;
  description?: string;
  type?: string;
  resourceTypeId?: string;
  tags?: { id: string; name: string }[];
  shifts?: { day?: string; startTime?: string; endTime?: string }[];
  occurrences?: { startTime?: string; endTime?: string }[];
}

type ResourceType = '' | 'FOOD_PANTRY' | 'SOUP_KITCHEN';
type SortOption = 'distance' | 'referrals' | 'reviews' | 'confidence' | 'createdAt';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('');
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [cursor, setCursor] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Auto-detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setMapCenter(loc);
        },
        () => {
          // Default to NYC if location denied
          setMapCenter({ lat: 40.7128, lng: -74.006 });
        },
      );
    } else {
      setMapCenter({ lat: 40.7128, lng: -74.006 });
    }
  }, []);

  const fetchResources = useCallback(
    async (appendMode = false) => {
      setLoading(true);
      setHasSearched(true);

      const params = new URLSearchParams();

      if (searchText.trim()) params.set('text', searchText.trim());
      if (zipCode.trim()) params.set('location', zipCode.trim());
      if (resourceType) params.set('resourceTypeId', resourceType);
      if (sortBy) params.set('sort', sortBy);

      // Use user location for distance if no zip provided
      if (!zipCode.trim() && userLocation) {
        params.set('lat', String(userLocation.lat));
        params.set('lng', String(userLocation.lng));
      }

      params.set('take', '20');
      if (appendMode && cursor) params.set('cursor', cursor);

      // Need at least some search criteria
      if (!searchText.trim() && !zipCode.trim() && !userLocation) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/resources/search?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        if (appendMode) {
          setResources((prev) => [...prev, ...(data.resources || [])]);
        } else {
          setResources(data.resources || []);
        }
        setTotalCount(data.count || 0);
        setCursor(data.cursor || null);

        // Center map on first result if available
        if (!appendMode && data.resources?.length > 0) {
          const first = data.resources[0];
          const rLat = first.lat ?? first.latitude;
          const rLng = first.lng ?? first.longitude;
          if (rLat && rLng) {
            setMapCenter({ lat: rLat, lng: rLng });
          }
        }
      } catch (err) {
        console.error('Resource search error:', err);
      } finally {
        setLoading(false);
      }
    },
    [searchText, zipCode, resourceType, sortBy, cursor, userLocation],
  );

  // Auto-search when user location is available
  useEffect(() => {
    if (userLocation && !hasSearched) {
      fetchResources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setCursor(null);
    fetchResources();
  }

  function handleLoadMore() {
    fetchResources(true);
  }

  function getResourceLat(r: Resource) {
    return r.lat ?? r.latitude ?? 0;
  }

  function getResourceLng(r: Resource) {
    return r.lng ?? r.longitude ?? 0;
  }

  function formatType(typeId?: string) {
    if (typeId === 'FOOD_PANTRY') return 'Food Pantry';
    if (typeId === 'SOUP_KITCHEN') return 'Soup Kitchen';
    return typeId || 'Food Resource';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero / Search Header */}
      <div className="bg-gradient-to-br from-[#008A81] to-[#006B64] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Find Food Resources Near You
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                Search food pantries and soup kitchens by zip code, name, or your current
                location. Powered by the Lemontree food assistance network.
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Text search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by name…"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 bg-white border-0 focus:ring-2 focus:ring-[#ffcc10] text-sm min-h-[48px]"
                  />
                </div>
                {/* Zip code */}
                <div className="relative w-full sm:w-44">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="Zip code"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 bg-white border-0 focus:ring-2 focus:ring-[#ffcc10] text-sm min-h-[48px]"
                    maxLength={5}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 rounded-xl font-bold text-[#101726] text-sm transition-all hover:opacity-90 disabled:opacity-50 min-h-[48px] shrink-0"
                  style={{ background: '#ffcc10' }}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Search'}
                </button>
              </div>

              {/* Filter toggle */}
              <div className="flex items-center justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setShowFilters((v) => !v)}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? 'Hide filters' : 'Show filters'}
                </button>
                {userLocation && (
                  <span className="text-white/50 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Using your location
                  </span>
                )}
              </div>

              {/* Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-3 mt-4">
                      {/* Type filter */}
                      <div>
                        <label className="text-white/60 text-xs font-medium mb-1 block">
                          Resource Type
                        </label>
                        <div className="flex gap-1.5">
                          {[
                            { value: '', label: 'All' },
                            { value: 'FOOD_PANTRY', label: '🍎 Food Pantry' },
                            { value: 'SOUP_KITCHEN', label: '🍲 Soup Kitchen' },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setResourceType(opt.value as ResourceType)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
                                resourceType === opt.value
                                  ? 'bg-white text-[#008A81] shadow-sm'
                                  : 'bg-white/15 text-white hover:bg-white/25'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sort */}
                      <div>
                        <label className="text-white/60 text-xs font-medium mb-1 block">
                          Sort By
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/15 text-white border-0 focus:ring-2 focus:ring-[#ffcc10] min-h-[36px] cursor-pointer"
                        >
                          <option value="distance">Distance</option>
                          <option value="referrals">Most Referrals</option>
                          <option value="reviews">Reviews</option>
                          <option value="confidence">Confidence</option>
                          <option value="createdAt">Newest</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Results + Map */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Map section */}
        {mapCenter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <EnhancedMap
              lat={mapCenter.lat}
              lng={mapCenter.lng}
              locationName={zipCode ? `Near ${zipCode}` : 'Your Location'}
              showResources
              containerClassName="h-[400px] overflow-hidden rounded-2xl border border-gray-200 shadow-sm"
            />
          </motion.div>
        )}

        {/* Results header */}
        {hasSearched && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {loading ? 'Searching…' : `${totalCount} resource${totalCount !== 1 ? 's' : ''} found`}
            </h2>
            {resourceType && (
              <span className="text-xs bg-[#008A81]/10 text-[#008A81] px-3 py-1 rounded-full font-medium">
                {formatType(resourceType)}
              </span>
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && resources.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resource cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {resources.map((r, i) => (
              <motion.div
                key={r.id || i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: i * 0.03 }}
                layout
              >
                <button
                  onClick={() => setSelectedResource(selectedResource?.id === r.id ? null : r)}
                  className="w-full text-left bg-white rounded-2xl border border-gray-100 hover:border-[#008A81]/30 hover:shadow-md transition-all p-5 group"
                >
                  <div className="flex gap-3.5">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl ${
                        r.resourceTypeId === 'SOUP_KITCHEN'
                          ? 'bg-orange-50'
                          : 'bg-green-50'
                      }`}
                    >
                      {r.resourceTypeId === 'SOUP_KITCHEN' ? '🍲' : '🍎'}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#008A81] transition-colors truncate">
                          {r.name}
                        </h3>
                        <ChevronRight
                          className={`w-4 h-4 text-gray-300 group-hover:text-[#008A81] shrink-0 transition-transform ${
                            selectedResource?.id === r.id ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                      {r.address && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{r.address}</div>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {r.distance !== undefined && (
                          <span className="text-xs font-medium text-[#008A81]">
                            📏 {Number(r.distance).toFixed(1)} mi
                          </span>
                        )}
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {formatType(r.resourceTypeId)}
                        </span>
                        {r.tags?.slice(0, 2).map((t) => (
                          <span
                            key={t.id}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {selectedResource?.id === r.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                          {r.description && (
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {r.description}
                            </p>
                          )}
                          {r.phone && (
                            <a
                              href={`tel:${r.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-xs text-[#008A81] font-medium hover:underline"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {r.phone}
                            </a>
                          )}
                          {r.website && (
                            <a
                              href={r.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-xs text-[#5C3D8F] font-medium hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Visit website
                            </a>
                          )}
                          {r.shifts && r.shifts.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-gray-700 mb-1">
                                Schedule:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {r.shifts.slice(0, 5).map((s, si) => (
                                  <span
                                    key={si}
                                    className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full"
                                  >
                                    {s.day}
                                    {s.startTime
                                      ? ` ${new Date(s.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                                      : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Map link */}
                          {(getResourceLat(r) !== 0 || getResourceLng(r) !== 0) && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${getResourceLat(r)},${getResourceLng(r)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg mt-1"
                              style={{ background: '#008A81' }}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              Get Directions
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Load more */}
        {cursor && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 rounded-xl border-2 border-[#008A81] text-[#008A81] font-semibold text-sm hover:bg-[#008A81] hover:text-white transition-all min-h-[48px]"
            >
              Load more resources
            </button>
          </div>
        )}

        {/* Empty state */}
        {hasSearched && !loading && resources.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No resources found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Try a different zip code, search term, or remove filters. You can also try
              sharing your location for nearby results.
            </p>
          </motion.div>
        )}

        {/* Initial state before search */}
        {!hasSearched && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">🍋</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Search for food resources
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Enter a zip code, name, or allow location access to find food pantries and
              soup kitchens near you.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
