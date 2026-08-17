import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const adminSession = await getAdminSession(request);

    if (!adminSession) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Unauthorized admin access.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        username: adminSession.username,
        role: adminSession.role,
      },
    });
  } catch (error) {
    console.error('Error fetching admin session:', error);
    return NextResponse.json(
      { success: false, authenticated: false, error: 'Server error checking admin session.' },
      { status: 500 }
    );
  }
}
