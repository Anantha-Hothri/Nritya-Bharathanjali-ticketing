import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { getAdminSession } from '../../../../../lib/adminAuth';

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
    const { action, seatIds } = body; // action: 'acquire' | 'release'

    if (!Array.isArray(seatIds)) {
      return NextResponse.json(
        { success: false, error: 'seatIds must be an array.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const adminId = adminSession.username || 'admin';

    if (action === 'acquire') {
      // Check if any seat is already locked by another admin and not expired
      const existingSeats = await prisma.seat.findMany({
        where: { seatId: { in: seatIds } },
      });

      for (const s of existingSeats) {
        if (
          s.lockedBy &&
          s.lockedBy !== adminId &&
          s.lockedUntil &&
          new Date(s.lockedUntil) > now
        ) {
          return NextResponse.json(
            {
              success: false,
              error: `Seat ${s.seatId} is currently being selected by another admin (${s.lockedBy}).`,
            },
            { status: 409 }
          );
        }
      }

      // Lock seats for 60 seconds
      const lockedUntil = new Date(now.getTime() + 60 * 1000);

      await prisma.seat.updateMany({
        where: { seatId: { in: seatIds } },
        data: {
          lockedBy: adminId,
          lockedUntil,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Seats locked for 60 seconds.',
        lockedUntil,
      });
    } else if (action === 'release') {
      await prisma.seat.updateMany({
        where: { seatId: { in: seatIds }, lockedBy: adminId },
        data: {
          lockedBy: null,
          lockedUntil: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Seat locks released.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error locking seats:', error);
    return NextResponse.json(
      { success: false, error: 'Server error managing seat locks.' },
      { status: 500 }
    );
  }
}
