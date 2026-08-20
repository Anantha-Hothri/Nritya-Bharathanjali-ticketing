import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getAdminSession } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const adminSession = await getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin access.' },
        { status: 401 }
      );
    }

    const seats = await prisma.seat.findMany({
      orderBy: [{ row: 'asc' }, { number: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      seats,
    });
  } catch (error) {
    console.error('Error fetching seats master:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seats master database.' },
      { status: 500 }
    );
  }
}
