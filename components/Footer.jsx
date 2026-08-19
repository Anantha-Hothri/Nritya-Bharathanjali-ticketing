import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--maroon)', color: 'var(--ivory)', borderTop: '2px solid var(--gold)' }} className="py-12 px-6 sm:px-10 mt-auto">
      <div className="max-w-[1440px] mx-auto text-center">
        <img src="/Images/msn_logo_flat_R (1).png" alt="M.S. Natyakshetra Emblem" className="h-16 mx-auto mb-4 object-contain" />

        <p className="text-sm max-w-md mx-auto mb-6 opacity-90" style={{ color: 'var(--gold-pale)' }}>
          Nritya Bharathanjali 2026 – Skanda Production<br />
          September 26, 2026
        </p>

        <div className="flex justify-center flex-wrap gap-4 sm:gap-6 text-xs uppercase tracking-widest mb-6 opacity-80" style={{ color: 'var(--sandal)' }}>
          <span>Classical Dance Production</span>
          <span>•</span>
          <span>Official E-Ticketing</span>
          <span>•</span>
          <span>Secure Bookings</span>
        </div>

        {/* Policy Links Section */}
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-xs font-medium mb-6 pt-4 border-t border-[var(--gold)]/30 max-w-2xl mx-auto" style={{ color: 'var(--gold-pale)' }}>
          <Link href="/terms-and-conditions" className="hover:underline transition-colors hover:text-white">
            Terms &amp; Conditions
          </Link>
          <span className="opacity-40">•</span>
          <Link href="/privacy-policy" className="hover:underline transition-colors hover:text-white">
            Privacy Policy
          </Link>
          <span className="opacity-40">•</span>
          <Link href="/refund-policy" className="hover:underline transition-colors hover:text-white">
            Refund &amp; Cancellation
          </Link>
          <span className="opacity-40">•</span>
          <Link href="/return-policy" className="hover:underline transition-colors hover:text-white">
            Return Policy
          </Link>
          <span className="opacity-40">•</span>
          <Link href="/shipping-policy" className="hover:underline transition-colors hover:text-white">
            Shipping &amp; Delivery
          </Link>
        </div>

        <p className="text-xs opacity-75" style={{ color: 'var(--gold-pale)' }}>
          &copy; 2026 MS Naatyakshetra. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

