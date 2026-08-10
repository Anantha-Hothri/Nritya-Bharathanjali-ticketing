import React from 'react';

export default function Navbar() {
  return (
    <header className="glass-nav sticky top-0 z-50 transition-all">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 text-decoration-none">
          <img src="/assets/logo_red.png" alt="M.S. Natyakshetra Logo" className="h-12 w-auto object-contain" />
          <div className="hidden sm:block">
            <span className="block font-marcellus text-sm font-semibold tracking-wider" style={{ color: 'var(--maroon)' }}>
              M.S. NATYAKSHETRA
            </span>
            <span className="block text-xs uppercase tracking-widest" style={{ color: 'var(--bronze)' }}>
              Nritya Bharathanjali 2026
            </span>
          </div>
        </a>

        <nav className="flex items-center gap-4 sm:gap-6">
          <a href="/" className="text-sm font-medium hover:text-maroon transition-colors" style={{ color: 'var(--ink)' }}>
            Event Home
          </a>
          <a href="/admin/login" className="text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded border border-gold hover:bg-maroon hover:text-ivory transition-colors" style={{ color: 'var(--maroon)' }}>
            Admin Login
          </a>
        </nav>
      </div>
    </header>
  );
}
