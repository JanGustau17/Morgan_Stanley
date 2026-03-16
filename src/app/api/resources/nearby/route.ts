import { NextResponse, type NextRequest } from 'next/server';
import { fetchNearbyResources } from '@/lib/lemontree';

/**
 * GET /api/resources/nearby?lat=&lng=&take=&resourceTypeId=
 *
 * Fetch nearby food resources sorted by distance.
 * Uses the shared Lemontree client with proper superjson deserialization.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  const take = Number(searchParams.get('take') || '12');

  try {
    const data = await fetchNearbyResources(Number(lat), Number(lng), take);
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('[resources/nearby] error:', err);
    return NextResponse.json({ resources: [], count: 0 });
  }
}
