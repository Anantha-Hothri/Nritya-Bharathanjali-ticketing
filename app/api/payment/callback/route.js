import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import QRCode from 'qrcode';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { response: base64Response } = body;

    if (!base64Response) {
      return NextResponse.json({ success: false, error: 'Missing response payload' }, { status: 400 });
    }

    const decodedString = Buffer.from(base64Response, 'base64').toString('utf-8');
    const decodedPayload = JSON.parse(decodedString);

    const { code, data } = decodedPayload;
    if (code === 'PAYMENT_SUCCESS' && data) {
      const { merchantTransactionId, providerReferenceId } = data;

      const booking = await prisma.booking.findFirst({
        where: { merchantTransactionId },
      });

      if (booking && booking.paymentStatus !== 'PAID') {
        const updatedBooking = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: 'PAID',
            paymentId: providerReferenceId || `PPN_${Date.now()}`,
          },
        });

        // Issue E-Tickets
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

          await prisma.ticket.upsert({
            where: { ticketCode },
            update: { qrCodeData: qrData },
            create: {
              ticketCode,
              bookingId: updatedBooking.id,
              qrCodeData: qrData,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Callback processed successfully' });
  } catch (error) {
    console.error('Error handling PhonePe callback:', error);
    return NextResponse.json({ success: false, error: 'Callback error' }, { status: 500 });
  }
}
