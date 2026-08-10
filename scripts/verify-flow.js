const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const QRCode = require('qrcode');
const ExcelJS = require('exceljs');

async function testFullFlow() {
  console.log('--- STARTING EMPIRICAL VERIFICATION AUDIT ---');

  // 1. Verify MSN Batch SKANDA-G4
  const batch = await prisma.batchAllocation.findUnique({
    where: { batchCode: 'SKANDA-G4' },
  });
  console.log('✓ Found Batch SKANDA-G4:', batch.batchName, 'Assigned Rows:', batch.assignedRows);
  if (batch.capacity < 3) throw new Error('Batch capacity invalid');

  // 2. Create Test MSN Booking
  const bookingIdMSN = `SKD-TEST-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  const msnBooking = await prisma.booking.create({
    data: {
      bookingId: bookingIdMSN,
      buyerType: 'MSN',
      customerName: 'Test Parent Ramesh',
      phone: '9876543210',
      isWhatsappSame: true,
      whatsapp: '9876543210',
      email: 'ramesh.test@example.com',
      studentName: 'Ananya Ramesh',
      batchName: batch.batchName,
      batchCode: batch.batchCode,
      allocatedRow: 'Row A, Row B',
      ticketQty: 3,
      totalAmount: 1500.0,
      paymentStatus: 'PAID',
      paymentId: 'pay_test_msn_123',
    },
  });
  console.log('✓ Created Test MSN Booking:', msnBooking.bookingId);

  // 3. Increment Batch Inventory
  await prisma.batchAllocation.update({
    where: { batchCode: 'SKANDA-G4' },
    data: { bookedCount: { increment: 3 } },
  });

  // Generate E-Ticket & QR
  const qrPayload = JSON.stringify({ event: 'Skanda 2026', code: bookingIdMSN });
  const qrData = await QRCode.toDataURL(qrPayload);
  await prisma.ticket.create({
    data: {
      ticketCode: `${bookingIdMSN}-T1`,
      bookingId: msnBooking.id,
      qrCodeData: qrData,
    },
  });
  console.log('✓ Issued E-Ticket with QR Code for MSN booking');

  // 4. Create Test External Booking
  const bookingIdExt = `SKD-TEST-EXT-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  const extBooking = await prisma.booking.create({
    data: {
      bookingId: bookingIdExt,
      buyerType: 'EXTERNAL',
      customerName: 'Test External Guest',
      phone: '9123456789',
      isWhatsappSame: true,
      whatsapp: '9123456789',
      email: 'guest.test@example.com',
      allocatedRow: 'Row D',
      ticketQty: 2,
      totalAmount: 1000.0,
      paymentStatus: 'PAID',
      paymentId: 'pay_test_ext_456',
    },
  });
  console.log('✓ Created Test External Booking:', extBooking.bookingId);

  // 5. Test Excel Generation
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Test Sheet');
  sheet.addRow(['Booking ID', 'Customer', 'Amount']);
  sheet.addRow([msnBooking.bookingId, msnBooking.customerName, msnBooking.totalAmount]);
  sheet.addRow([extBooking.bookingId, extBooking.customerName, extBooking.totalAmount]);
  const buf = await workbook.xlsx.writeBuffer();
  console.log('✓ Generated Excel Workbook Buffer:', buf.length, 'bytes');

  console.log('--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

testFullFlow()
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
