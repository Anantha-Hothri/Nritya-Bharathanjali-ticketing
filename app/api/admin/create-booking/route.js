import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getAdminSession } from '../../../../lib/adminAuth';
import crypto from 'crypto';

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
    const {
      buyerType = 'MSN',
      customerName,
      studentName,
      phone,
      whatsapp,
      isWhatsappSame = true,
      email,
      ticketQty = 1,
      totalAmount,
      paymentStatus = 'PAID',
      teamCode = 'General',
    } = body;

    const qty = Number(ticketQty);
    if (!customerName || !phone || !email || isNaN(qty) || qty < 1) {
      return NextResponse.json(
        { success: false, error: 'Missing required customer name, phone, email or valid ticket count.' },
        { status: 400 }
      );
    }

    const calculatedAmount = totalAmount !== undefined && totalAmount !== '' ? Number(totalAmount) : qty * 850;
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const publicBookingId = `SKD-2026-${randomHex}`;
    const txnId = `ADMIN_MANUAL_${Date.now()}_${randomHex}`;

    // Create Booking
    const newBooking = await prisma.booking.create({
      data: {
        bookingId: publicBookingId,
        buyerType: buyerType === 'MSN' ? 'MSN' : 'EXTERNAL',
        customerName: customerName.trim(),
        studentName: studentName ? studentName.trim() : null,
        phone: phone.trim(),
        isWhatsappSame: Boolean(isWhatsappSame),
        whatsapp: whatsapp ? whatsapp.trim() : phone.trim(),
        email: email.trim(),
        ticketQty: qty,
        totalAmount: calculatedAmount,
        paymentStatus: paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
        merchantTransactionId: txnId,
        teamCode: teamCode ? teamCode.trim() : 'General',
      },
    });

    // If payment status is PAID, generate tickets automatically
    if (paymentStatus === 'PAID') {
      const ticketsData = [];
      for (let i = 0; i < qty; i++) {
        const ticketCode = `${publicBookingId}-T${i + 1}`;
        const qrPayload = JSON.stringify({
          ticketCode,
          bookingId: publicBookingId,
          customerName: customerName.trim(),
          buyerType,
        });
        ticketsData.push({
          ticketCode,
          bookingId: newBooking.id,
          qrCodeData: qrPayload,
        });
      }
      await prisma.ticket.createMany({ data: ticketsData });
    }

    return NextResponse.json({
      success: true,
      booking: newBooking,
    });
  } catch (error) {
    console.error('Error creating manual admin booking:', error);
    return NextResponse.json(
      { success: false, error: 'Server error creating manual booking.' },
      { status: 500 }
    );
  }
}
