import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const TOTAL_EVENT_CAPACITY = 600;

    const paidBookings = await prisma.booking.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { ticketQty: true },
    });

    const totalBooked = paidBookings._sum.ticketQty || 0;
    const remainingTickets = Math.max(0, TOTAL_EVENT_CAPACITY - totalBooked);
    const isSoldOut = remainingTickets === 0;

    return NextResponse.json({
      success: true,
      totalCapacity: TOTAL_EVENT_CAPACITY,
      totalBooked,
      remainingTickets,
      isSoldOut,
      ticketPrice: 850.0,
    });
  } catch (error) {
    console.error('Error fetching event capacity:', error);
    return NextResponse.json(
      { success: false, error: 'Server error fetching event capacity.' },
      { status: 500 }
    );
  }
}
