// WhatsApp Message Queue — messages are queued in Postgres and delivered by the
// local whatsapp-web.js bridge (see bridge/), since Vercel serverless cannot hold
// a persistent WhatsApp Web session.
import { prisma } from './db';

// Normalize an Indian phone number to digits with country code, e.g. "919876543210"
export function toWhatsAppPhone(raw) {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, '');
  digits = digits.replace(/^0+/, '');
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 11 || digits.length > 15) return null;
  return digits;
}

// Standard WhatsApp message template — every outgoing message (broadcast,
// ticket confirmation, seat allocation) is wrapped in this exact format.
export function formatWhatsAppMessage({ recipientName, message, booking }) {
  const name = (recipientName || booking?.customerName || 'Valued Guest')
    .replace(/\s*\([^)]*\)/g, '')
    .trim();
  const seats =
    booking && booking.allocationStatus === 'ALLOCATED' && booking.allocatedSeats
      ? booking.allocatedSeats
      : 'Will soon be allocated';

  return [
    'M.S. Naatyakshetra',
    '📅 Event: Nritya Bharatanjali 2026',
    '',
    `Hi ${name},`,
    '',
    message,
    '',
    '━━━━━━━━━━━━━━━━━━━',
    '📋 Your Booking Details',
    `🔖 Booking ID : ${booking?.bookingId || '—'}`,
    `🎟️ Tickets    : ${booking?.ticketQty ?? '—'}`,
    `💺 Seats      : ${seats}`,
    '━━━━━━━━━━━━━━━━━━━',
    '',
    'For queries contact: +91 96636 80808',
    'Thank you! 🙏',
  ].join('\n');
}

export async function queueWhatsAppMessage({ phone, recipientName, body, source, bookingRef, broadcastId }) {
  const normalized = toWhatsAppPhone(phone);
  if (!normalized) {
    return { success: false, reason: 'Invalid or missing WhatsApp phone number' };
  }

  const msg = await prisma.whatsAppMessage.create({
    data: {
      phone: normalized,
      recipientName: recipientName || null,
      body,
      source: source || 'BROADCAST',
      bookingRef: bookingRef || null,
      broadcastId: broadcastId || null,
    },
  });

  return { success: true, id: msg.id, phone: normalized };
}
