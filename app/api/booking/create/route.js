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
      seatTier,
    } = bookingData;

    const qty = Number(ticketQty);
    const category = 'EXTERNAL';
    const tier = seatTier === 'BACK_ROW' ? 'BACK_ROW' : seatTier === 'MIDDLE_ROW' ? 'MIDDLE_ROW' : 'STANDARD';

    if (!customerName || !phone || !email || isNaN(qty) || qty < 1) {
      return NextResponse.json(
        { success: false, error: 'Missing required customer or ticket information.' },
        { status: 400 }
      );
    }

    const STANDARD_CAPACITY = 502;
    const MIDDLE_ROW_CAPACITY = 70;
    const BACK_ROW_CAPACITY = 73;
    const TOTAL_EVENT_CAPACITY = STANDARD_CAPACITY + MIDDLE_ROW_CAPACITY + BACK_ROW_CAPACITY; // 645

    // Server-side capacity validation
    const [paidBookings, middleRowBookings, backRowBookings] = await Promise.all([
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { ticketQty: true },
      }),
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID', seatTier: 'MIDDLE_ROW' },
        _sum: { ticketQty: true },
      }),
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID', seatTier: 'BACK_ROW' },
        _sum: { ticketQty: true },
      }),
    ]);

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

    // Standard sub-capacity check (max 502 standard seats)
    if (tier === 'STANDARD') {
      const middleBooked = middleRowBookings._sum.ticketQty || 0;
      const backBooked = backRowBookings._sum.ticketQty || 0;
      const standardBooked = currentBooked - middleBooked - backBooked;
      const standardRemaining = Math.max(0, STANDARD_CAPACITY - standardBooked);
      if (qty > standardRemaining) {
        return NextResponse.json(
          {
            success: false,
            error:
              standardRemaining > 0
                ? `Only ${standardRemaining} standard seats remaining. Please reduce quantity or choose a different section.`
                : `Sorry, all standard seats are sold out. Middle Row or Back Row seats may still be available.`,
          },
          { status: 400 }
        );
      }
    }

    // Middle-row sub-capacity check (max 70 seats, rows N & O)
    if (tier === 'MIDDLE_ROW') {
      const middleBooked = middleRowBookings._sum.ticketQty || 0;
      const middleRemaining = Math.max(0, MIDDLE_ROW_CAPACITY - middleBooked);
      if (qty > middleRemaining) {
        return NextResponse.json(
          {
            success: false,
            error:
              middleRemaining > 0
                ? `Only ${middleRemaining} middle row seats remaining. Please reduce quantity or choose a different section.`
                : `Sorry, all middle row seats are sold out. Standard or Back Row seats may still be available.`,
          },
          { status: 400 }
        );
      }
    }

    // Back-row sub-capacity check (max 73 seats, rows P, Q & R)
    if (tier === 'BACK_ROW') {
      const backBooked = backRowBookings._sum.ticketQty || 0;
      const backRowRemaining = Math.max(0, BACK_ROW_CAPACITY - backBooked);
      if (qty > backRowRemaining) {
        return NextResponse.json(
          {
            success: false,
            error:
              backRowRemaining > 0
                ? `Only ${backRowRemaining} back row seats remaining. Please choose a different section or reduce quantity.`
                : `Sorry, all back row seats are sold out. Please choose Standard or Middle Row seats instead.`,
          },
          { status: 400 }
        );
      }
    }

    const ticketPrice = tier === 'BACK_ROW' ? 500.0 : tier === 'MIDDLE_ROW' ? 750.0 : 850.0;
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
        seatTier: tier,
        ticketPrice,
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
