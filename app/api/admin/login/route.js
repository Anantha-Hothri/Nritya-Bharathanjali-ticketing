import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { createAdminToken, ADMIN_COOKIE_NAME } from '../../../../lib/adminAuth';
import { verifyPassword } from '../../../../lib/password';

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

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    // Query database strictly for existing AdminUser record
    const admin = await prisma.adminUser.findUnique({
      where: { username: trimmedUsername },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    // Verify password hash
    const isValid = verifyPassword(trimmedPassword, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    // Ensure role is ADMIN
    if (admin.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Access denied: Admin role required.' },
        { status: 403 }
      );
    }

    // Generate signed admin session token
    const token = await createAdminToken({
      username: admin.username,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        username: admin.username,
        role: admin.role,
      },
    });

    // Set secure HttpOnly cookie for admin portal session
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Error logging in admin:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during admin login.' },
      { status: 500 }
    );
  }
}
