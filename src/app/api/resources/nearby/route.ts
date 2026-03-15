import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  const url = new URL('https://platform.foodhelpline.org/api/resources');
  url.searchParams.set('lat', lat);
  url.searchParams.set('lng', lng);
  url.searchParams.set('take', '12');
  url.searchParams.set('sort', 'distance');

  const res = await fetch(url.toString(), { cache: 'no-store' });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[resources/nearby] upstream error', res.status, body);
    return NextResponse.json({ error: 'Failed to fetch nearby resources', upstream: res.status }, { status: 502 });
  }

  const raw = await res.json();
  // Lemontree API uses superjson: actual data lives at raw.json
  const data: { count?: number; resources?: unknown[] } = raw?.json ?? raw;

  console.log('[resources/nearby] count:', data?.count, 'resources:', data?.resources?.length);

  if (!Array.isArray(data?.resources)) {
    console.error('[resources/nearby] unexpected shape:', JSON.stringify(raw).slice(0, 300));
    return NextResponse.json({ resources: [], count: 0 });
  }

  return NextResponse.json(data);
}
