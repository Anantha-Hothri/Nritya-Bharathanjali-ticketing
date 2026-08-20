/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['whatsapp-web.js', 'puppeteer-core', 'puppeteer', 'qrcode'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('whatsapp-web.js', 'puppeteer-core', 'puppeteer');
    }
    return config;
  },
};

module.exports = nextConfig;
