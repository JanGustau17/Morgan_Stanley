import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'lat and lng query parameters are required' },
        { status: 400 },
      );
    }

    const url = `https://platform.foodhelpline.org/api/resources?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&take=4&sort=distance`;

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch resources from upstream' },
        { status: response.status },
      );
    }

    const raw = await response.json();
    const resources = raw?.json?.resources ?? [];

    return NextResponse.json(resources);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch resources';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
