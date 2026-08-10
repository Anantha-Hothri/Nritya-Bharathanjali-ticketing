import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function POST(request) {
  try {
    const { batchCode } = await request.json();

    if (!batchCode || typeof batchCode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Batch code is required.' },
        { status: 400 }
      );
    }

    const cleanCode = batchCode.trim().toUpperCase();

    const batch = await prisma.batchAllocation.findFirst({
      where: {
        batchCode: {
          equals: cleanCode,
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid Batch Code '${cleanCode}'. Please verify with your class instructor.`,
        },
        { status: 404 }
      );
    }

    let rows = [];
    try {
      rows = JSON.parse(batch.assignedRows);
    } catch (e) {
      rows = [batch.assignedRows];
    }

    const remainingCount = Math.max(0, batch.capacity - batch.bookedCount);

    return NextResponse.json({
      success: true,
      batch: {
        id: batch.id,
        batchName: batch.batchName,
        batchCode: batch.batchCode,
        assignedRows: rows,
        capacity: batch.capacity,
        bookedCount: batch.bookedCount,
        remainingCount,
        ticketPrice: batch.ticketPrice,
      },
    });
  } catch (error) {
    console.error('Error validating batch code:', error);
    return NextResponse.json(
      { success: false, error: 'Server error validating batch code.' },
      { status: 500 }
    );
  }
}
