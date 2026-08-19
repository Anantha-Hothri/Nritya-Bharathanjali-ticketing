import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Return Policy | Nritya Bharathanjali 2026 – Skanda',
  description: 'Official Return Policy statement for Nritya Bharathanjali 2026 – Skanda digital event ticket bookings by MS Naatyakshetra.',
};

export default function ReturnPolicyPage() {
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
            Service Disclosures
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
            Return Policy
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
          {/* Prominent Declaration Banner */}
          <div className="p-5 rounded-lg border-2 text-center" style={{ background: 'var(--sandal)', borderColor: 'var(--gold)' }}>
            <h2 className="text-lg font-bold font-serif-display uppercase tracking-wider" style={{ color: 'var(--maroon)' }}>
              🚫 Returns &amp; Physical Exchanges: Not Applicable
            </h2>
            <p className="text-xs mt-2 opacity-90 max-w-2xl mx-auto">
              This platform provides digital admission pass reservations for a live cultural performance. Because no physical products or tangible items are sold, traditional retail return or item exchange policies do not apply to your booking.
            </p>
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              1. Nature of Services Provided
            </h2>
            <p>
              The platform{' '}
              <a
                href="https://nritya-bharathanjali-ticketing.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="underline font-semibold"
                style={{ color: 'var(--maroon)' }}
              >
                https://nritya-bharathanjali-ticketing.vercel.app/
              </a>{' '}
              is operated exclusively by <strong>MS Naatyakshetra</strong> for the online booking and digital issuance of admission passes for the live classical dance production <strong>Nritya Bharathanjali 2026 – Skanda</strong> on <strong>September 26, 2026</strong>.
            </p>
            <p className="mt-2">
              We do not operate an e-commerce retail store, nor do we sell or dispatch physical goods, merchandise, or deliverable parcels.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              2. Exemption from Product Return Policies
            </h2>
            <p>
              Because all bookings result in immediate digital service reservation and electronic admission passes:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Physical product return requests, item packaging inspections, postal return dispatches, or item exchanges are completely non-applicable.</li>
              <li>Confirmed digital e-tickets grant specific entry rights for the performance date and cannot be returned for cash exchange once issued.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              3. Technical Duplicate Payment Adjustments
            </h2>
            <p>
              While physical returns do not apply, if a technical error occurs during payment resulting in a duplicate debit for the same booking, the extra charge will be reviewed and refunded to your original payment method upon verification by MS Naatyakshetra administration.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              4. Entity &amp; Jurisdiction Details
            </h2>
            <p>
              All queries and legal disputes are subject to the <strong>exclusive jurisdiction of the courts in Bengaluru, Karnataka, India</strong>.
            </p>
            <div className="mt-4 p-4 rounded-lg border text-xs space-y-1" style={{ background: 'var(--sandal)', borderColor: 'var(--gold)' }}>
              <p><strong>Organizer Name:</strong> MS Naatyakshetra</p>
              <p><strong>Full Address:</strong> 1, Jayaramreddy layout, 2nd Main, 3rd Cross A-Block, AECS Layout, Kundalahalli, Brookefield, Bengaluru, Karnataka 560037</p>
              <p><strong>Contact Email:</strong> <a href="mailto:msnatyalaya@gmail.com" className="underline hover:opacity-80">msnatyalaya@gmail.com</a></p>
              <p><strong>Support Phone:</strong> <a href="tel:+919663680808" className="underline hover:opacity-80">+91 96636 80808</a></p>
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
            <Link href="/shipping-policy" className="hover:underline" style={{ color: 'var(--maroon)' }}>Digital Delivery</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
