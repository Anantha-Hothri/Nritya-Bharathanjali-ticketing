// Services — Email Client Setup for Resend API & Nodemailer SMTP
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_SECURE === 'false' ? false : true,
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.RESEND_API_KEY || process.env.SMTP_PASS || '',
  },
});

export async function sendEmailMessage({ to, subject, html, attachments = [] }) {
  const apiKey = process.env.RESEND_API_KEY;
  const replyTo = process.env.REPLY_TO_EMAIL || 'msnatyalaya@gmail.com';
  const configuredFrom = process.env.FROM_EMAIL || process.env.EMAIL_FROM || 'M.S. Naatyakshetra <onboarding@resend.dev>';

  // 1. Try Resend REST API if API Key is present
  if (apiKey && apiKey.startsWith('re_')) {
    try {
      const resendAttachments = attachments.map((att) => {
        let base64Content = att.data || '';
        if (base64Content.includes(',')) {
          base64Content = base64Content.split(',')[1];
        }
        return {
          filename: att.name || att.filename || 'attachment',
          content: base64Content,
        };
      });

      const payload = {
        from: configuredFrom,
        to: [to],
        reply_to: replyTo,
        subject,
        html,
        attachments: resendAttachments.length > 0 ? resendAttachments : undefined,
      };

      let res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      let resData = await res.json();

      // If domain not verified error, fallback to onboarding@resend.dev for seamless testing
      if (!res.ok && resData.message && resData.message.includes('not verified')) {
        console.warn(`⚠️ Sender domain unverified in Resend. Falling back to onboarding@resend.dev for test email to ${to}...`);
        payload.from = 'M.S. Naatyakshetra <onboarding@resend.dev>';
        res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        });
        resData = await res.json();
      }

      if (res.ok && resData.id) {
        console.log(`📧 Resend API email sent to ${to} (ID: ${resData.id})`);
        return { success: true, messageId: resData.id };
      } else {
        console.warn(`Resend API response for ${to}:`, resData);
      }
    } catch (e) {
      console.warn(`Resend API HTTP error for ${to}:`, e.message);
    }
  }

  // 2. Fallback to Nodemailer SMTP
  try {
    const mailOptions = {
      from: configuredFrom,
      to,
      replyTo,
      subject,
      html,
      attachments: attachments.map((att) => {
        let base64Content = att.data || '';
        if (base64Content.includes(',')) {
          base64Content = base64Content.split(',')[1];
        }
        return {
          filename: att.name || att.filename || 'attachment',
          content: Buffer.from(base64Content, 'base64'),
          contentType: att.type || att.mimetype,
        };
      }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent via Nodemailer SMTP to ${to} (ID: ${info.messageId || 'OK'})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email delivery failed for ${to}:`, error.message);
    return { success: false, reason: error.message };
  }
}
