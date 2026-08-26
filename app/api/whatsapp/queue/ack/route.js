import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { getAdminSession, verifyAdminToken } from '../../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

const MAX_ATTEMPTS = 3;

async function getBridgeSession(request) {
  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) {
    const session = await verifyAdminToken(auth.slice(7));
    if (session) return session;
  }
  return getAdminSession(request);
}

export async function POST(request) {
  const session = await getBridgeSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, ok, error } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing message id.' }, { status: 400 });
    }

    const msg = await prisma.whatsAppMessage.findUnique({ where: { id } });
    if (!msg) {
      return NextResponse.json({ success: false, error: 'Message not found.' }, { status: 404 });
    }

    const attempts = msg.attempts + 1;

    if (ok) {
      await prisma.whatsAppMessage.update({
        where: { id },
        data: { status: 'SENT', attempts, sentAt: new Date(), error: null },
      });
    } else {
      await prisma.whatsAppMessage.update({
        where: { id },
        data: {
          status: attempts >= MAX_ATTEMPTS ? 'FAILED' : 'PENDING',
          attempts,
          error: error ? String(error).slice(0, 500) : 'Unknown send error',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error acknowledging WhatsApp message:', err);
    return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
}
