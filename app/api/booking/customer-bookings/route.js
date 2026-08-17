import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || searchParams.get('phone') || searchParams.get('email');

    if (!query || !query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Phone number, email address, or booking ID is required.' },
        { status: 400 }
      );
    }

    const cleanQuery = query.trim();
    const digitsOnly = cleanQuery.replace(/\D/g, '');

    const orConditions = [
      { email: { contains: cleanQuery } },
      { customerName: { contains: cleanQuery } },
      { studentName: { contains: cleanQuery } },
      { bookingId: { contains: cleanQuery } },
      { bookingId: { contains: cleanQuery.toUpperCase() } },
    ];

    if (digitsOnly.length >= 3) {
      orConditions.push({ phone: { contains: digitsOnly } });
      orConditions.push({ whatsapp: { contains: digitsOnly } });
    }

    if (cleanQuery) {
      orConditions.push({ phone: { contains: cleanQuery } });
      orConditions.push({ whatsapp: { contains: cleanQuery } });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: orConditions,
      },
      orderBy: { bookingDate: 'desc' },
      include: { tickets: true },
    });

    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Server error retrieving customer bookings.' },
      { status: 500 }
    );
  }
}
