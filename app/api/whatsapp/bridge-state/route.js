import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getAdminSession, verifyAdminToken } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

async function getBridgeSession(request) {
  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) {
    const session = await verifyAdminToken(auth.slice(7));
    if (session) return session;
  }
  return getAdminSession(request);
}

// The bridge reports its connection state here: a fresh login QR while
// waiting for a scan, or connected=true (which clears the QR) once linked.
export async function POST(request) {
  const session = await getBridgeSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { connected = false, number = null, qr = null } = await request.json();

    const data = {
      connected: Boolean(connected),
      connectedNumber: number || null,
      qrCode: connected ? null : qr || null,
      lastSeenAt: new Date(),
    };

    await prisma.whatsAppBridge.upsert({
      where: { id: 'bridge' },
      update: data,
      create: { id: 'bridge', ...data },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating bridge state:', error);
    return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
}
