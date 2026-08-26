import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getAdminSession, verifyAdminToken } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

// The bridge authenticates with the admin JWT in an Authorization header
// (obtained via /api/admin/login); browser admin sessions use the cookie.
async function getBridgeSession(request) {
  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) {
    const session = await verifyAdminToken(auth.slice(7));
    if (session) return session;
  }
  return getAdminSession(request);
}

export async function GET(request) {
  const session = await getBridgeSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '5', 10) || 5, 1), 20);
    const connected = searchParams.get('connected') === 'true';
    const number = searchParams.get('number') || null;

    // Heartbeat — the admin UI reads this to show bridge online/offline
    await prisma.whatsAppBridge.upsert({
      where: { id: 'bridge' },
      update: { connected, connectedNumber: number, lastSeenAt: new Date() },
      create: { id: 'bridge', connected, connectedNumber: number },
    });

    // Reclaim messages stuck in SENDING for >5 min (bridge crashed mid-send)
    const staleCutoff = new Date(Date.now() - 5 * 60 * 1000);
    await prisma.whatsAppMessage.updateMany({
      where: { status: 'SENDING', claimedAt: { lt: staleCutoff } },
      data: { status: 'PENDING' },
    });

    const pending = await prisma.whatsAppMessage.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: { broadcast: true },
    });

    if (pending.length > 0) {
      await prisma.whatsAppMessage.updateMany({
        where: { id: { in: pending.map((m) => m.id) } },
        data: { status: 'SENDING', claimedAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      messages: pending.map((m) => {
        let attachments = [];
        try {
          attachments = m.broadcast ? JSON.parse(m.broadcast.attachmentsJson || '[]') : [];
        } catch (e) {
          attachments = [];
        }
        return {
          id: m.id,
          phone: m.phone,
          recipientName: m.recipientName,
          body: m.body,
          source: m.source,
          bookingRef: m.bookingRef,
          attachments,
        };
      }),
    });
  } catch (error) {
    console.error('Error fetching WhatsApp queue:', error);
    return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
}
