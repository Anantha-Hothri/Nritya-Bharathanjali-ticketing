import React from 'react';
import { prisma } from '../../../lib/db';
import Link from 'next/link';
import ReceiptDocument from './ReceiptDocument';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  return {
    title: `Booking Acknowledgement #${params.bookingId} | Nritya Bharathanjali 2026`,
  };
}

export default async function ETicketPage({ params }) {
  const { bookingId } = params;

  const booking = await prisma.booking.findUnique({
    where: { bookingId },
  });

  if (!booking || booking.paymentStatus !== 'PAID') {
    return (
      <div className="py-20 text-center px-4 max-w-md mx-auto" style={{ background: 'var(--ivory)' }}>
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="font-serif-display text-3xl text-maroon font-bold mb-2">
          Booking Acknowledgement Not Found
        </h1>
        <p className="text-sm text-ink-soft mb-6">
          The requested booking reference <code className="bg-sandal px-1 rounded">{bookingId}</code> does not exist or payment is unverified.
        </p>
        <Link href="/" className="luxe-button luxe-button-solid">
          RETURN TO HOME PAGE &rarr;
        </Link>
      </div>
    );
  }

  return <ReceiptDocument booking={booking} />;
}
