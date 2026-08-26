// ============================================================================
// Skanda WhatsApp Bridge
// ----------------------------------------------------------------------------
// Runs on YOUR computer (not Vercel). Connects your WhatsApp account via QR
// scan (whatsapp-web.js), then continuously polls the live site's message
// queue and delivers ticket confirmations, seat allocations & broadcasts.
//
// Usage:  npm run bridge   (from the project root)
//    or:  cd bridge && npm install && npm start
//
// First run: a QR code appears in the terminal — scan it from WhatsApp on
// your phone (Settings → Linked Devices → Link a Device). The session is
// saved in bridge/.wwebjs_auth so you only scan once.
// ============================================================================

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const qrcodeTerminal = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const path = require('path');

const APP_URL = (process.env.APP_URL || 'https://nritya-bharathanjali-ticketing.vercel.app').replace(/\/+$/, '');
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

const POLL_INTERVAL_MS = 5000;   // How often to check the queue
const SEND_DELAY_MS = 3000;      // Pause between sends (avoid WhatsApp rate limits)
const BATCH_SIZE = 5;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error('❌ Missing credentials. Create bridge/.env with:');
  console.error('   APP_URL=https://nritya-bharathanjali-ticketing.vercel.app');
  console.error('   ADMIN_USERNAME=<your admin portal username>');
  console.error('   ADMIN_PASSWORD=<your admin portal password>');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Auth against the live site (same login as the admin portal)
// ---------------------------------------------------------------------------
let authToken = null;

async function login() {
  const res = await fetch(`${APP_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Admin login failed (${res.status}): ${data.error || 'check ADMIN_USERNAME / ADMIN_PASSWORD in bridge/.env'}`);
  }

  const setCookie = res.headers.get('set-cookie') || '';
  const match = setCookie.match(/skanda_admin_token=([^;]+)/);
  if (!match) {
    throw new Error('Admin login succeeded but no session token was returned.');
  }
  authToken = match[1];
  console.log('🔑 Logged in to the ticketing site as admin.');
}

async function api(pathname, options = {}, isRetry = false) {
  if (!authToken) await login();

  const res = await fetch(`${APP_URL}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401 && !isRetry) {
    // Session expired (24h) — re-login once and retry
    authToken = null;
    await login();
    return api(pathname, options, true);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`API ${pathname} failed (${res.status}): ${data.error || res.statusText}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// WhatsApp client
// ---------------------------------------------------------------------------
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '.wwebjs_auth') }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

async function reportBridgeState(state) {
  try {
    await api('/api/whatsapp/bridge-state', {
      method: 'POST',
      body: JSON.stringify(state),
    });
  } catch (e) {
    console.error(`⚠️ Could not report bridge state to the site: ${e.message}`);
  }
}

client.on('qr', (qr) => {
  console.log('\n📱 Scan this QR code with WhatsApp on your phone:');
  console.log('   (WhatsApp → Settings → Linked Devices → Link a Device)');
  console.log('   It is also shown live on the admin Broadcast page.\n');
  qrcodeTerminal.generate(qr, { small: true });
  reportBridgeState({ connected: false, qr });
});

client.on('authenticated', () => {
  console.log('🔐 WhatsApp session authenticated (saved — no QR needed next time).');
});

client.on('auth_failure', (msg) => {
  console.error('❌ WhatsApp authentication failed:', msg);
  console.error('   Delete the bridge/.wwebjs_auth folder and re-run to scan a fresh QR.');
  process.exit(1);
});

client.on('disconnected', async (reason) => {
  console.error(`⚠️ WhatsApp disconnected: ${reason}. Restart the bridge to reconnect.`);
  await reportBridgeState({ connected: false });
  process.exit(1);
});

client.on('ready', () => {
  const me = client.info && client.info.wid ? client.info.wid.user : 'unknown';
  reportBridgeState({ connected: true, number: me });
  console.log(`\n✅ WhatsApp CONNECTED as +${me}`);
  console.log(`📡 Watching the queue at ${APP_URL} — ticket confirmations, seat`);
  console.log('   allocations and broadcasts will now send automatically.');
  console.log('   Keep this window open. Press Ctrl+C to stop.\n');
  startPolling();
});

// ---------------------------------------------------------------------------
// Queue polling & delivery
// ---------------------------------------------------------------------------
let pollBusy = false;

function startPolling() {
  setInterval(async () => {
    if (pollBusy) return;
    pollBusy = true;
    try {
      await pollOnce();
    } catch (e) {
      console.error(`⚠️ Poll error: ${e.message} (retrying in ${POLL_INTERVAL_MS / 1000}s)`);
    } finally {
      pollBusy = false;
    }
  }, POLL_INTERVAL_MS);
}

async function pollOnce() {
  const myNumber = client.info && client.info.wid ? client.info.wid.user : '';
  const data = await api(`/api/whatsapp/queue?limit=${BATCH_SIZE}&connected=true&number=${myNumber}`);
  const messages = data.messages || [];

  for (const msg of messages) {
    try {
      await deliverMessage(msg);
      await api('/api/whatsapp/queue/ack', {
        method: 'POST',
        body: JSON.stringify({ id: msg.id, ok: true }),
      });
      console.log(`✅ [${msg.source}] Sent to ${msg.recipientName || msg.phone} (${msg.bookingRef || '-'})`);
    } catch (e) {
      await api('/api/whatsapp/queue/ack', {
        method: 'POST',
        body: JSON.stringify({ id: msg.id, ok: false, error: e.message }),
      }).catch(() => {});
      console.error(`❌ [${msg.source}] Failed for ${msg.recipientName || msg.phone}: ${e.message}`);
    }
    await sleep(SEND_DELAY_MS);
  }
}

async function deliverMessage(msg) {
  // Validate the number is actually registered on WhatsApp
  const numberId = await client.getNumberId(msg.phone);
  if (!numberId) {
    throw new Error(`+${msg.phone} is not registered on WhatsApp`);
  }
  const chatId = numberId._serialized;

  const attachments = Array.isArray(msg.attachments) ? msg.attachments : [];

  if (attachments.length === 0) {
    await client.sendMessage(chatId, msg.body);
    return;
  }

  // First attachment carries the message text as its caption; rest follow
  for (let i = 0; i < attachments.length; i++) {
    const att = attachments[i];
    const base64 = String(att.data || '').split(',').pop();
    if (!base64) continue;
    const media = new MessageMedia(att.type || 'application/octet-stream', base64, att.name || `attachment-${i + 1}`);
    await client.sendMessage(chatId, media, i === 0 ? { caption: msg.body } : {});
    if (i < attachments.length - 1) await sleep(1000);
  }
}

// ---------------------------------------------------------------------------
console.log('🚀 Starting Skanda WhatsApp Bridge...');
console.log(`   Site: ${APP_URL}`);
console.log('   Launching WhatsApp Web (this can take ~30s on first run)...\n');

login()
  .then(() => client.initialize())
  .catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
