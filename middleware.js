import { NextResponse } from 'next/server';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from './lib/adminAuth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Protect Admin API Routes (Except /api/admin/login)
  if (pathname.startsWith('/api/admin')) {
    if (pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    const tokenCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    const session = tokenCookie ? await verifyAdminToken(tokenCookie.value) : null;

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin access.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 2. Protect Admin Frontend Pages (/admin/dashboard, etc.)
  if (pathname.startsWith('/admin')) {
    const tokenCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    const session = tokenCookie ? await verifyAdminToken(tokenCookie.value) : null;

    // If visiting /admin/login while already logged in as admin, redirect to /admin/dashboard
    if (pathname === '/admin/login') {
      if (session) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Redirect unauthenticated requests to /admin/login
    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
