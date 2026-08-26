import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getAdminSession } from '../../../../lib/adminAuth';
import { sendBroadcastNotification } from '../../../../lib/notificationService';
import { queueWhatsAppMessage, formatWhatsAppMessage } from '../../../../lib/whatsappQueue';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const adminSession = await getAdminSession(request);
  if (!adminSession) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      channel = 'EMAIL', // 'EMAIL' | 'WHATSAPP'
      studentType = 'BOTH', // 'MSN' | 'EXTERNAL' | 'BOTH'
      paymentStatus = 'BOTH', // 'PAID' | 'UNPAID' | 'BOTH'
      seatAllocation = 'BOTH', // 'ALLOCATED' | 'NOT_ALLOCATED' | 'BOTH'
      message = '',
      attachments = [],
    } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Broadcast message body cannot be empty.' }, { status: 400 });
    }

    // Build filter conditions
    const whereConditions = [];

    // Filter 1: Student Type
    if (studentType === 'MSN') {
      whereConditions.push({ buyerType: 'MSN' });
    } else if (studentType === 'EXTERNAL') {
      whereConditions.push({ buyerType: { not: 'MSN' } });
    }

    // Filter 2: Payment Status
    if (paymentStatus === 'PAID') {
      whereConditions.push({ paymentStatus: 'PAID' });
    } else if (paymentStatus === 'UNPAID') {
      whereConditions.push({ paymentStatus: { not: 'PAID' } });
    }

    // Filter 3: Seat Allocation
    if (seatAllocation === 'ALLOCATED') {
      whereConditions.push({ allocationStatus: 'ALLOCATED' });
      whereConditions.push({ allocatedSeats: { not: '' } });
    } else if (seatAllocation === 'NOT_ALLOCATED') {
      whereConditions.push({
        OR: [
          { allocationStatus: { not: 'ALLOCATED' } },
          { allocatedSeats: '' },
        ],
      });
    }

    const whereClause = whereConditions.length > 0 ? { AND: whereConditions } : {};

    // Fetch matched bookings live from DB
    const matchedBookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { bookingDate: 'desc' },
    });

    const totalMatched = matchedBookings.length;
    let sentCount = 0;
    let failedCount = 0;
    const details = [];

    // WhatsApp channel: queue messages for the local whatsapp-web.js bridge to deliver
    if (channel === 'WHATSAPP') {
      const broadcastRow = await prisma.whatsAppBroadcast.create({
        data: { attachmentsJson: JSON.stringify(attachments || []) },
      });

      for (const booking of matchedBookings) {
        const cleanName = booking.customerName
          ? booking.customerName.replace(/\s*\([^)]*\)/g, '').trim()
          : 'Valued Guest';

        const res = await queueWhatsAppMessage({
          phone: booking.whatsapp || booking.phone,
          recipientName: cleanName,
          body: formatWhatsAppMessage({ recipientName: cleanName, message, booking }),
          source: 'BROADCAST',
          bookingRef: booking.bookingId,
          broadcastId: broadcastRow.id,
        });

        if (res.success) {
          sentCount++;
          details.push({ bookingId: booking.bookingId, customerName: booking.customerName, status: 'QUEUED' });
        } else {
          failedCount++;
          details.push({
            bookingId: booking.bookingId,
            customerName: booking.customerName,
            status: 'FAILED',
            reason: res.reason || 'Invalid WhatsApp number',
          });
        }
      }

      return NextResponse.json({
        success: true,
        channel,
        totalMatched,
        sentCount,
        failedCount,
        queued: true,
        details,
      });
    }

    // Send notifications to each recipient
    for (const booking of matchedBookings) {
      const res = await sendBroadcastNotification({
        channel,
        booking,
        message,
        attachments,
      });

      if (res.success) {
        sentCount++;
        details.push({
          bookingId: booking.bookingId,
          customerName: booking.customerName,
          status: 'SENT',
        });
      } else {
        failedCount++;
        details.push({
          bookingId: booking.bookingId,
          customerName: booking.customerName,
          status: 'FAILED',
          reason: res.reason || 'Missing contact information',
        });
      }
    }

    return NextResponse.json({
      success: true,
      channel,
      totalMatched,
      sentCount,
      failedCount,
      details,
    });
  } catch (error) {
    console.error('Error processing broadcast message send:', error);
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error?.message || String(error)}` },
      { status: 500 }
    );
  }
}
