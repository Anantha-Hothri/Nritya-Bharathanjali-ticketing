import React from 'react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--maroon)', color: 'var(--ivory)', borderTop: '2px solid var(--gold)' }} className="py-12 px-6 sm:px-10 mt-auto">
      <div className="max-w-[1440px] mx-auto text-center">
        <img src="/assets/logo_gold.png" alt="M.S. Natyakshetra Emblem" className="h-16 mx-auto mb-4 object-contain brightness-200" />

        <h3 className="font-serif-display text-2xl font-semibold mb-1" style={{ color: 'var(--gold-light)' }}>
          M.S. Natyakshetra
        </h3>

        <p className="text-sm max-w-md mx-auto mb-6 opacity-90" style={{ color: 'var(--gold-pale)' }}>
          Nritya Bharathanjali 2026 – Skanda Production<br />
          September 26, 2026
        </p>

        <div className="flex justify-center flex-wrap gap-4 sm:gap-6 text-xs uppercase tracking-widest mb-6 opacity-80" style={{ color: 'var(--sandal)' }}>
          <span>Classical Bharatanatyam</span>
          <span>•</span>
          <span>Official E-Ticketing</span>
          <span>•</span>
          <span>Secure Bookings</span>
        </div>

        <p className="text-xs opacity-75" style={{ color: 'var(--gold-pale)' }}>
          &copy; 2026 M.S. Natyakshetra. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
