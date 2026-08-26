import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getAdminSession } from '../../../../lib/adminAuth';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const adminSession = await getAdminSession(request);
  if (!adminSession) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingId, verifiedTransactionId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Missing bookingId.' }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
      where: { bookingId },
      include: { tickets: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
    }

    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json({ success: true, alreadyPaid: true, bookingId });
    }

    // Mark booking as PAID with verified transaction ID
    const paymentRef = verifiedTransactionId || booking.utrNumber || `UPI_${Date.now()}`;
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'PAID',
        paymentId: paymentRef,
      },
    });

    // Create Ticket records with QR codes
    const createdTickets = [];
    for (let i = 1; i <= updatedBooking.ticketQty; i++) {
      const ticketCode = `${updatedBooking.bookingId}-T${i}`;
      const qrPayload = JSON.stringify({
        event: 'Nritya Bharathanjali 2026 – Skanda',
        date: 'September 26, 2026',
        ticketCode,
        bookingId: updatedBooking.bookingId,
        customer: updatedBooking.customerName,
      });
      const qrData = await QRCode.toDataURL(qrPayload);
      const ticket = await prisma.ticket.upsert({
        where: { ticketCode },
        update: { qrCodeData: qrData },
        create: { ticketCode, bookingId: updatedBooking.id, qrCodeData: qrData },
      });
      createdTickets.push(ticket);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skandaproduction.com';
    const confirmationMessage = `✅ Your payment of ₹${updatedBooking.totalAmount.toLocaleString('en-IN')} has been confirmed!\n\nYour ${updatedBooking.ticketQty} ticket(s) for M.S. Naatyakshetra – Nritya Bharathanjali 2026 are now booked.\n\nView & download your e-ticket: ${appUrl}/ticket/${updatedBooking.bookingId}`;

    // Send Email receipt notification
    try {
      const { sendBroadcastNotification } = await import('../../../../lib/notificationService');
      await sendBroadcastNotification({
        channel: 'EMAIL',
        booking: updatedBooking,
        message: confirmationMessage,
        attachments: [],
      });
    } catch (notifyErr) {
      console.warn('Notification send warning (non-fatal):', notifyErr.message);
    }

    // Queue automatic WhatsApp ticket confirmation (delivered by the local bridge)
    try {
      const { queueWhatsAppMessage } = await import('../../../../lib/whatsappQueue');
      await queueWhatsAppMessage({
        phone: updatedBooking.whatsapp || updatedBooking.phone,
        recipientName: updatedBooking.customerName,
        body: `🎭 *M.S. Naatyakshetra — Nritya Bharathanjali 2026*\n\nDear ${updatedBooking.customerName},\n\n${confirmationMessage}`,
        source: 'TICKET_CONFIRMATION',
        bookingRef: updatedBooking.bookingId,
      });
    } catch (waErr) {
      console.warn('WhatsApp queue warning (non-fatal):', waErr.message);
    }

    return NextResponse.json({
      success: true,
      bookingId: updatedBooking.bookingId,
      ticketCount: createdTickets.length,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json({ success: false, error: `Server error: ${error?.message}` }, { status: 500 });
  }
}
