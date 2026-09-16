import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getAdminSession } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const adminSession = await getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin access.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'bookingId is required.' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found.' },
        { status: 404 }
      );
    }

    if (booking.allocationStatus !== 'ALLOCATED') {
      return NextResponse.json(
        { success: false, error: 'Booking has no allocated seats to deallocate.' },
        { status: 400 }
      );
    }

    // Free previously allocated seats: VIP rows → LOCKED, all others → AVAILABLE
    const previousSeats = await prisma.seat.findMany({
      where: { allocatedToBookingId: bookingId },
      select: { seatId: true, zone: true },
    });

    const vipSeatIds = previousSeats.filter((s) => s.zone === 'VIP Seats').map((s) => s.seatId);
    const nonVipSeatIds = previousSeats.filter((s) => s.zone !== 'VIP Seats').map((s) => s.seatId);

    if (vipSeatIds.length > 0) {
      await prisma.seat.updateMany({
        where: { seatId: { in: vipSeatIds } },
        data: { status: 'LOCKED', allocatedToBookingId: null, allocatedBy: null, allocatedAt: null },
      });
    }
    if (nonVipSeatIds.length > 0) {
      await prisma.seat.updateMany({
        where: { seatId: { in: nonVipSeatIds } },
        data: { status: 'AVAILABLE', allocatedToBookingId: null, allocatedBy: null, allocatedAt: null },
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        allocatedSeats: null,
        allocationStatus: 'UNALLOCATED',
        allocatedBy: null,
        allocatedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Seats deallocated for booking ${booking.bookingId}. ${previousSeats.length} seat(s) returned to available pool.`,
      freedSeats: previousSeats.map((s) => s.seatId),
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error deallocating seats:', error);
    return NextResponse.json(
      { success: false, error: 'Server error deallocating seats.' },
      { status: 500 }
    );
  }
}
