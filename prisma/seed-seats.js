const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AUDITORIUM_CONFIG = [
  { row: 'A', cSide: [1, 11], mSide: [12, 20], rSide: [21, 31], total: 31 },
  { row: 'B', cSide: [1, 11], mSide: [12, 20], rSide: [21, 32], total: 32 },
  { row: 'C', cSide: [1, 12], mSide: [13, 21], rSide: [22, 33], total: 33 },
  { row: 'D', cSide: [1, 12], mSide: [13, 22], rSide: [23, 35], total: 35 },
  { row: 'E', cSide: [1, 13], mSide: [14, 23], rSide: [24, 36], total: 36 },
  { row: 'F', cSide: [1, 13], mSide: [14, 24], rSide: [25, 38], total: 38 },
  { row: 'G', cSide: [1, 14], mSide: [15, 25], rSide: [26, 39], total: 39 },
  { row: 'H', cSide: [1, 14], mSide: [15, 26], rSide: [27, 41], total: 41 },
  { row: 'I', cSide: [1, 15], mSide: [16, 27], rSide: [28, 42], total: 42 },
  { row: 'J', cSide: [1, 15], mSide: [16, 28], rSide: [29, 44], total: 44 },
  { row: 'K', cSide: [1, 16], mSide: [17, 29], rSide: [30, 44], total: 44 },
  { row: 'L', cSide: [1, 17], mSide: [18, 30], rSide: [31, 46], total: 46 },
  { row: 'M', cSide: [1, 15], mSide: [16, 28], rSide: [29, 41], total: 41 },
  { row: 'N', cSide: [1, 12], mSide: [13, 22], rSide: [23, 33], total: 33 },
  { row: 'O', cSide: [1, 12], mSide: [13, 25], rSide: [26, 37], total: 37 },
  { row: 'P', cSide: [1, 10], mSide: [11, 20], rSide: [21, 29], total: 29 },
  { row: 'Q', cSide: [1, 6], mSide: [7, 19], rSide: [20, 24], total: 24 },
  { row: 'R', cSide: [1, 3], mSide: [4, 18], rSide: [19, 21], total: 21 },
];

function getSectionForSeat(rowLetter, num) {
  const rowObj = AUDITORIUM_CONFIG.find((r) => r.row === rowLetter);
  if (!rowObj) return 'C-Side';

  if (num >= rowObj.cSide[0] && num <= rowObj.cSide[1]) return 'C-Side';
  if (num >= rowObj.mSide[0] && num <= rowObj.mSide[1]) return 'M-Side';
  if (num >= rowObj.rSide[0] && num <= rowObj.rSide[1]) return 'R-Side';
  return 'R-Side';
}

function getSeatZoneAndStatus(rowLetter, num) {
  // Seat P29 does not physically exist in the auditorium — permanently blocked
  if (rowLetter === 'P' && num === 29) {
    return { zone: 'General Seating', status: 'BLOCKED' };
  }
  if (rowLetter === 'A' || rowLetter === 'B') {
    return { zone: 'VIP Seats', status: 'LOCKED' };
  }
  return { zone: 'General Seating', status: 'AVAILABLE' };
}

async function main() {
  console.log('🌱 Seeding Auditorium Master Seats (646 seats) into database...');

  // Delete obsolete seats (e.g. Row S or seats beyond blueprint bounds)
  const validSeatIds = [];
  for (const rowObj of AUDITORIUM_CONFIG) {
    const row = rowObj.row;
    for (let num = 1; num <= rowObj.total; num++) {
      validSeatIds.push(`${row}${num}`);
    }
  }

  await prisma.seat.deleteMany({
    where: {
      seatId: { notIn: validSeatIds },
    },
  });

  let seatCount = 0;
  for (const rowObj of AUDITORIUM_CONFIG) {
    const row = rowObj.row;
    for (let num = 1; num <= rowObj.total; num++) {
      const seatId = `${row}${num}`;
      const section = getSectionForSeat(row, num);
      const { zone, status } = getSeatZoneAndStatus(row, num);

      await prisma.seat.upsert({
        where: { seatId },
        update: {
          section,
          row,
          number: num,
          zone,
          // P29 is permanently blocked regardless of any prior status; other seats keep their live status
          ...(seatId === 'P29' ? { status } : {}),
        },
        create: {
          seatId,
          section,
          row,
          number: num,
          zone,
          status,
        },
      });
      seatCount++;
    }
  }

  console.log(`✅ Seeded ${seatCount} auditorium seats successfully!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding seats:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
