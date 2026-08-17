const ADMIN_COOKIE_NAME = 'skanda_admin_token';
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.SESSION_SECRET || 'skanda_admin_secret_key_2026_prod';

function toBase64Url(str) {
  if (typeof btoa === 'function') {
    return btoa(str)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
  return Buffer.from(str).toString('base64url');
}

function fromBase64Url(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  if (typeof atob === 'function') {
    return atob(base64);
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

async function computeHmacSha256(secret, message) {
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );
  const hashArray = Array.from(new Uint8Array(signature));
  const hashString = String.fromCharCode(...hashArray);
  return toBase64Url(hashString);
}

/**
 * Creates a signed JWT-style session token (Web Crypto).
 */
export async function createAdminToken(user) {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = toBase64Url(
    JSON.stringify({
      username: user.username,
      role: user.role || 'ADMIN',
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    })
  );

  const signature = await computeHmacSha256(JWT_SECRET, `${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

/**
 * Verifies and decodes a signed admin token (Web Crypto).
 */
export async function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expectedSignature = await computeHmacSha256(JWT_SECRET, `${header}.${payload}`);

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const decoded = JSON.parse(fromBase64Url(payload));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired token
    }
    if (decoded.role !== 'ADMIN') {
      return null; // Must be admin
    }
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Helper to get and verify admin session from request or cookies context.
 */
export async function getAdminSession(request) {
  let token = null;

  if (request && request.cookies && typeof request.cookies.get === 'function') {
    const cookieObj = request.cookies.get(ADMIN_COOKIE_NAME);
    token = cookieObj ? cookieObj.value : null;
  } else {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = cookies();
      const cookieObj = cookieStore.get(ADMIN_COOKIE_NAME);
      token = cookieObj ? cookieObj.value : null;
    } catch (e) {
      token = null;
    }
  }

  if (!token) return null;
  return verifyAdminToken(token);
}

export { ADMIN_COOKIE_NAME };
