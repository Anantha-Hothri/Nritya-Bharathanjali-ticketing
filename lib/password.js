import crypto from 'crypto';

/**
 * Hashes a plaintext password using scrypt with a random salt.
 */
export function hashPassword(password) {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

/**
 * Verifies a plaintext password against a stored hash string.
 */
export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;

  if (storedHash.includes(':')) {
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  }

  // Fallback comparison
  const passwordBuffer = Buffer.from(password);
  const hashBuffer = Buffer.from(storedHash);
  if (passwordBuffer.length !== hashBuffer.length) return false;
  return crypto.timingSafeEqual(passwordBuffer, hashBuffer);
}
