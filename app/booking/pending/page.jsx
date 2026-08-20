'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PendingContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id') || '';

  return (
    <div className="py-16 px-6 max-w-xl mx-auto text-center space-y-6" style={{ background: 'var(--ivory)' }}>
      <div className="card-gold-accent p-8 sm:p-10 space-y-6">
        <div className="text-5xl">⏳</div>
        <div>
          <p className="eyebrow mb-2">PAYMENT SUBMITTED</p>
          <h2 className="font-serif-display text-2xl font-semibold" style={{ color: 'var(--maroon)' }}>
            Awaiting Payment Confirmation
          </h2>
        </div>

        {bookingId && (
          <div className="p-3 rounded-lg bg-cream border border-gold text-sm">
            <p className="text-xs text-ink-soft uppercase font-bold mb-1">Your Booking ID</p>
            <p className="font-mono font-bold text-maroon text-lg">{bookingId}</p>
          </div>
        )}

        <div className="text-sm text-ink space-y-3 text-left bg-sandal/30 rounded-lg p-4 border border-gold/40">
          <p className="font-semibold text-maroon">What happens next?</p>
          <ul className="space-y-2 text-ink-soft">
            <li>✅ Your booking is recorded and your payment is being verified.</li>
            <li>📲 You'll receive a <strong>WhatsApp message</strong> and <strong>email</strong> with your e-ticket link once confirmed.</li>
            <li>⏱️ Confirmation typically happens within a few minutes during business hours.</li>
          </ul>
        </div>

        <p className="text-xs text-ink-soft">
          Questions? Contact us at{' '}
          <a href="tel:+919663680808" className="text-maroon font-bold">+91 96636 80808</a>
        </p>

        <a
          href="/"
          className="block w-full luxe-button luxe-button-outline py-3 text-sm text-center"
        >
          ← Return to Home
        </a>
      </div>
    </div>
  );
}

export default function PendingPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-ink-soft">Loading...</div>}>
      <PendingContent />
    </Suspense>
  );
}
