import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const batches = await prisma.batchAllocation.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const paidBookings = await prisma.booking.findMany({
      where: { paymentStatus: 'PAID', buyerType: 'MSN' },
    });

    const formattedBatches = batches.map((b) => {
      let rows = [];
      try {
        rows = JSON.parse(b.assignedRows);
      } catch (e) {
        rows = [b.assignedRows];
      }

      // Count people who booked for this batch
      const batchBookings = paidBookings.filter((bk) => bk.batchCode === b.batchCode);
      const peopleBooked = batchBookings.length;

      const remainingSeats = Math.max(0, b.capacity - b.bookedCount);
      const totalCollected = b.bookedCount * b.ticketPrice;

      return {
        id: b.id,
        batchName: b.batchName,
        batchCode: b.batchCode,
        assignedRows: rows,
        capacity: b.capacity,
        bookedCount: b.bookedCount, // Seats booked
        peopleBooked, // People/Buyers count
        remainingCount: remainingSeats,
        ticketPrice: b.ticketPrice,
        totalCollected,
        createdAt: b.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      batches: formattedBatches,
    });
  } catch (error) {
    console.error('Error fetching admin batches:', error);
    return NextResponse.json(
      { success: false, error: 'Server error fetching batches.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { batchName, batchCode, assignedRows, capacity, ticketPrice } = await request.json();

    if (!batchName || !batchCode || !capacity) {
      return NextResponse.json(
        { success: false, error: 'Batch name, batch code, and capacity are required.' },
        { status: 400 }
      );
    }

    const cleanCode = batchCode.trim().toUpperCase();
    const rowsJson = Array.isArray(assignedRows) ? JSON.stringify(assignedRows) : JSON.stringify([assignedRows]);

    const newBatch = await prisma.batchAllocation.upsert({
      where: { batchCode: cleanCode },
      update: {
        batchName: batchName.trim(),
        assignedRows: rowsJson,
        capacity: Number(capacity),
        ticketPrice: ticketPrice ? Number(ticketPrice) : 500.0,
      },
      create: {
        batchName: batchName.trim(),
        batchCode: cleanCode,
        assignedRows: rowsJson,
        capacity: Number(capacity),
        ticketPrice: ticketPrice ? Number(ticketPrice) : 500.0,
      },
    });

    return NextResponse.json({
      success: true,
      batch: newBatch,
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { success: false, error: 'Server error creating batch.' },
      { status: 500 }
    );
  }
}
