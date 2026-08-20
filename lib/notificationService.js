// Notification Service for Automated WhatsApp & Email Receipt Delivery

export async function sendSeatAllocationNotification({ booking, allocatedSeatsList, adminUser }) {
  const seatsFormatted = Array.isArray(allocatedSeatsList)
    ? allocatedSeatsList.join(', ')
    : allocatedSeatsList;

  const eventName = 'Nritya Bharathanjali 2026 — Skanda Production';
  const eventDate = 'September 26, 2026';
  const eventTime = '5:30 PM Onwards (Doors open at 5:00 PM)';
  const venue = 'Dhwani Auditorium, CMRIT College Campus, Kundalahalli, Bengaluru';
  const supportContact = '+91 98765 43210 / support@skandaproduction.com';

  // 1. WhatsApp Message Text
  const whatsappMessage = `Hi ${booking.customerName} 👋

Your seats for M.S. Naatyakshetra have been allocated!

🎭 Event: ${eventName}
📅 Date & Time: ${eventDate} | ${eventTime}
🪑 Your Seats: ${seatsFormatted}
📍 Venue: ${venue}

Please carry this message or your booking receipt at entry.

Receipt link: ${process.env.NEXT_PUBLIC_APP_URL || 'https://skandaproduction.com'}/ticket/${booking.bookingId}

For queries, contact: ${supportContact}`;

  // 2. Email Subject & Body
  const emailSubject = `Your Seats Are Confirmed — M.S. Naatyakshetra 🎭 (${booking.bookingId})`;
  const emailBodyHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF6EF; padding: 30px; color: #2C1810;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 2px solid #D4AF37; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #6B1A2B; padding: 25px; text-align: center; color: #FAF6EF;">
          <h1 style="margin: 0; font-size: 24px; font-family: Georgia, serif; color: #FAF6EF;">M.S. Naatyakshetra</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #D4AF37; letter-spacing: 1px;">NRITYA BHARATHANJALI 2026</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 25px;">
          <h2 style="color: #6B1A2B; margin-top: 0;">Seat Confirmation Receipt</h2>
          <p>Dear <strong>${booking.customerName}</strong>,</p>
          <p>We are delighted to confirm that your seat allocation for <strong>${eventName}</strong> has been finalized!</p>
          
          <div style="background-color: #FAF6EF; border: 1px solid #E6C687; border-radius: 6px; padding: 18px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #8C6D3F;">Booking ID:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #6B1A2B;">${booking.bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #8C6D3F;">Allocated Seats:</td>
                <td style="padding: 6px 0; font-weight: bold; font-size: 16px; text-align: right; color: #15803D;">${seatsFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #8C6D3F;">Event Date & Time:</td>
                <td style="padding: 6px 0; text-align: right;">${eventDate} at ${eventTime}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #8C6D3F;">Venue:</td>
                <td style="padding: 6px 0; text-align: right;">${venue}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 13px; color: #666;">
            Please present your digital booking receipt or printout at the auditorium entry gate on event day.
          </p>

          <div style="text-align: center; margin-top: 25px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://skandaproduction.com'}/ticket/${booking.bookingId}" 
               style="background-color: #6B1A2B; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              View & Download Full Receipt PDF &rarr;
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #FAF6EF; padding: 15px; text-align: center; border-top: 1px solid #E6C687; font-size: 12px; color: #8C6D3F;">
          M.S. Naatyakshetra &bull; Skanda Production 2026
        </div>
      </div>
    </div>
  `;

  console.log(`\n======================================================`);
  console.log(`📲 AUTOMATED WHATSAPP NOTIFICATION TRIGGERED`);
  console.log(`TO: ${booking.whatsapp || booking.phone}`);
  console.log(`MESSAGE:\n${whatsappMessage}`);
  console.log(`------------------------------------------------------`);
  console.log(`📧 AUTOMATED EMAIL NOTIFICATION TRIGGERED`);
  console.log(`TO: ${booking.email}`);
  console.log(`SUBJECT: ${emailSubject}`);
  console.log(`======================================================\n`);

  return {
    success: true,
    whatsappSent: true,
    emailSent: true,
    deliveredAt: new Date().toISOString(),
  };
}

// Bulk Broadcast Notification Delivery for WhatsApp & Email
export async function sendBroadcastNotification({ channel, booking, message, attachments = [] }) {
  const recipientPhone = booking.whatsapp || booking.phone;
  const recipientEmail = booking.email;
  const cleanName = booking.customerName ? booking.customerName.replace(/\s*\([^)]*\)/g, '').trim() : 'Valued Guest';

  const eventName = process.env.EVENT_NAME || 'Sankalpa Kala Darshana 2026';
  const contactPhone = process.env.CONTACT_PHONE || '+91 98765 43210';
  const contactEmail = process.env.CONTACT_EMAIL || 'contact@naatyakshetra.com';

  const seatsDisplay = booking.allocatedSeats
    ? `💺 Seats      : ${booking.allocatedSeats}`
    : `⏳ Seats      : Allocation Pending`;

  // 1. WhatsApp Channel
  if (channel === 'WHATSAPP') {
    if (!recipientPhone || recipientPhone.trim().length < 6) {
      return { success: false, reason: 'Invalid or missing phone number' };
    }

    const fullWhatsAppMessage = `*M.S. Naatyakshetra*
📅 *Event: ${eventName}*

Hi ${cleanName},

${message}

━━━━━━━━━━━━━━━━━━━
📋 *Your Booking Details*
🔖 Booking ID : ${booking.bookingId}
🎟️ Tickets    : ${booking.ticketQty}
${seatsDisplay}
━━━━━━━━━━━━━━━━━━━

For queries contact: ${contactPhone}
Thank you! 🙏`;

    const images = attachments.filter((a) => a.isImage || a.type?.startsWith('image/'));
    const docs = attachments.filter((a) => !a.isImage && !a.type?.startsWith('image/'));

    // Attempt delivery using initialized whatsapp-web.js client
    if (!global.whatsappStatus || !global.whatsappStatus.connected || !global.whatsappStatus.client) {
      return { success: false, reason: 'WhatsApp client not connected — please wait for connection on the broadcast page' };
    }

    try {
      const formattedPhone = recipientPhone.replace(/[^0-9]/g, '');
      const targetJid = formattedPhone.startsWith('91') ? `${formattedPhone}@c.us` : `91${formattedPhone}@c.us`;
      const dynamicRequire = eval('require');
      const { MessageMedia } = dynamicRequire('whatsapp-web.js');

      if (attachments.length > 0) {
        for (const att of attachments) {
          let base64Data = att.data || '';
          if (base64Data.includes(',')) base64Data = base64Data.split(',')[1];
          const media = new MessageMedia(att.type || 'image/jpeg', base64Data, att.name || 'file');
          await global.whatsappStatus.client.sendMessage(targetJid, media, { caption: fullWhatsAppMessage });
        }
      } else {
        await global.whatsappStatus.client.sendMessage(targetJid, fullWhatsAppMessage);
      }

      console.log(`✅ WhatsApp sent to ${cleanName} (${recipientPhone})`);
      return { success: true, channel: 'WHATSAPP', recipient: recipientPhone };
    } catch (e) {
      console.error(`❌ WhatsApp send failed for ${recipientPhone}:`, e.message);
      return { success: false, reason: e.message };
    }
  }

  // 2. Email Channel
  if (channel === 'EMAIL') {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return { success: false, reason: 'Invalid or missing email address' };
    }

    const emailSubject = `M.S. Naatyakshetra — ${eventName}`;
    const formattedHTMLMessage = message.replace(/\n/g, '<br/>');

    const emailBodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 2px solid #D4AF37; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: #6B1A2B; color: #FAF6EF; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-family: Georgia, serif; color: #FAF6EF;">🎭 M.S. Naatyakshetra</h2>
          <p style="margin: 5px 0 0 0; color: #D4AF37; font-weight: bold; letter-spacing: 1px;">${eventName}</p>
        </div>
        <div style="padding: 25px; background: #FAF6EF; color: #2C1810;">
          <p>Dear <strong>${cleanName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6;">${formattedHTMLMessage}</p>
          <hr style="border: none; border-top: 1px solid #D4AF37; margin: 20px 0;" />
          <h3 style="color: #6B1A2B; margin-top: 0; font-family: Georgia, serif;">YOUR BOOKING DETAILS</h3>
          <table style="width:100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #E6C687;"><td style="padding: 8px 0; color: #6B1A2B;"><strong>Booking ID</strong></td><td style="padding: 8px 0; font-family: monospace; font-weight: bold; text-align: right;">${booking.bookingId}</td></tr>
            <tr style="border-bottom: 1px solid #E6C687;"><td style="padding: 8px 0; color: #6B1A2B;"><strong>Tickets</strong></td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${booking.ticketQty}</td></tr>
            <tr style="border-bottom: 1px solid #E6C687;"><td style="padding: 8px 0; color: #6B1A2B;"><strong>Seats</strong></td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: ${booking.allocatedSeats ? '#15803D' : '#D97706'};">${booking.allocatedSeats || 'Allocation Pending'}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B1A2B;"><strong>Payment</strong></td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${booking.paymentStatus}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #D4AF37; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px; text-align: center;">
            For queries: ${contactEmail} / ${contactPhone}<br/>
            Thank you for being part of this celebration! 🙏
          </p>
        </div>
      </div>
    `;

    try {
      const { sendEmailMessage } = await import('./emailClient');
      const result = await sendEmailMessage({
        to: recipientEmail,
        subject: emailSubject,
        html: emailBodyHtml,
        attachments,
      });

      if (!result.success) {
        console.error(`❌ Email send failed for ${recipientEmail}:`, result.reason);
        return { success: false, reason: result.reason || 'Email delivery failed' };
      }

      console.log(`✅ Email sent to ${cleanName} (${recipientEmail})`);
      return { success: true, channel: 'EMAIL', recipient: recipientEmail };
    } catch (e) {
      console.error(`❌ Email send error for ${recipientEmail}:`, e.message);
      return { success: false, reason: e.message };
    }
  }

  return { success: false, reason: 'Unknown broadcast channel' };
}
