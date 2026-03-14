import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const protectedPaths = ['/events/new', '/profile', '/admin'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected =
    protectedPaths.some((p) => pathname.startsWith(p)) ||
    /^\/events\/[^/]+\/coordination/.test(pathname);

  if (isProtected && !req.auth) {
    const url = new URL('/auth', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/admin') && req.auth) {
    const role = (req.auth.user as Record<string, unknown>)?.role;
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/events/new', '/profile', '/admin/:path*', '/events/:id/coordination'],
};
