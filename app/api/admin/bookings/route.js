import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getAdminSession } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const adminSession = await getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin access.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get('paymentStatus');

    const whereClause = {};
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { bookingDate: 'desc' },
      include: { tickets: true },
    });

    const TOTAL_EVENT_CAPACITY = 645;

    // Compute Metrics for Paid Bookings
    let totalCollections = 0;
    let totalTicketsBooked = 0;
    let totalPaidBookings = 0;
    let msnTickets = 0;
    let msnCollections = 0;
    let externalTickets = 0;
    let externalCollections = 0;

    bookings.forEach((b) => {
      if (b.paymentStatus === 'PAID') {
        totalCollections += b.totalAmount;
        totalTicketsBooked += b.ticketQty;
        totalPaidBookings += 1;

        if (b.buyerType === 'MSN') {
          msnTickets += b.ticketQty;
          msnCollections += b.totalAmount;
        } else {
          externalTickets += b.ticketQty;
          externalCollections += b.totalAmount;
        }
      }
    });

    const remainingTickets = Math.max(0, TOTAL_EVENT_CAPACITY - totalTicketsBooked);
    const occupancyPct = Math.round((totalTicketsBooked / TOTAL_EVENT_CAPACITY) * 100);

    return NextResponse.json({
      success: true,
      metrics: {
        totalCapacity: TOTAL_EVENT_CAPACITY,
        remainingTickets,
        occupancyPct,
        totalCollections,
        totalTicketsBooked,
        totalPaidBookings,
        totalBookings: bookings.length,
        msnTickets,
        msnCollections,
        externalTickets,
        externalCollections,
      },
      bookings,
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Server error fetching bookings.' },
      { status: 500 }
    );
  }
}
