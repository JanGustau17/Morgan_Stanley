/**
 * Shared Lemontree API client.
 *
 * The Lemontree Resources API at platform.foodhelpline.org returns superjson-
 * serialized responses.  This module handles deserialization and exposes a
 * typed `fetchResources` helper that supports every documented query param.
 *
 * Docs: GET /api/resources
 *   lat, lng, location (zip), text, resourceTypeId, tagId,
 *   occurrencesWithin, region, sort, take, cursor
 */

import superjson from 'superjson';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LemontreeShift {
  day?: string;
  startTime?: Date | string;
  endTime?: Date | string;
}

export interface LemontreeOccurrence {
  startTime?: Date | string;
  endTime?: Date | string;
}

export interface LemontreeResource {
  id: string;
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
  shifts?: LemontreeShift[];
  occurrences?: LemontreeOccurrence[];
  [key: string]: unknown;
}

export interface LemontreeResponse {
  count?: number;
  resources: LemontreeResource[];
  cursor?: string;
}

// ---------------------------------------------------------------------------
// Query params
// ---------------------------------------------------------------------------

export interface LemontreeQuery {
  /** Latitude for distance-based results */
  lat?: number;
  /** Longitude for distance-based results */
  lng?: number;
  /** Zip code — alternative to lat/lng */
  location?: string;
  /** Full-text search on resource name */
  text?: string;
  /** FOOD_PANTRY or SOUP_KITCHEN */
  resourceTypeId?: string;
  /** Filter by tag ID */
  tagId?: string;
  /** ISO 8601 interval — only resources with occurrences in this window */
  occurrencesWithin?: string;
  /** Region ID or comma-separated zip codes */
  region?: string;
  /** Sort: distance, referrals, referralsAsc, reviews, confidence, createdAt */
  sort?: string;
  /** Results per page (default 40) */
  take?: number;
  /** Pagination cursor from previous response */
  cursor?: string;
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.LEMONTREE_API_BASE || 'https://platform.foodhelpline.org';

/**
 * Fetch resources from the Lemontree API with full query param support.
 *
 * Uses superjson deserialization so dates are real Date objects.
 */
export async function fetchResources(
  query: LemontreeQuery,
): Promise<LemontreeResponse> {
  const url = new URL(`${BASE_URL}/api/resources`);

  // Map every defined query param onto the URL
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Lemontree API error ${res.status}: ${body.slice(0, 200)}`,
    );
  }

  const raw = await res.json();

  // Try superjson deserialization first (canonical format)
  try {
    if (raw?.json && raw?.meta) {
      const deserialized = superjson.deserialize<LemontreeResponse>(raw);
      return normalizeResponse(deserialized);
    }
  } catch {
    // Fall through to manual handling
  }

  // Fallback: superjson wrapper without meta, or plain JSON
  const data = raw?.json ?? raw;
  return normalizeResponse(data as LemontreeResponse);
}

function normalizeResponse(data: LemontreeResponse): LemontreeResponse {
  return {
    count: data?.count ?? data?.resources?.length ?? 0,
    resources: Array.isArray(data?.resources) ? data.resources : [],
    cursor: data?.cursor ?? undefined,
  };
}

/**
 * Convenience: fetch nearby resources (by lat/lng) sorted by distance.
 */
export function fetchNearbyResources(
  lat: number,
  lng: number,
  take = 12,
): Promise<LemontreeResponse> {
  return fetchResources({ lat, lng, take, sort: 'distance' });
}

/**
 * Convenience: search resources by text with optional type filter.
 */
export function searchResources(
  text: string,
  opts?: { resourceTypeId?: string; location?: string; take?: number; cursor?: string },
): Promise<LemontreeResponse> {
  return fetchResources({
    text,
    ...opts,
    take: opts?.take ?? 20,
  });
}
