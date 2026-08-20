import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getAdminSession } from '../../../../lib/adminAuth';
import { sendSeatAllocationNotification } from '../../../../lib/notificationService';

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
    const { bookingId, seatIds } = body;

    if (!bookingId || !Array.isArray(seatIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload. bookingId and seatIds array are required.' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking record not found.' },
        { status: 404 }
      );
    }

    if (seatIds.length !== booking.ticketQty) {
      return NextResponse.json(
        {
          success: false,
          error: `Seat count mismatch. Booking requires exactly ${booking.ticketQty} seats, but ${seatIds.length} were selected.`,
        },
        { status: 400 }
      );
    }

    // Check if any selected seat is locked or allocated to another booking
    const seatsToAllocate = await prisma.seat.findMany({
      where: { seatId: { in: seatIds } },
    });

    for (const seat of seatsToAllocate) {
      if (seat.status === 'LOCKED') {
        return NextResponse.json(
          { success: false, error: `Seat ${seat.seatId} is a locked VIP seat and cannot be allocated.` },
          { status: 400 }
        );
      }
      if (seat.status === 'ALLOCATED' && seat.allocatedToBookingId !== booking.id) {
        return NextResponse.json(
          { success: false, error: `Seat ${seat.seatId} is already allocated to another booking.` },
          { status: 400 }
        );
      }
    }

    // Release any previous seats allocated to this booking
    await prisma.seat.updateMany({
      where: { allocatedToBookingId: booking.id },
      data: {
        status: 'AVAILABLE',
        allocatedToBookingId: null,
        allocatedBy: null,
        allocatedAt: null,
      },
    });

    // Mark selected seats as ALLOCATED
    await prisma.seat.updateMany({
      where: { seatId: { in: seatIds } },
      data: {
        status: 'ALLOCATED',
        allocatedToBookingId: booking.id,
        allocatedBy: adminSession.username || 'admin',
        allocatedAt: new Date(),
      },
    });

    const allocatedSeatsStr = seatIds.join(', ');

    // Update Booking Record
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        allocatedSeats: allocatedSeatsStr,
        allocationStatus: 'ALLOCATED',
        allocatedBy: adminSession.username || 'admin',
        allocatedAt: new Date(),
        notificationSent: true,
      },
    });

    // Send Automated WhatsApp & Email Notification
    const notifResult = await sendSeatAllocationNotification({
      booking: updatedBooking,
      allocatedSeatsList: seatIds,
      adminUser: adminSession,
    });

    return NextResponse.json({
      success: true,
      message: 'Seats allocated successfully and receipt notification dispatched.',
      booking: updatedBooking,
      allocatedSeats: seatIds,
      notification: notifResult,
    });
  } catch (error) {
    console.error('Error allocating seats:', error);
    return NextResponse.json(
      { success: false, error: 'Server error while allocating seats.' },
      { status: 500 }
    );
  }
}
