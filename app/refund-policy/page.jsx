import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Refund & Cancellation Policy | Nritya Bharathanjali 2026 – Skanda',
  description: 'Official Refund and Cancellation Policy for ticket bookings to Nritya Bharathanjali 2026 – Skanda by MS Naatyakshetra.',
};

export default function RefundPolicyPage() {
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
            Event Ticketing Terms
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
            Refund &amp; Cancellation Policy
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
          {/* Key Disclosure Callout */}
          <div className="p-5 rounded-lg border-l-4" style={{ background: 'var(--sandal)', borderColor: 'var(--maroon)', color: 'var(--ink)' }}>
            <h3 className="font-bold font-serif-display text-base" style={{ color: 'var(--maroon)' }}>
              📌 Summary of Refund &amp; Cancellation Rules
            </h3>
            <ul className="text-xs mt-2 space-y-1 font-semibold">
              <li>• Ticket Sales: Strictly 100% NON-REFUNDABLE for attendee-initiated cancellations.</li>
              <li>• Refund Eligibility: Refunds are granted ONLY in the event of official Organizer Cancellation by MS Naatyakshetra.</li>
              <li>• Payment Exception: Technical DUPLICATE PAYMENTS are eligible for refund upon verification.</li>
            </ul>
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              1. Non-Refundable Ticket Bookings
            </h2>
            <p>
              All ticket reservations for the live classical dance performance <strong>Nritya Bharathanjali 2026 – Skanda</strong> (scheduled for September 26, 2026) are <strong>strictly non-refundable and non-cancellable</strong> once payment authorization and digital booking receipt generation are completed.
            </p>
            <p className="mt-2">
              No attendee-initiated cancellations, booking alterations, seat transfers, or refund requests will be accepted for personal change of plans, non-attendance, or scheduling conflicts.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              2. Organizer Cancellation Exception
            </h2>
            <p>
              Refunds are issued <strong>strictly and exclusively</strong> under the following circumstance:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <strong>Official Event Cancellation:</strong> In the event that the performance of <em>Nritya Bharathanjali 2026 – Skanda</em> is officially cancelled by <strong>MS Naatyakshetra</strong> without a rescheduled performance date, a 100% refund of the face value of the confirmed ticket booking will be processed automatically back to the buyer&apos;s original payment method.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              3. Technical Duplicate Payment Exception
            </h2>
            <p>
              If a user experiences a technical network fault or payment gateway error resulting in a <strong>duplicate payment debit</strong> for the same single booking transaction, the duplicate extra charge will be refunded back to the original payment source upon verification by MS Naatyakshetra administration.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              4. Refund Processing &amp; Timelines
            </h2>
            <p>
              For any refund approved under Section 2 (Organizer Cancellation) or Section 3 (Technical Duplicate Payment):
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Refunds will be credited directly to the original mode of payment (Bank account, Debit/Credit Card, or UPI).</li>
              <li>Processing time typically takes <strong>5 to 7 business days</strong> depending on banking and payment gateway processing cycles.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              5. Jurisdiction &amp; Entity Information
            </h2>
            <p>
              All refund policies and disputes are subject to the <strong>exclusive jurisdiction of the courts in Bengaluru, Karnataka, India</strong>.
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
            <Link href="/return-policy" className="hover:underline" style={{ color: 'var(--maroon)' }}>Return Policy</Link>
            <Link href="/shipping-policy" className="hover:underline" style={{ color: 'var(--maroon)' }}>Digital Delivery</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
