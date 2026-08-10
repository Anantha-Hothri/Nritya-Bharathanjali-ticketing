import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function GET() {
  try {
    const rows = await prisma.externalAllocation.findMany({
      orderBy: { rowName: 'asc' },
    });

    let totalCapacity = 0;
    let totalBooked = 0;

    const formattedRows = rows.map((r) => {
      totalCapacity += r.capacity;
      totalBooked += r.bookedCount;
      const remaining = Math.max(0, r.capacity - r.bookedCount);
      return {
        id: r.id,
        rowName: r.rowName,
        capacity: r.capacity,
        bookedCount: r.bookedCount,
        remainingCount: remaining,
        ticketPrice: r.ticketPrice,
      };
    });

    const availableRows = formattedRows.filter((r) => r.remainingCount > 0);
    const totalRemaining = Math.max(0, totalCapacity - totalBooked);
    const defaultPrice = rows.length > 0 ? rows[0].ticketPrice : 500.0;

    return NextResponse.json({
      success: true,
      inventory: {
        totalCapacity,
        totalBooked,
        totalRemaining,
        defaultPrice,
        rows: formattedRows,
        availableRows,
      },
    });
  } catch (error) {
    console.error('Error fetching external inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Server error fetching external inventory.' },
      { status: 500 }
    );
  }
}
