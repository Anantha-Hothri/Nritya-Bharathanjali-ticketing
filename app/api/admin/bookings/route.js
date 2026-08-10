import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerType = searchParams.get('buyerType');
    const batchCode = searchParams.get('batchCode');
    const paymentStatus = searchParams.get('paymentStatus');

    const whereClause = {};

    if (buyerType) whereClause.buyerType = buyerType;
    if (batchCode) whereClause.batchCode = batchCode.toUpperCase();
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { bookingDate: 'desc' },
      include: { tickets: true },
    });

    // Compute Metrics for Paid Bookings
    let totalCollections = 0;
    let totalSeatsBooked = 0;
    let totalPeopleBooked = 0;
    
    let msnCollections = 0;
    let msnSeatsBooked = 0;
    let msnPeopleBooked = 0;

    let externalCollections = 0;
    let externalSeatsBooked = 0;
    let externalPeopleBooked = 0;

    const batchBreakdownMap = {};

    bookings.forEach((b) => {
      if (b.paymentStatus === 'PAID') {
        totalCollections += b.totalAmount;
        totalSeatsBooked += b.ticketQty;
        totalPeopleBooked += 1;

        if (b.buyerType === 'MSN') {
          msnCollections += b.totalAmount;
          msnSeatsBooked += b.ticketQty;
          msnPeopleBooked += 1;

          const key = b.batchName || 'Unknown Batch';
          if (!batchBreakdownMap[key]) {
            batchBreakdownMap[key] = {
              batchName: key,
              batchCode: b.batchCode || 'N/A',
              peopleBooked: 0,
              seatsBooked: 0,
              collection: 0,
            };
          }
          batchBreakdownMap[key].peopleBooked += 1;
          batchBreakdownMap[key].seatsBooked += b.ticketQty;
          batchBreakdownMap[key].collection += b.totalAmount;
        } else {
          externalCollections += b.totalAmount;
          externalSeatsBooked += b.ticketQty;
          externalPeopleBooked += 1;
        }
      }
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalCollections,
        totalSeatsBooked,
        totalPeopleBooked,
        totalBookings: bookings.length,
        msnCollections,
        msnSeatsBooked,
        msnPeopleBooked,
        externalCollections,
        externalSeatsBooked,
        externalPeopleBooked,
        batchBreakdown: Object.values(batchBreakdownMap),
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
