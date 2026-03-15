import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

const protectedPaths = ["/profile", "/events", "/admin"];
const authPaths = ["/auth", "/login"];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthPath(pathname: string): boolean {
  return authPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!req.auth;

  if (isAuthPath(pathname) && isLoggedIn) {
    return Response.redirect(new URL("/", nextUrl));
  }

  if (!isLoggedIn && isProtectedPath(pathname)) {
    return Response.redirect(new URL("/auth", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
