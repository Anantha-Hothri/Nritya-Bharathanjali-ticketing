const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data for Nritya Bharathanjali 2026...');

  // 1. Seed Admin User
  const adminUsername = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'msn_skanda_admin_2026';

  const crypto = require('crypto');
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPass = `${salt}:${crypto.scryptSync(adminPassword, salt, 64).toString('hex')}`;

  await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: { passwordHash: hashedPass },
    create: {
      username: adminUsername,
      passwordHash: hashedPass,
      role: 'ADMIN',
    },
  });
  console.log(`Admin user '${adminUsername}' created/updated with hashed credentials.`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
