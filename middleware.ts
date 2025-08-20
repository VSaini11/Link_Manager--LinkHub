// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const adminAuth = req.cookies.get("admin-auth")?.value;

  // Protect dashboard routes
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect admin routes (except login)
  if (req.nextUrl.pathname.startsWith("/admin") && 
      !req.nextUrl.pathname.startsWith("/admin/login")) {
    if (!adminAuth || adminAuth !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'], // Protect dashboard and admin pages
};
