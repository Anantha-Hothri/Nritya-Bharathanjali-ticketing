import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Admin logged out successfully.',
    });

    // Clear admin HttpOnly cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Error logging out admin:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during logout.' },
      { status: 500 }
    );
  }
}
