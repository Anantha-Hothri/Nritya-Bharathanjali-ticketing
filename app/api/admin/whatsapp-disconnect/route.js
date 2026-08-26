import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getAdminSession } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

// Queues a LOGOUT command for the bridge. On its next poll the bridge logs
// the current WhatsApp number out, wipes the session, and emits a fresh
// login QR so a different number can be linked from the admin panel.
export async function POST(request) {
  const adminSession = await getAdminSession(request);
  if (!adminSession) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.whatsAppBridge.upsert({
      where: { id: 'bridge' },
      update: { command: 'LOGOUT' },
      create: { id: 'bridge', command: 'LOGOUT' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error requesting WhatsApp disconnect:', error);
    return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
}
