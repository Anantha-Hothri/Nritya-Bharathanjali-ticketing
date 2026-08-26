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
      // VIP seats default to LOCKED status but are intentionally allocatable via the admin seating chart
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

    // Send Automated Email Notification
    const notifResult = await sendSeatAllocationNotification({
      booking: updatedBooking,
      allocatedSeatsList: seatIds,
      adminUser: adminSession,
    });

    // Queue automatic WhatsApp seat confirmation (delivered by the local bridge)
    try {
      const { queueWhatsAppMessage, formatWhatsAppMessage } = await import('../../../../lib/whatsappQueue');
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skandaproduction.com';
      await queueWhatsAppMessage({
        phone: updatedBooking.whatsapp || updatedBooking.phone,
        recipientName: updatedBooking.customerName,
        body: formatWhatsAppMessage({
          recipientName: updatedBooking.customerName,
          message: `🎉 Your seats are confirmed! Your seat allocation for the event is finalized.\n\n📅 September 26, 2026 at 5:30 PM (Doors open 5:00 PM)\n📍 Dhwani Auditorium, CMRIT College Campus, Kundalahalli, Bengaluru\n\nView & download your e-ticket: ${appUrl}/ticket/${updatedBooking.bookingId}`,
          booking: updatedBooking,
        }),
        source: 'SEAT_ALLOCATION',
        bookingRef: updatedBooking.bookingId,
      });
    } catch (waErr) {
      console.warn('WhatsApp queue warning (non-fatal):', waErr.message);
    }

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
