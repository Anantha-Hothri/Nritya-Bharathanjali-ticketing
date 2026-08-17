'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  // Do not render customer navbar on admin routes
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="glass-nav sticky top-0 z-50 transition-all">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-3 flex items-center justify-between">
        {/* Brand Emblem & Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/Images/msn_logo_flat_R (1).png"
            alt="M.S. Natyakshetra Logo"
            className="h-11 sm:h-12 w-auto object-contain"
          />
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/"
            className="text-xs sm:text-sm font-semibold hover:text-maroon transition-colors px-2 py-1"
            style={{ color: 'var(--ink)' }}
          >
            Event Home
          </Link>

          <Link
            href="/booking/my-bookings"
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded border border-gold bg-cream hover:bg-sandal text-maroon shadow-sm transition-all"
          >
            📋 My Bookings & Receipts
          </Link>

          <Link
            href="/booking/login"
            className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded border border-gold bg-maroon text-ivory hover:bg-maroon-soft transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>🎟️ Book Tickets</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
