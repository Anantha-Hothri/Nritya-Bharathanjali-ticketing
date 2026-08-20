import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../lib/adminAuth';
import { getWhatsAppStatus, getWhatsAppClient } from '../../../../lib/whatsappClient';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const adminSession = await getAdminSession(request);
  if (!adminSession) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
  }

  // Trigger client status check / background initialization
  getWhatsAppClient().catch(() => {});

  const status = getWhatsAppStatus();

  return NextResponse.json({
    success: true,
    connected: status.connected,
    qrDataUrl: status.qrDataUrl,
  });
}
