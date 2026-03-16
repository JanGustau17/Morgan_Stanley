import { NextResponse, type NextRequest } from 'next/server';
import { fetchResources, type LemontreeQuery } from '@/lib/lemontree';

/**
 * GET /api/resources
 *
 * Proxy to the Lemontree Resources API with full query-parameter support:
 *   lat, lng, location (zip), text, resourceTypeId, tagId,
 *   occurrencesWithin, region, sort, take, cursor
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const query: LemontreeQuery = {};

    // Location params
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat) query.lat = Number(lat);
    if (lng) query.lng = Number(lng);

    // Zip code alternative
    const location = searchParams.get('location');
    if (location) query.location = location;

    // Text search
    const text = searchParams.get('text');
    if (text) query.text = text;

    // Type filter: FOOD_PANTRY or SOUP_KITCHEN
    const resourceTypeId = searchParams.get('resourceTypeId');
    if (resourceTypeId) query.resourceTypeId = resourceTypeId;

    // Tag filter
    const tagId = searchParams.get('tagId');
    if (tagId) query.tagId = tagId;

    // Occurrences within ISO 8601 interval
    const occurrencesWithin = searchParams.get('occurrencesWithin');
    if (occurrencesWithin) query.occurrencesWithin = occurrencesWithin;

    // Region
    const region = searchParams.get('region');
    if (region) query.region = region;

    // Sort
    const sort = searchParams.get('sort');
    if (sort) query.sort = sort;

    // Pagination
    const take = searchParams.get('take');
    if (take) query.take = Number(take);

    const cursor = searchParams.get('cursor');
    if (cursor) query.cursor = cursor;

    // Must have at least lat+lng, location (zip), text, or region
    const hasLocation = query.lat && query.lng;
    const hasZip = !!query.location;
    const hasText = !!query.text;
    const hasRegion = !!query.region;

    if (!hasLocation && !hasZip && !hasText && !hasRegion) {
      return NextResponse.json(
        { error: 'Provide lat+lng, location (zip), text, or region' },
        { status: 400 },
      );
    }

    // Default sort to distance when location is provided
    if ((hasLocation || hasZip) && !query.sort) {
      query.sort = 'distance';
    }

    // Default take
    if (!query.take) query.take = 20;

    const data = await fetchResources(query);

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('[resources] error:', err);
    const message =
      err instanceof Error ? err.message : 'Failed to fetch resources';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
