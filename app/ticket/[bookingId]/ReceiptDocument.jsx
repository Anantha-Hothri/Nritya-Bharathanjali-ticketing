'use client';

import React from 'react';
import Link from 'next/link';

export default function ReceiptDocument({ booking }) {
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="py-10 px-4 sm:px-8 max-w-3xl mx-auto print-page" style={{ background: 'var(--ivory)' }}>
      {/* Top Banner Notice with Congratulations (Hidden during print/PDF generation) */}
      <div className="p-5 mb-6 rounded-lg bg-maroon text-ivory border border-gold flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md no-print">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎉</span>
          <div>
            <h2 className="font-serif-display text-xl font-bold text-gold-light">
              Congratulations! Booking Confirmed
            </h2>
            <p className="text-xs text-ivory/90 mt-0.5">
              Your official booking acknowledgement receipt is generated below.
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded bg-gold text-maroon hover:bg-gold-light transition-colors whitespace-nowrap shadow-sm"
        >
          📥 Download Receipt (PDF)
        </button>
      </div>

      {/* Main Printable Document Card */}
      <div className="printable-document p-6 sm:p-10 rounded-lg border border-gold/40 shadow-xl bg-[#FDFBF7] space-y-8 text-ink">
        {/* 1. Header Section */}
        <div className="text-center border-b border-gold/30 pb-6 relative">
          <img
            src="/Images/msn_logo_flat_R (1).png"
            alt="M.S. Natyakshetra Emblem"
            className="h-12 mx-auto mb-2 object-contain"
          />
          <p className="text-[11px] font-bold uppercase tracking-widest text-bronze mb-1">
            M.S. NATYAKSHETRA PRESENTS
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-maroon">
            Nritya Bharathanjali 2026
          </h1>
          <p className="text-xs font-marcellus tracking-wider text-bronze mt-0.5">
            SKANDA PRODUCTION
          </p>
          <div className="mt-3 inline-block px-4 py-1 rounded bg-cream border border-gold/40 text-xs font-semibold uppercase tracking-wider text-maroon">
            Official Booking Acknowledgement Receipt
          </div>
        </div>

        {/* 2. Primary Booking & Payment Summary Card */}
        <div className="p-5 rounded-lg bg-cream/70 border border-gold/50 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gold/30 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-bronze block">
                BOOKING REFERENCE NUMBER
              </span>
              <span className="font-mono text-2xl font-extrabold text-maroon">{booking.bookingId}</span>
            </div>
            <div className="sm:text-right">
              <span className="px-3 py-1 rounded text-xs font-extrabold bg-sandal text-maroon border border-gold/60 inline-block uppercase tracking-wider">
                ✓ VERIFIED {booking.paymentStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-ink-soft block uppercase text-[10px]">TICKET QUANTITY</span>
              <strong className="text-maroon font-num text-lg font-bold">
                {booking.ticketQty} {booking.ticketQty === 1 ? 'Ticket' : 'Tickets'}
              </strong>
            </div>

            <div>
              <span className="text-ink-soft block uppercase text-[10px]">TOTAL AMOUNT PAID</span>
              <strong className="text-maroon font-num text-lg font-bold">
                ₹{booking.totalAmount.toLocaleString()}
              </strong>
            </div>

            <div>
              <span className="text-ink-soft block uppercase text-[10px]">PHONEPE REF ID</span>
              <span className="font-mono text-ink text-xs font-semibold truncate block">
                {booking.paymentId || 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-ink-soft block uppercase text-[10px]">BOOKING DATE</span>
              <span className="font-mono text-ink text-xs font-semibold block">
                {new Date(booking.bookingDate).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Official Invitation Poster (Optimized screen view, excluded from PDF download) */}
        <div className="rounded-lg border border-gold/40 p-2 sm:p-3 bg-white/80 shadow-sm no-print overflow-hidden text-center">
          <img
            src="/Images/invitation.png"
            alt="Nritya Bharathanjali 2026 Skanda Production Official Invitation"
            className="w-full h-auto max-h-[380px] md:max-h-[340px] object-contain mx-auto rounded shadow-sm"
          />
        </div>

        {/* 4. Buyer Details Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-bronze border-b border-gold/20 pb-1.5">
            👤 Buyer Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs p-4 rounded bg-white/60 border border-gold/30">
            <div>
              <span className="text-ink-soft block uppercase text-[10px]">PRIMARY BUYER NAME</span>
              <strong className="text-ink text-sm font-semibold block">{booking.customerName}</strong>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-sandal border border-gold/40 text-maroon">
                {booking.buyerType === 'MSN' ? 'MSN Student / Parent' : 'External Attendee'}
              </span>
              {booking.buyerType === 'MSN' && booking.studentName && (
                <div className="mt-2 pt-1.5 border-t border-gold/20">
                  <span className="text-ink-soft block uppercase text-[10px]">MSN STUDENT (CHILD NAME)</span>
                  <strong className="text-maroon text-xs font-bold block">{booking.studentName}</strong>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div>
                <span className="text-ink-soft inline-block w-24 uppercase text-[10px]">MOBILE PHONE:</span>
                <span className="font-mono text-ink font-semibold">{booking.phone}</span>
              </div>
              <div>
                <span className="text-ink-soft inline-block w-24 uppercase text-[10px]">WHATSAPP:</span>
                <span className="font-mono text-ink font-semibold">{booking.whatsapp}</span>
              </div>
              <div>
                <span className="text-ink-soft inline-block w-24 uppercase text-[10px]">EMAIL ADDRESS:</span>
                <span className="font-mono text-ink font-semibold">{booking.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Event Details Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-bronze border-b border-gold/20 pb-1.5">
            📍 Event Location & Timing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs p-4 rounded bg-white/60 border border-gold/30">
            <div>
              <span className="text-ink-soft block uppercase text-[10px]">DATE & TIME</span>
              <strong className="text-maroon font-num text-sm font-semibold block">September 26, 2026 (Saturday)</strong>
              <span className="text-ink-soft block">5:30 PM Onwards (Doors open at 5:00 PM)</span>
            </div>

            <div>
              <span className="text-ink-soft block uppercase text-[10px]">VENUE ADDRESS</span>
              <strong className="text-maroon font-marcellus text-sm font-semibold block">Dhwani Auditorium</strong>
              <span className="text-ink-soft block">CMRIT College Campus, Kundalahalli, Bengaluru</span>
              <a
                href="https://maps.app.goo.gl/9yV1MvuTc6HzmTqX8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-maroon underline hover:text-bronze mt-1 no-print"
              >
                📍 Open Google Maps &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* 6. Important Event Notes */}
        <div className="p-4 rounded bg-sandal/30 border border-gold/30 space-y-2 text-xs text-ink-soft">
          <strong className="text-maroon block font-semibold uppercase tracking-wider text-[11px]">
            ℹ️ Important Event Guidelines & Entry Instructions
          </strong>
          <ul className="space-y-1 list-disc list-inside leading-relaxed text-[11px]">
            <li>This document serves as your official <strong>Booking Acknowledgement & Event Pass Receipt</strong>.</li>
            <li>Please present this digital receipt or a printed copy at the venue check-in desk on September 26, 2026.</li>
            <li>Auditorium doors open at <strong>5:00 PM</strong>. Guests are kindly requested to be seated by 5:15 PM.</li>
            <li>Bookings are confirmed and non-transferable. For inquiries, please quote your Booking Reference <strong>{booking.bookingId}</strong>.</li>
          </ul>
        </div>

        {/* 7. Footer Section */}
        <div className="text-center pt-4 border-t border-gold/30 text-xs text-ink-soft">
          <p className="font-marcellus font-semibold text-maroon text-sm">
            Thank you for supporting M.S. Natyakshetra & Skanda Production 2026!
          </p>
        </div>
      </div>

      {/* Action Bar (Hidden during print/PDF generation) */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center no-print">
        <button
          onClick={handleDownloadPDF}
          className="luxe-button luxe-button-solid text-center flex items-center justify-center gap-2"
        >
          <span>📥 DOWNLOAD RECEIPT (PDF)</span>
        </button>
        <Link href="/booking/my-bookings" className="luxe-button luxe-button-outline text-center">
          📁 MY BOOKINGS PORTAL
        </Link>
        <Link href="/" className="text-xs font-semibold text-maroon hover:underline flex items-center justify-center">
          &larr; Return to Home Page
        </Link>
      </div>
    </div>
  );
}
