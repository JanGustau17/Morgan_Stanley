import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const locationName = searchParams.get('locationName');
    const lang = searchParams.get('lang') ?? 'en';
    const ref = searchParams.get('ref') ?? '';

    if (!lat || !lng || !locationName) {
      return NextResponse.json(
        { error: 'lat, lng, and locationName are required' },
        { status: 400 },
      );
    }

    const url = new URL('https://platform.foodhelpline.org/api/resources.pdf');
    url.searchParams.set('lat', lat);
    url.searchParams.set('lng', lng);
    url.searchParams.set('locationName', locationName);
    // Lemontree API only supports 'en' and 'es'
    url.searchParams.set('flyerLang', lang === 'es' ? 'es' : 'en');
    url.searchParams.set('ref', ref);

    const response = await fetch(url.toString());

    if (!response.ok || !response.body) {
      return NextResponse.json(
        { error: 'Failed to generate flyer PDF' },
        { status: response.status || 502 },
      );
    }

    return new NextResponse(response.body as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="flyer-${ref || 'download'}.pdf"`,
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to generate flyer';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
