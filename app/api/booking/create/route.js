import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import crypto from 'crypto';

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
      studentName,
      batchName,
      batchCode,
      ticketQty,
    } = bookingData;

    if (!customerName || !phone || !email || !ticketQty || ticketQty < 1) {
      return NextResponse.json(
        { success: false, error: 'Missing required customer or ticket information.' },
        { status: 400 }
      );
    }

    let allocatedRow = 'Allocated Pool';
    let ticketPrice = 500.0;

    // Server-Side Inventory Check & Row Assignment
    if (buyerType === 'MSN') {
      if (ticketQty < 3) {
        return NextResponse.json(
          { success: false, error: 'MSN Student/Parent bookings require at least 3 tickets.' },
          { status: 400 }
        );
      }

      if (!batchCode) {
        return NextResponse.json(
          { success: false, error: 'Batch code is required for MSN bookings.' },
          { status: 400 }
        );
      }

      const batch = await prisma.batchAllocation.findUnique({
        where: { batchCode: batchCode.trim().toUpperCase() },
      });

      if (!batch) {
        return NextResponse.json(
          { success: false, error: 'Batch code not found.' },
          { status: 404 }
        );
      }

      const remaining = batch.capacity - batch.bookedCount;
      if (remaining < ticketQty) {
        return NextResponse.json(
          {
            success: false,
            error: `Only ${remaining} tickets are available for batch ${batch.batchName}.`,
          },
          { status: 400 }
        );
      }

      let parsedRows = [];
      try {
        parsedRows = JSON.parse(batch.assignedRows);
      } catch (e) {
        parsedRows = [batch.assignedRows];
      }
      allocatedRow = parsedRows.join(', ');
      ticketPrice = batch.ticketPrice;
    } else {
      // External Flow
      const externalRows = await prisma.externalAllocation.findMany({
        where: {
          capacity: { gt: prisma.externalAllocation.fields.bookedCount },
        },
      });

      let totalExtRemaining = 0;
      const rowNames = [];
      externalRows.forEach((r) => {
        const rem = Math.max(0, r.capacity - r.bookedCount);
        totalExtRemaining += rem;
        if (rem > 0) rowNames.push(r.rowName);
      });

      if (totalExtRemaining < ticketQty) {
        return NextResponse.json(
          {
            success: false,
            error: `Only ${totalExtRemaining} external tickets available.`,
          },
          { status: 400 }
        );
      }

      allocatedRow = rowNames.length > 0 ? rowNames.join(', ') : 'Row D, Row E';
      ticketPrice = externalRows.length > 0 ? externalRows[0].ticketPrice : 500.0;
    }

    const totalAmount = ticketQty * ticketPrice;

    // Generate Unique Public Booking ID e.g. SKD-2026-9B3F
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const publicBookingId = `SKD-2026-${randomHex}`;

    // Create Razorpay Mock/Real Order ID
    const razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    // Save PENDING Booking in DB
    const newBooking = await prisma.booking.create({
      data: {
        bookingId: publicBookingId,
        buyerType: buyerType || 'EXTERNAL',
        customerName: customerName.trim(),
        phone: phone.trim(),
        isWhatsappSame: Boolean(isWhatsappSame),
        whatsapp: whatsapp ? whatsapp.trim() : phone.trim(),
        email: email.trim(),
        studentName: studentName ? studentName.trim() : null,
        batchName: batchName ? batchName.trim() : null,
        batchCode: batchCode ? batchCode.trim().toUpperCase() : null,
        allocatedRow,
        ticketQty: Number(ticketQty),
        totalAmount,
        paymentStatus: 'PENDING',
        razorpayOrderId,
      },
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: newBooking.id,
        bookingId: newBooking.bookingId,
        customerName: newBooking.customerName,
        email: newBooking.email,
        phone: newBooking.phone,
        whatsapp: newBooking.whatsapp,
        buyerType: newBooking.buyerType,
        studentName: newBooking.studentName,
        batchName: newBooking.batchName,
        allocatedRow: newBooking.allocatedRow,
        ticketQty: newBooking.ticketQty,
        totalAmount: newBooking.totalAmount,
        razorpayOrderId: newBooking.razorpayOrderId,
      },
    });
  } catch (error) {
    console.error('Error creating booking order:', error);
    return NextResponse.json(
      { success: false, error: 'Server error creating booking order.' },
      { status: 500 }
    );
  }
}
