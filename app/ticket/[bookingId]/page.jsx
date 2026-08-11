import React from 'react';
import { prisma } from '../../../lib/db';
import Link from 'next/link';
import PrintTicketButton from '../../../components/PrintTicketButton';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  return {
    title: `E-Ticket #${params.bookingId} | Nritya Bharathanjali 2026`,
  };
}

export default async function ETicketPage({ params }) {
  const { bookingId } = params;

  const booking = await prisma.booking.findUnique({
    where: { bookingId },
    include: {
      tickets: true,
    },
  });

  if (!booking || booking.paymentStatus !== 'PAID') {
    return (
      <div className="py-20 text-center px-4 max-w-md mx-auto" style={{ background: 'var(--ivory)' }}>
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="font-serif-display text-3xl text-maroon font-bold mb-2">
          Ticket Not Issued
        </h1>
        <p className="text-sm text-ink-soft mb-6">
          The requested booking code <code className="bg-sandal px-1 rounded">{bookingId}</code> does not exist or payment is not verified.
        </p>
        <Link href="/" className="luxe-button luxe-button-solid">
          RETURN TO HOME PAGE &rarr;
        </Link>
      </div>
    );
  }

  const primaryTicket = booking.tickets[0];

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-10 max-w-3xl mx-auto" style={{ background: 'var(--ivory)' }}>
      {/* Success Banner (Hidden in PDF Print View) */}
      <div id="success-banner" className="no-print p-4 mb-6 rounded-lg bg-emerald-800 text-white text-center space-y-1 shadow-md">
        <span className="text-2xl">🎉</span>
        <h2 className="font-serif-display text-2xl font-bold">Booking Confirmed & E-Ticket Issued!</h2>
        <p className="text-xs opacity-90">
          A copy of this e-ticket has been dispatched to <strong>{booking.whatsapp}</strong> (WhatsApp) and <strong>{booking.email}</strong>.
        </p>
      </div>

      {/* Printable E-Ticket Card */}
      <div id="e-ticket-card" className="card-gold-accent overflow-hidden border-2 border-gold shadow-2xl bg-white-warm">
        {/* Ticket Header Banner */}
        <div style={{ background: '#6E1423', color: '#FBF6EC', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} className="p-6 text-center border-b-2 border-gold relative ticket-header-banner">
          <img src="/assets/logo_red.png" alt="Emblem" className="h-14 mx-auto mb-2 object-contain brightness-200" />
          <p className="eyebrow text-gold-light mb-1">M.S. NATYAKSHETRA OFFICIAL E-TICKET</p>
          <h1 className="font-serif-display text-3xl font-bold text-ivory">
            Nritya Bharathanjali 2026
          </h1>
          <span className="inline-block mt-1 text-sm font-marcellus text-gold-pale">
            SKANDA PRODUCTION
          </span>
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 space-y-5">
          {/* Key Allocation Banner with Highlighting */}
          <div
            className="p-5 rounded-xl border-2 border-gold text-center ticket-row-highlight shadow-sm"
            style={{
              background: '#F6EEDE',
              borderColor: '#B68A3E',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-bronze block">
              ALLOCATED AUDITORIUM ROW
            </span>
            <div className="font-serif-display text-5xl font-extrabold text-maroon my-2 tracking-wide">
              {booking.allocatedRow}
            </div>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold text-maroon"
              style={{
                background: '#EFE3CC',
                color: '#6E1423',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              TICKET QUANTITY: {booking.ticketQty} SEATS RESERVED
            </span>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-2 gap-4 text-sm border-b border-gold/30 pb-4">
            <div>
              <span className="text-xs text-ink-soft block uppercase">EVENT DATE & TIME</span>
              <strong className="text-maroon font-num text-base">Sept 26, 2026</strong>
              <span className="block text-xs text-ink-soft">Saturday • 5:30 PM</span>
            </div>
            <div>
              <span className="text-xs text-ink-soft block uppercase">VENUE LOCATION</span>
              <strong className="text-maroon font-marcellus text-base">Dhwani Auditorium</strong>
              <span className="block text-xs text-ink-soft">CMRIT College</span>
              <a
                href="https://maps.app.goo.gl/9yV1MvuTc6HzmTqX8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-maroon underline hover:text-bronze mt-1 no-print"
              >
                📍 Navigate &rarr;
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-b border-gold/30 pb-4">
            <div>
              <span className="text-xs text-ink-soft block uppercase">PRIMARY CUSTOMER</span>
              <strong className="text-ink">{booking.customerName}</strong>
              <span className="block text-xs font-mono">{booking.phone}</span>
            </div>
            <div>
              <span className="text-xs text-ink-soft block uppercase">BOOKING REFERENCE</span>
              <strong className="text-maroon font-mono text-base block">{booking.bookingId}</strong>
              <span
                className="inline-block px-2 py-0.5 rounded text-[11px] font-bold mt-0.5 text-white"
                style={{
                  background: '#065F46',
                  color: '#FFFFFF',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                STATUS: VERIFIED PAID
              </span>
            </div>
          </div>

          {booking.buyerType === 'MSN' && (
            <div className="grid grid-cols-2 gap-4 text-sm border-b border-gold/30 pb-4">
              <div>
                <span className="text-xs text-ink-soft block uppercase">STUDENT NAME</span>
                <strong className="text-maroon font-semibold">{booking.studentName}</strong>
              </div>
              <div>
                <span className="text-xs text-ink-soft block uppercase">BATCH & CODE</span>
                <span className="text-ink font-semibold">
                  {booking.batchName} ({booking.batchCode})
                </span>
              </div>
            </div>
          )}

          {/* QR Code & Scan Entry */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            {primaryTicket && primaryTicket.qrCodeData && (
              <div className="p-2 border border-gold/60 rounded bg-white shadow-sm flex-shrink-0">
                <img
                  src={primaryTicket.qrCodeData}
                  alt={`QR Code for ${booking.bookingId}`}
                  className="w-32 h-32 object-contain"
                />
              </div>
            )}

            <div className="text-center sm:text-left space-y-1 text-xs text-ink-soft">
              <span className="font-bold text-maroon text-sm block">ENTRY QR CODE</span>
              <p>Present this QR code at the auditorium entrance gate on September 26, 2026.</p>
              <p className="font-mono text-ink">Payment ID: {booking.paymentId}</p>
              <p className="text-[10px] text-bronze uppercase font-semibold">Non-Transferable • Official M.S. Natyakshetra Pass</p>
            </div>
          </div>
        </div>

        {/* Ticket Footer Assistance Note */}
        <div
          className="p-4 text-center border-t border-gold/30 text-xs text-ink-soft"
          style={{
            background: '#EFE3CC',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          Need assistance? Contact M.S. Natyakshetra Admin Team at <strong>support@msnatyakshetra.com</strong>
        </div>
      </div>

      {/* Action Buttons (Hidden in PDF Print View) */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center no-print">
        <PrintTicketButton />
        <Link href="/" className="luxe-button luxe-button-outline text-center">
          &larr; BACK TO HOME PAGE
        </Link>
      </div>
    </div>
  );
}

