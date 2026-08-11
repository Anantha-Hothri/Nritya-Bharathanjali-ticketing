import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const defaultUser = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
    const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || 'msn_skanda_admin_2026';

    let admin = await prisma.adminUser.findUnique({
      where: { username: username.trim() },
    });

    if (!admin && username.trim() === defaultUser && password.trim() === defaultPass) {
      // Auto-create default admin
      admin = await prisma.adminUser.create({
        data: {
          username: defaultUser,
          passwordHash: defaultPass,
          role: 'ADMIN',
        },
      });
    }

    if (!admin || admin.passwordHash !== password.trim()) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during admin login.' },
      { status: 500 }
    );
  }
}
