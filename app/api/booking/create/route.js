import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import crypto from 'crypto';

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

    const TOTAL_EVENT_CAPACITY = 600;

    // Server-side capacity validation against 600 total limit
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

    // Prepare PhonePe Payment Initiation Payload
    const merchantId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
    const saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';

    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const amountInPaise = Math.round(totalAmount * 100);

    const payPayload = {
      merchantId,
      merchantTransactionId,
      merchantUserId: `MUID_${phone.trim()}`,
      amount: amountInPaise,
      redirectUrl: `${origin}/api/payment/verify?merchantTransactionId=${merchantTransactionId}`,
      redirectMode: 'POST',
      callbackUrl: `${origin}/api/payment/callback`,
      mobileNumber: phone.trim(),
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payPayload)).toString('base64');
    const stringToHash = base64Payload + '/pg/v1/pay' + saltKey;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = `${sha256Hash}###${saltIndex}`;

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
      phonepe: {
        merchantId,
        merchantTransactionId,
        base64Payload,
        checksum,
        hostUrl: process.env.PHONEPE_HOST_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox',
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
