import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const STANDARD_CAPACITY = 502; // Rows A–M
    const MIDDLE_ROW_CAPACITY = 70; // Rows N & O
    const BACK_ROW_CAPACITY = 73;   // Rows P, Q & R (P29 blocked)
    const TOTAL_EVENT_CAPACITY = STANDARD_CAPACITY + MIDDLE_ROW_CAPACITY + BACK_ROW_CAPACITY; // 645

    // Fetch all PAID bookings — we parse allocatedSeats to get exact row occupancy,
    // because admin can assign any seat to any booking tier (not just matching tier rows).
    const [paidBookings, allocatedPaidBookings, notAllocatedMiddleRow, notAllocatedBackRow] = await Promise.all([
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { ticketQty: true },
      }),
      // All PAID+ALLOCATED bookings — parse allocatedSeats to count N/O and P/Q/R seats exactly
      prisma.booking.findMany({
        where: { paymentStatus: 'PAID', allocationStatus: 'ALLOCATED' },
        select: { allocatedSeats: true },
      }),
      // PAID MIDDLE_ROW bookings not yet seat-allocated — count by ticketQty (no seats assigned yet)
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID', seatTier: 'MIDDLE_ROW', allocationStatus: 'NOT_ALLOCATED' },
        _sum: { ticketQty: true },
      }),
      // PAID BACK_ROW bookings not yet seat-allocated
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID', seatTier: 'BACK_ROW', allocationStatus: 'NOT_ALLOCATED' },
        _sum: { ticketQty: true },
      }),
    ]);

    // Parse allocatedSeats strings (e.g. "N5, N6, O12") to count actual physical N/O and P/Q/R seats
    let middleRowFromSeats = 0;
    let backRowFromSeats = 0;
    let standardFromSeats = 0;

    for (const booking of allocatedPaidBookings) {
      const seats = (booking.allocatedSeats || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      for (const seatId of seats) {
        const row = seatId[0]?.toUpperCase();
        if (row === 'N' || row === 'O') middleRowFromSeats++;
        else if (row === 'P' || row === 'Q' || row === 'R') backRowFromSeats++;
        // A and B rows are VIP — excluded from zone counts
        else if (row && row >= 'C' && row <= 'M') standardFromSeats++;
      }
    }

    const totalBooked = paidBookings._sum.ticketQty || 0;
    const notAllocatedMiddleQty = notAllocatedMiddleRow._sum.ticketQty || 0;
    const notAllocatedBackQty = notAllocatedBackRow._sum.ticketQty || 0;

    // Total occupied = physically allocated seats in that zone + paid tickets not yet seat-assigned
    const middleRowBooked = middleRowFromSeats + notAllocatedMiddleQty;
    const backRowBooked = backRowFromSeats + notAllocatedBackQty;
    const standardBooked = totalBooked - middleRowBooked - backRowBooked;

    const remainingTickets = Math.max(0, TOTAL_EVENT_CAPACITY - totalBooked);
    const standardRemaining = Math.max(0, STANDARD_CAPACITY - standardBooked);
    const middleRowRemaining = Math.max(0, MIDDLE_ROW_CAPACITY - middleRowBooked);
    const backRowRemaining = Math.max(0, BACK_ROW_CAPACITY - backRowBooked);
    const isSoldOut = remainingTickets === 0;

    return NextResponse.json({
      success: true,
      totalCapacity: TOTAL_EVENT_CAPACITY,
      totalBooked,
      remainingTickets,
      isSoldOut,
      standardClosed: true, // ₹850 tier is no longer available for public booking
      standardPrice: 850.0,
      middleRowPrice: 750.0,
      backRowPrice: 500.0,
      standardCapacity: STANDARD_CAPACITY,
      standardBooked,
      standardRemaining,
      middleRowCapacity: MIDDLE_ROW_CAPACITY,
      middleRowBooked,
      middleRowRemaining,
      backRowCapacity: BACK_ROW_CAPACITY,
      backRowBooked,
      backRowRemaining,
    });
  } catch (error) {
    console.error('Error fetching event capacity:', error);
    return NextResponse.json(
      { success: false, error: 'Server error fetching event capacity.' },
      { status: 500 }
    );
  }
}
