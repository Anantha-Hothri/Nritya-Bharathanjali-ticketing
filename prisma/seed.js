if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data for Nritya Bharathanjali 2026...');

  // 1. Seed Admin User
  const adminUsername = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'msn_skanda_admin_2026';

  await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: { passwordHash: adminPassword },
    create: {
      username: adminUsername,
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Admin user '${adminUsername}' created/updated.`);

  // 2. Seed Initial MSN Batches (Admin pre-configured)
  const defaultBatches = [
    {
      batchName: 'Bharatanatyam Grade 4',
      batchCode: 'SKANDA-G4',
      assignedRows: JSON.stringify(['Row A', 'Row B', 'Row C']),
      capacity: 60,
      ticketPrice: 500.0,
    },
    {
      batchName: 'Bharatanatyam Senior Batch',
      batchCode: 'SKANDA-SENIOR',
      assignedRows: JSON.stringify(['Row G', 'Row H']),
      capacity: 50,
      ticketPrice: 500.0,
    },
    {
      batchName: 'Junior Natya Stars',
      batchCode: 'SKANDA-JUNIOR',
      assignedRows: JSON.stringify(['Row J', 'Row K']),
      capacity: 40,
      ticketPrice: 500.0,
    },
  ];

  for (const b of defaultBatches) {
    await prisma.batchAllocation.upsert({
      where: { batchCode: b.batchCode },
      update: b,
      create: b,
    });
    console.log(`MSN Batch '${b.batchName}' (${b.batchCode}) seeded.`);
  }

  // 3. Seed Initial External Ticket Allocations
  const defaultExternalRows = [
    { rowName: 'Row D', capacity: 30, ticketPrice: 500.0 },
    { rowName: 'Row E', capacity: 30, ticketPrice: 500.0 },
    { rowName: 'Row F', capacity: 40, ticketPrice: 500.0 },
  ];

  for (const ext of defaultExternalRows) {
    await prisma.externalAllocation.upsert({
      where: { rowName: ext.rowName },
      update: ext,
      create: ext,
    });
    console.log(`External Allocation for '${ext.rowName}' seeded (${ext.capacity} tickets).`);
  }

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
