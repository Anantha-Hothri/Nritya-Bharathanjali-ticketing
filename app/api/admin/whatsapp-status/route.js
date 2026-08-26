import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getAdminSession } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

// Bridge is considered online if it polled within the last 90 seconds
const ONLINE_WINDOW_MS = 90 * 1000;

export async function GET(request) {
  const adminSession = await getAdminSession(request);
  if (!adminSession) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [bridge, pendingCount, sentCount, failedCount] = await Promise.all([
      prisma.whatsAppBridge.findUnique({ where: { id: 'bridge' } }),
      prisma.whatsAppMessage.count({ where: { status: { in: ['PENDING', 'SENDING'] } } }),
      prisma.whatsAppMessage.count({ where: { status: 'SENT' } }),
      prisma.whatsAppMessage.count({ where: { status: 'FAILED' } }),
    ]);

    const seenRecently =
      Boolean(bridge) && Date.now() - new Date(bridge.lastSeenAt).getTime() < ONLINE_WINDOW_MS;
    const online = Boolean(bridge && bridge.connected) && seenRecently;

    return NextResponse.json({
      success: true,
      bridge: {
        online,
        connectedNumber: bridge ? bridge.connectedNumber : null,
        lastSeenAt: bridge ? bridge.lastSeenAt : null,
        // Login QR is only meaningful while the bridge is alive and unlinked
        qr: !online && seenRecently && bridge ? bridge.qrCode : null,
      },
      queue: {
        pending: pendingCount,
        sent: sentCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching WhatsApp status:', error);
    return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
}
