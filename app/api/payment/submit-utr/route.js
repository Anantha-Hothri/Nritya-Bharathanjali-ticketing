import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { bookingId, utrNumber } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Missing bookingId.' }, { status: 400 });
    }

    if (!utrNumber || !/^\d{12}$/.test(utrNumber.trim())) {
      return NextResponse.json(
        { success: false, error: 'Invalid Transaction ID. Please enter the exact 12-digit UPI Transaction ID / UTR Number.' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findFirst({
      where: { bookingId },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
    }

    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json({ success: true, alreadyPaid: true, bookingId });
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'UTR_SUBMITTED',
        utrNumber: utrNumber ? utrNumber.trim() : null,
        upiPaymentAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, bookingId });
  } catch (error) {
    console.error('Error submitting UTR:', error);
    return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
}
