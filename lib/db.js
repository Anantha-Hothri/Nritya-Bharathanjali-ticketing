import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Handle Vercel / Serverless execution environment for SQLite
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

if (dbUrl.startsWith('file:')) {
  // Extract path from file:./path or file:path
  const relativePath = dbUrl.replace(/^file:/, '');
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const tmpDbPath = '/tmp/dev.db';
    process.env.DATABASE_URL = `file:${tmpDbPath}`;

    if (!fs.existsSync(tmpDbPath)) {
      // Look for candidate seed database files in project directory
      const candidates = [
        path.join(process.cwd(), relativePath),
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
      ];

      for (const src of candidates) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            break;
          } catch (err) {
            console.error('Failed to copy SQLite database to /tmp:', err);
          }
        }
      }
    }
  }
}

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

