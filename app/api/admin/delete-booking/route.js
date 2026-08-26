import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getAdminSession } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const adminSession = await getAdminSession(request);
  if (!adminSession) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Missing bookingId.' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Free any seats allocated to this booking before removing it —
      // Seat.allocatedToBookingId is a plain field, not a cascading FK,
      // so this must happen explicitly or seats would stay stuck ALLOCATED.
      const freed = await tx.seat.updateMany({
        where: { allocatedToBookingId: booking.id },
        data: {
          status: 'AVAILABLE',
          allocatedToBookingId: null,
          allocatedBy: null,
          allocatedAt: null,
        },
      });

      // Deletes cascade to this booking's Ticket rows automatically (schema-level onDelete: Cascade)
      await tx.booking.delete({ where: { id: booking.id } });

      return { freedSeatCount: freed.count };
    });

    return NextResponse.json({
      success: true,
      deletedBookingId: booking.bookingId,
      freedSeatCount: result.freedSeatCount,
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ success: false, error: `Server error: ${error?.message}` }, { status: 500 });
  }
}
