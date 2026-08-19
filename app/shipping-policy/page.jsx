import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Shipping & Digital Delivery Policy | Nritya Bharathanjali 2026 – Skanda',
  description: 'Official Digital Delivery Policy for ticket bookings to Nritya Bharathanjali 2026 – Skanda by MS Naatyakshetra.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: 'var(--ivory)' }}>
      {/* Background Rotating Rangoli Mandala */}
      <img
        src="/assets/rangoli.png"
        alt=""
        aria-hidden="true"
        className="rangoli-bg spin-slow absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-10 pointer-events-none"
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-xs uppercase tracking-widest font-semibold transition-colors duration-200"
            style={{ color: 'var(--maroon)' }}
          >
            ← Back to Event Home
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-10 pb-6 border-b" style={{ borderColor: 'var(--gold)' }}>
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3"
            style={{ background: 'var(--sandal)', color: 'var(--maroon)' }}
          >
            Electronic Delivery
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
            Shipping &amp; Digital Delivery Policy
          </h1>
          <p className="text-sm font-body max-w-xl mx-auto" style={{ color: 'var(--ink-soft)' }}>
            Nritya Bharathanjali 2026 – Skanda | MS Naatyakshetra Official E-Ticketing Platform
          </p>
        </div>

        {/* Policy Content Card */}
        <div
          className="p-6 sm:p-10 rounded-xl shadow-lg border leading-relaxed text-sm font-body space-y-8"
          style={{ background: 'var(--parchment)', borderColor: 'rgba(182, 138, 62, 0.3)', color: 'var(--ink)' }}
        >
          {/* Prominent Digital Delivery Highlight Box */}
          <div className="p-5 rounded-lg border-2 text-center" style={{ background: 'var(--sandal)', borderColor: 'var(--gold)' }}>
            <h2 className="text-lg font-bold font-serif-display uppercase tracking-wider" style={{ color: 'var(--maroon)' }}>
              📧 100% Digital Delivery — Zero Physical Shipping
            </h2>
            <p className="text-xs mt-2 opacity-90 max-w-2xl mx-auto">
              All bookings for <strong>Nritya Bharathanjali 2026 – Skanda</strong> are processed digitally. No physical paper tickets, postal mailers, or courier parcels will be shipped to your billing or residential address.
            </p>
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              1. Digital Ticket Delivery Method
            </h2>
            <p>
              Upon successful online payment authorization on the Platform, your booking is confirmed immediately. <strong>MS Naatyakshetra</strong> delivers your admission pass credentials electronically through the following digital channels:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <strong>Instant Electronic Confirmation:</strong> A booking confirmation email containing your digital e-ticket details, seat allocations, payment acknowledgement receipt, and venue access instructions is dispatched to the email address provided during checkout.
              </li>
              <li>
                <strong>SMS / Mobile Notification:</strong> A digital booking reference code and entry link are transmitted to your registered mobile phone number.
              </li>
              <li>
                <strong>On-Demand Web Access:</strong> You can view, download, or print your active digital tickets directly from our website at any time using your booking reference or registered phone number.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              2. Delivery Timelines &amp; Charges
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Fulfillment Speed:</strong> Digital delivery occurs <strong>instantly</strong> (typically within 1 to 5 minutes) following successful online payment completion.
              </li>
              <li>
                <strong>Shipping Fees:</strong> Because all fulfillment is conducted digitally, <strong>zero shipping or courier delivery fees</strong> are charged to the user.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              3. Venue Entry Requirement
            </h2>
            <p>
              On the day of the event (<strong>September 26, 2026</strong>), simply display your digital e-ticket or booking QR code on your mobile device at the venue admission desk along with a valid government photo ID. No physical postal ticket is needed or dispatched.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              4. Entity &amp; Jurisdiction Details
            </h2>
            <p>
              All digital delivery operations and legal terms are subject to the <strong>exclusive jurisdiction of the courts in Bengaluru, Karnataka, India</strong>.
            </p>
            <div className="mt-4 p-4 rounded-lg border text-xs space-y-1" style={{ background: 'var(--sandal)', borderColor: 'var(--gold)' }}>
              <p><strong>Organizer Name:</strong> MS Naatyakshetra</p>
              <p><strong>Full Address:</strong> 1, Jayaramreddy layout, 2nd Main, 3rd Cross A-Block, AECS Layout, Kundalahalli, Brookefield, Bengaluru, Karnataka 560037</p>
              <p><strong>Contact Email:</strong> NIL</p>
              <p><strong>Support Phone:</strong> NIL</p>
            </div>
          </section>
        </div>

        {/* Footer Navigation Back Links */}
        <div className="mt-8 pt-6 border-t flex flex-wrap justify-between items-center text-xs gap-4" style={{ borderColor: 'var(--gold)' }}>
          <span style={{ color: 'var(--ink-soft)' }}>&copy; 2026 MS Naatyakshetra. All Rights Reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms-and-conditions" className="hover:underline" style={{ color: 'var(--maroon)' }}>Terms &amp; Conditions</Link>
            <Link href="/privacy-policy" className="hover:underline" style={{ color: 'var(--maroon)' }}>Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:underline" style={{ color: 'var(--maroon)' }}>Refund Policy</Link>
            <Link href="/return-policy" className="hover:underline" style={{ color: 'var(--maroon)' }}>Return Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
