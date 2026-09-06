import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const STANDARD_CAPACITY = 502; // Rows A–M
    const MIDDLE_ROW_CAPACITY = 70; // Rows N & O
    const BACK_ROW_CAPACITY = 73;   // Rows P, Q & R (P29 blocked)
    const TOTAL_EVENT_CAPACITY = STANDARD_CAPACITY + MIDDLE_ROW_CAPACITY + BACK_ROW_CAPACITY; // 645

    const [paidBookings, middleRowBookings, backRowBookings] = await Promise.all([
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { ticketQty: true },
      }),
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID', seatTier: 'MIDDLE_ROW' },
        _sum: { ticketQty: true },
      }),
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID', seatTier: 'BACK_ROW' },
        _sum: { ticketQty: true },
      }),
    ]);

    const totalBooked = paidBookings._sum.ticketQty || 0;
    const middleRowBooked = middleRowBookings._sum.ticketQty || 0;
    const backRowBooked = backRowBookings._sum.ticketQty || 0;
    const standardBooked = totalBooked - middleRowBooked - backRowBooked;

    const remainingTickets = Math.max(0, TOTAL_EVENT_CAPACITY - totalBooked);
    const standardRemaining = Math.max(0, STANDARD_CAPACITY - standardBooked);
    const middleRowRemaining = Math.max(0, MIDDLE_ROW_CAPACITY - middleRowBooked);
    const backRowRemaining = Math.max(0, BACK_ROW_CAPACITY - backRowBooked);
    const isSoldOut = remainingTickets === 0;

    return NextResponse.json({
      success: true,
      totalCapacity: TOTAL_EVENT_CAPACITY,
      totalBooked,
      remainingTickets,
      isSoldOut,
      standardPrice: 850.0,
      middleRowPrice: 750.0,
      backRowPrice: 500.0,
      standardCapacity: STANDARD_CAPACITY,
      standardBooked,
      standardRemaining,
      middleRowCapacity: MIDDLE_ROW_CAPACITY,
      middleRowBooked,
      middleRowRemaining,
      backRowCapacity: BACK_ROW_CAPACITY,
      backRowBooked,
      backRowRemaining,
    });
  } catch (error) {
    console.error('Error fetching event capacity:', error);
    return NextResponse.json(
      { success: false, error: 'Server error fetching event capacity.' },
      { status: 500 }
    );
  }
}
