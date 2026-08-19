import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Nritya Bharathanjali 2026 – Skanda',
  description: 'Official Privacy Policy for MS Naatyakshetra’s Nritya Bharathanjali 2026 – Skanda ticketing website.',
};

export default function PrivacyPolicyPage() {
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
            Data &amp; Security
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
            Privacy Policy
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
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              1. Introduction
            </h2>
            <p>
              This Privacy Policy describes how <strong>MS Naatyakshetra</strong> (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) collects, uses, processes, stores, shares, and protects your personal information when you access our official e-ticketing platform at{' '}
              <a
                href="https://nritya-bharathanjali-ticketing.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="underline font-semibold"
                style={{ color: 'var(--maroon)' }}
              >
                https://nritya-bharathanjali-ticketing.vercel.app/
              </a>{' '}
              (the &quot;Platform&quot;) to book tickets for the live classical dance production <strong>Nritya Bharathanjali 2026 – Skanda</strong>.
            </p>
            <p className="mt-2">
              By visiting our Platform, booking tickets, or providing your information, you expressly consent to the data collection, processing, and disclosure practices described in this Privacy Policy and agree to be governed by the laws of India, under the exclusive jurisdiction of the courts in <strong>Bengaluru, Karnataka</strong>.
            </p>
          </section>

          {/* Collection */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              2. Information We Collect
            </h2>
            <p>
              We collect personal data that you voluntarily provide to us when you interact with the Platform or reserve event tickets:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <strong>Contact &amp; Personal Identifiers:</strong> Name, email address, telephone/mobile number, and seat selection preferences submitted during booking.
              </li>
              <li>
                <strong>Transaction Data:</strong> Booking reference numbers, ticket category selections, transaction amounts, payment status, and digital receipt details.
              </li>
              <li>
                <strong>Payment Credentials:</strong> Online payments are processed via secure PCI-DSS compliant third-party payment gateways. We <em>never</em> collect, store, or process sensitive payment card PINs, passwords, or full card numbers on our servers.
              </li>
              <li>
                <strong>Technical Logs:</strong> IP address, device browser type, and interaction logs captured to prevent fraudulent multi-booking abuse and ensure site security.
              </li>
            </ul>
          </section>

          {/* Usage */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              3. Purpose &amp; Use of Personal Information
            </h2>
            <p>We use your personal data solely for event ticketing and administrative purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To process your ticket reservation and issue digital e-tickets and payment acknowledgement receipts.</li>
              <li>To send critical event communications, venue entry guidelines, schedule updates, or emergency notifications regarding <em>Nritya Bharathanjali 2026 – Skanda</em>.</li>
              <li>To verify attendee identity and validate e-tickets upon entry at the performance venue.</li>
              <li>To investigate duplicate payment transactions or system discrepancies.</li>
              <li>To comply with statutory financial accounting and tax reporting obligations under Indian law.</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              4. Data Sharing &amp; Disclosure
            </h2>
            <p>
              We prioritize data privacy and do not sell, rent, or trade your personal data to third parties for commercial marketing. We share information only under the following controlled circumstances:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Service Partners:</strong> Authorized payment gateways, SMS delivery channels, and transactional email providers required to process bookings and deliver digital receipts.
              </li>
              <li>
                <strong>Legal Compliance:</strong> Government bodies or law enforcement agencies if required by applicable Indian laws or court orders.
              </li>
            </ul>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              5. Security Precautions
            </h2>
            <p>
              We implement reasonable security practices and technical safeguards (including HTTPS/SSL encryption during data transmission) to protect your personal data against unauthorized access, loss, misuse, or alteration.
            </p>
          </section>

          {/* Data Retention & Rights */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              6. Data Retention &amp; User Rights
            </h2>
            <p>
              We retain personal data related to event bookings for the duration necessary to fulfill event management, accounting, and legal audit requirements.
            </p>
          </section>

          {/* Grievance Officer */}
          <section>
            <h2 className="text-xl font-bold font-serif-display mb-3" style={{ color: 'var(--maroon)' }}>
              7. Grievance Redressal &amp; Entity Details
            </h2>
            <p>
              In accordance with the Information Technology Act, 2000 and rules made thereunder, the official details for MS Naatyakshetra and the Grievance Desk are provided below:
            </p>
            <div className="mt-4 p-4 rounded-lg border text-xs space-y-1.5" style={{ background: 'var(--sandal)', borderColor: 'var(--gold)' }}>
              <p><strong>Organizer Name:</strong> MS Naatyakshetra</p>
              <p><strong>Full Address:</strong> 1, Jayaramreddy layout, 2nd Main, 3rd Cross A-Block, AECS Layout, Kundalahalli, Brookefield, Bengaluru, Karnataka 560037</p>
              <p><strong>Grievance Officer / Contact Person:</strong> Grievance Officer, MS Naatyakshetra Desk</p>
              <p><strong>Contact Email:</strong> NIL</p>
              <p><strong>Support Phone:</strong> NIL</p>
              <p><strong>Jurisdiction:</strong> Courts of Bengaluru, Karnataka, India</p>
            </div>
          </section>
        </div>

        {/* Footer Navigation Back Links */}
        <div className="mt-8 pt-6 border-t flex flex-wrap justify-between items-center text-xs gap-4" style={{ borderColor: 'var(--gold)' }}>
          <span style={{ color: 'var(--ink-soft)' }}>&copy; 2026 MS Naatyakshetra. All Rights Reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms-and-conditions" className="hover:underline" style={{ color: 'var(--maroon)' }}>Terms &amp; Conditions</Link>
            <Link href="/refund-policy" className="hover:underline" style={{ color: 'var(--maroon)' }}>Refund Policy</Link>
            <Link href="/return-policy" className="hover:underline" style={{ color: 'var(--maroon)' }}>Return Policy</Link>
            <Link href="/shipping-policy" className="hover:underline" style={{ color: 'var(--maroon)' }}>Digital Delivery</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
