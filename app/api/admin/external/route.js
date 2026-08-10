import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const externalRows = await prisma.externalAllocation.findMany({
      orderBy: { rowName: 'asc' },
    });

    const paidExtBookings = await prisma.booking.findMany({
      where: { paymentStatus: 'PAID', buyerType: 'EXTERNAL' },
    });

    const totalExtPeople = paidExtBookings.length;

    const formatted = externalRows.map((r) => ({
      id: r.id,
      rowName: r.rowName,
      capacity: r.capacity,
      bookedCount: r.bookedCount, // Seats Booked
      peopleBooked: totalExtPeople, // People count for external category
      remainingCount: Math.max(0, r.capacity - r.bookedCount),
      ticketPrice: r.ticketPrice,
      totalCollected: r.bookedCount * r.ticketPrice,
    }));

    return NextResponse.json({
      success: true,
      external: formatted,
    });
  } catch (error) {
    console.error('Error fetching admin external rows:', error);
    return NextResponse.json(
      { success: false, error: 'Server error fetching external allocations.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { rowName, capacity, ticketPrice } = await request.json();

    if (!rowName || !capacity) {
      return NextResponse.json(
        { success: false, error: 'Row name and capacity are required.' },
        { status: 400 }
      );
    }

    const cleanRow = rowName.trim().toUpperCase();

    const allocation = await prisma.externalAllocation.upsert({
      where: { rowName: cleanRow },
      update: {
        capacity: Number(capacity),
        ticketPrice: ticketPrice ? Number(ticketPrice) : 500.0,
      },
      create: {
        rowName: cleanRow,
        capacity: Number(capacity),
        ticketPrice: ticketPrice ? Number(ticketPrice) : 500.0,
      },
    });

    return NextResponse.json({
      success: true,
      allocation,
    });
  } catch (error) {
    console.error('Error adding external allocation:', error);
    return NextResponse.json(
      { success: false, error: 'Server error creating external allocation.' },
      { status: 500 }
    );
  }
}
