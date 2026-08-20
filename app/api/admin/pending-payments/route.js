import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getAdminSession } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const adminSession = await getAdminSession(request);
  if (!adminSession) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: { paymentStatus: 'UTR_SUBMITTED' },
      orderBy: { upiPaymentAt: 'asc' },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
}
