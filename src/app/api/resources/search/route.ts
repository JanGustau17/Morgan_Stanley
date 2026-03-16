import { NextResponse, type NextRequest } from 'next/server';
import { fetchResources, type LemontreeQuery } from '@/lib/lemontree';

/**
 * GET /api/resources/search?text=&location=&resourceTypeId=&take=&cursor=&sort=
 *
 * Full-text search + filters for the Resources browse page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query: LemontreeQuery = {};

  const text = searchParams.get('text');
  if (text) query.text = text;

  const location = searchParams.get('location');
  if (location) query.location = location;

  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  if (lat) query.lat = Number(lat);
  if (lng) query.lng = Number(lng);

  const resourceTypeId = searchParams.get('resourceTypeId');
  if (resourceTypeId) query.resourceTypeId = resourceTypeId;

  const sort = searchParams.get('sort') || 'distance';
  query.sort = sort;

  const take = searchParams.get('take');
  query.take = take ? Number(take) : 20;

  const cursor = searchParams.get('cursor');
  if (cursor) query.cursor = cursor;

  // Need at least one search criterion
  const hasAnyCriteria = query.text || query.location || (query.lat && query.lng);
  if (!hasAnyCriteria) {
    return NextResponse.json(
      { error: 'Provide text, location (zip), or lat+lng' },
      { status: 400 },
    );
  }

  try {
    const data = await fetchResources(query);
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('[resources/search] error:', err);
    const message = err instanceof Error ? err.message : 'Search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
