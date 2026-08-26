# Skanda WhatsApp Bridge — deploy this folder to any always-on container host
# (Railway, Render, Fly.io, a VPS) so nothing needs to run on your laptop.
# Required environment variables: APP_URL, ADMIN_USERNAME, ADMIN_PASSWORD
FROM node:20-slim

# System Chromium (whatsapp-web.js drives it via puppeteer)
RUN apt-get update \
  && apt-get install -y --no-install-recommends chromium ca-certificates fonts-freefont-ttf \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY index.js ./

CMD ["node", "index.js"]
