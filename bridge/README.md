# Skanda WhatsApp Bridge

Sends the WhatsApp messages queued by the live ticketing site (ticket
confirmations, seat allocations, and admin broadcasts) from **your own
WhatsApp account**, using [whatsapp-web.js](https://docs.wwebjs.dev/).

The live site runs on Vercel (serverless), which cannot keep a WhatsApp
session alive — so the site *queues* messages in the database, and this
bridge (running on your laptop) delivers them.

## Recommended: host it in the cloud (nothing to run on your laptop)

Deploy this folder as a Docker service on an always-on host — then the QR
code appears on the admin Broadcast page automatically whenever WhatsApp is
not connected, and messages send 24/7.

**Railway (easiest):**

1. Go to [railway.app](https://railway.app) → New Project → **Deploy from
   GitHub repo** → pick this repository.
2. In the service settings, set **Root Directory** to `bridge` (Railway
   detects the Dockerfile automatically).
3. Add these environment variables:
   - `APP_URL` = `https://nritya-bharathanjali-ticketing.vercel.app`
   - `ADMIN_USERNAME` = your admin portal username
   - `ADMIN_PASSWORD` = your admin portal password
4. Deploy. Open the admin **Broadcast page** — the QR code appears in the
   WhatsApp Bridge panel. Scan it once and you're live.

The same Dockerfile works on Render, Fly.io, or any VPS. Note: if the host
restarts the container without a persistent volume, the session is lost and
a new QR simply appears on the Broadcast page — just scan again.

**Switching numbers:** click **"Disconnect & Link New Number"** on the
Broadcast page. The current number is logged out and a fresh QR appears in
the panel within ~15 seconds.

## Alternative: run locally (one-time setup)

1. Copy `.env.example` to `.env` in this folder and fill in your **admin
   portal username & password** (the same ones you use at `/admin/login`).

2. From the **project root**, run:

   ```bash
   npm run bridge
   ```

3. A QR code appears in the terminal. On your phone open
   **WhatsApp → Settings → Linked Devices → Link a Device** and scan it.

That's it. The session is saved in `bridge/.wwebjs_auth/`, so next time you
run `npm run bridge` it connects instantly without a QR scan.

## Daily use

Keep the bridge running (terminal window open) whenever you are verifying
payments, allocating seats, or sending broadcasts. Every queued message is
delivered automatically with a short delay between sends. The broadcast page
in the admin portal shows a live **WhatsApp Bridge: CONNECTED / OFFLINE**
indicator plus queued / sent / failed counters.

If the bridge is offline, messages simply wait in the queue and are sent as
soon as you start it again — nothing is lost.

## Troubleshooting

- **QR appears again** — the session expired or was logged out from your
  phone. Just scan again.
- **"auth failure"** — delete the `bridge/.wwebjs_auth/` folder and re-run.
- **"Admin login failed"** — check `ADMIN_USERNAME` / `ADMIN_PASSWORD` in
  `bridge/.env`.
- Note: whatsapp-web.js is an unofficial library. Send responsibly (the
  bridge already paces messages ~3s apart) to keep the account in good
  standing.
