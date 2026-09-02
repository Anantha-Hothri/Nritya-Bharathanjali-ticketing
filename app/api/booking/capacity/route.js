import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const TOTAL_EVENT_CAPACITY = 645;
    const BACK_ROW_CAPACITY = 45;

    const [paidBookings, backRowBookings] = await Promise.all([
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { ticketQty: true },
      }),
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID', seatTier: 'BACK_ROW' },
        _sum: { ticketQty: true },
      }),
    ]);

    const totalBooked = paidBookings._sum.ticketQty || 0;
    const backRowBooked = backRowBookings._sum.ticketQty || 0;
    const remainingTickets = Math.max(0, TOTAL_EVENT_CAPACITY - totalBooked);
    const backRowRemaining = Math.max(0, BACK_ROW_CAPACITY - backRowBooked);
    const isSoldOut = remainingTickets === 0;

    return NextResponse.json({
      success: true,
      totalCapacity: TOTAL_EVENT_CAPACITY,
      totalBooked,
      remainingTickets,
      isSoldOut,
      ticketPrice: 850.0,
      standardPrice: 850.0,
      backRowPrice: 500.0,
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
