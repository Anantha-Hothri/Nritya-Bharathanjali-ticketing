import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import crypto from 'crypto';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const bookingData = await request.json();

    const {
      buyerType,
      customerName,
      phone,
      whatsapp,
      isWhatsappSame,
      email,
      ticketQty,
    } = bookingData;

    const qty = Number(ticketQty);
    const category = buyerType === 'MSN' ? 'MSN' : 'EXTERNAL';

    if (!customerName || !phone || !email || isNaN(qty) || qty < 1) {
      return NextResponse.json(
        { success: false, error: 'Missing required customer or ticket information.' },
        { status: 400 }
      );
    }

    // MSN Minimum 3 Tickets Rule Enforcement
    if (category === 'MSN' && qty < 3) {
      return NextResponse.json(
        { success: false, error: 'MSN Student/Parent bookings require a minimum of 3 tickets.' },
        { status: 400 }
      );
    }

    const TOTAL_EVENT_CAPACITY = 645;

    // Server-side capacity validation against 645 total limit
    const paidBookings = await prisma.booking.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { ticketQty: true },
    });

    const currentBooked = paidBookings._sum.ticketQty || 0;
    const remaining = Math.max(0, TOTAL_EVENT_CAPACITY - currentBooked);

    if (qty > remaining) {
      return NextResponse.json(
        {
          success: false,
          error:
            remaining > 0
              ? `Only ${remaining} tickets remaining out of ${TOTAL_EVENT_CAPACITY} total event capacity.`
              : `Sorry, all ${TOTAL_EVENT_CAPACITY} event tickets are sold out! Bookings are closed.`,
        },
        { status: 400 }
      );
    }

    const ticketPrice = 850.0;
    const totalAmount = qty * ticketPrice;

    // Generate Unique Public Booking ID e.g. SKD-2026-9B3F
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const publicBookingId = `SKD-2026-${randomHex}`;

    // Generate PhonePe Merchant Transaction ID
    const merchantTransactionId = `TXN_SKD_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Save PENDING Booking in DB
    const newBooking = await prisma.booking.create({
      data: {
        bookingId: publicBookingId,
        buyerType: category,
        customerName: customerName.trim(),
        studentName: bookingData.studentName ? bookingData.studentName.trim() : null,
        phone: phone.trim(),
        isWhatsappSame: Boolean(isWhatsappSame),
        whatsapp: whatsapp ? whatsapp.trim() : phone.trim(),
        email: email.trim(),
        ticketQty: qty,
        totalAmount,
        paymentStatus: 'PENDING',
        merchantTransactionId,
      },
    });

    // Build UPI Deep Link & QR Code
    const upiId = process.env.UPI_ID || 'placeholder@upi';
    const upiName = encodeURIComponent(process.env.UPI_DISPLAY_NAME || 'M.S. Naatyakshetra');
    const upiNote = encodeURIComponent('Skanda2026 Ticket');
    const upiDeepLink = `upi://pay?pa=${upiId}&pn=${upiName}&am=${totalAmount}&tr=${merchantTransactionId}&tn=${upiNote}&cu=INR`;
    const qrCodeDataUrl = await QRCode.toDataURL(upiDeepLink, { width: 300, margin: 2 });

    return NextResponse.json({
      success: true,
      booking: {
        id: newBooking.id,
        bookingId: newBooking.bookingId,
        buyerType: newBooking.buyerType,
        customerName: newBooking.customerName,
        email: newBooking.email,
        phone: newBooking.phone,
        whatsapp: newBooking.whatsapp,
        ticketQty: newBooking.ticketQty,
        totalAmount: newBooking.totalAmount,
        merchantTransactionId: newBooking.merchantTransactionId,
      },
      upi: {
        upiId,
        upiDeepLink,
        qrCodeDataUrl,
        amount: totalAmount,
        reference: merchantTransactionId,
      },
    });
  } catch (error) {
    console.error('Error creating PhonePe booking order:', error);
    return NextResponse.json(
      { success: false, error: 'Server error creating booking order.' },
      { status: 500 }
    );
  }
}
