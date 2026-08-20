// Services — WhatsApp Client Initializer using whatsapp-web.js & qrcode
import QRCode from 'qrcode';

if (!global.whatsappStatus) {
  global.whatsappStatus = {
    connected: false,
    qrDataUrl: null,
    client: null,
    initializing: false,
  };
}

export async function getWhatsAppClient() {
  if (global.whatsappStatus.client) {
    return global.whatsappStatus.client;
  }

  if (global.whatsappStatus.initializing) {
    return null;
  }

  try {
    global.whatsappStatus.initializing = true;
    
    // Node.js eval require to bypass bundler static resolution
    const dynamicRequire = eval('require');
    const { Client, LocalAuth } = dynamicRequire('whatsapp-web.js');

    const client = new Client({
      authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
    });

    client.on('qr', async (qr) => {
      console.log('📲 WhatsApp QR RECEIVED — Scan with WhatsApp app in Admin Panel');
      try {
        const qrDataUrl = await QRCode.toDataURL(qr);
        global.whatsappStatus.qrDataUrl = qrDataUrl;
        global.whatsappStatus.connected = false;
      } catch (err) {
        console.error('Error generating QR code data URL:', err);
      }
    });

    client.on('ready', () => {
      console.log('✅ WhatsApp client is ready and connected!');
      global.whatsappStatus.connected = true;
      global.whatsappStatus.qrDataUrl = null;
    });

    client.on('authenticated', () => {
      console.log('🔒 WhatsApp client authenticated successfully!');
    });

    client.on('auth_failure', (msg) => {
      console.error('⚠️ WhatsApp authentication failure:', msg);
      global.whatsappStatus.connected = false;
    });

    client.on('disconnected', (reason) => {
      console.warn('⚠️ WhatsApp client disconnected:', reason);
      global.whatsappStatus.connected = false;
      global.whatsappStatus.client = null;
      global.whatsappStatus.initializing = false;
      setTimeout(() => {
        getWhatsAppClient().catch(() => {});
      }, 5000);
    });

    client.initialize().catch((e) => {
      console.error('Error initializing WhatsApp client:', e.message);
      global.whatsappStatus.initializing = false;
    });

    global.whatsappStatus.client = client;
    return client;
  } catch (err) {
    console.warn('WhatsApp Web client module resolution fallback:', err.message);
    global.whatsappStatus.initializing = false;
    return null;
  }
}

export function getWhatsAppStatus() {
  return {
    connected: global.whatsappStatus.connected || false,
    qrDataUrl: global.whatsappStatus.qrDataUrl || null,
  };
}

// Auto-initialize client on module import (warm up puppeteer early)
getWhatsAppClient().catch(() => {});
