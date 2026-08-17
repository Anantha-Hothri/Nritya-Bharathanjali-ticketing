import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import ExcelJS from 'exceljs';
import { getAdminSession } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const adminSession = await getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin access.' },
        { status: 401 }
      );
    }
    const bookings = await prisma.booking.findMany({
      orderBy: { bookingDate: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'M.S. Natyakshetra Admin';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Skanda 2026 Bookings');

    // Header styling
    sheet.columns = [
      { header: 'Booking ID', key: 'bookingId', width: 16 },
      { header: 'Buyer Category', key: 'buyerType', width: 22 },
      { header: 'Booking Date & Time', key: 'bookingDate', width: 22 },
      { header: 'Customer Name', key: 'customerName', width: 20 },
      { header: 'MSN Student Name', key: 'studentName', width: 22 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'WhatsApp', key: 'whatsapp', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Tickets', key: 'ticketQty', width: 10 },
      { header: 'Amount (₹)', key: 'totalAmount', width: 15 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'Payment ID', key: 'paymentId', width: 22 },
    ];

    // Style Header Row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6E1423' }, // Deep Maroon
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add Booking Data
    bookings.forEach((b) => {
      sheet.addRow({
        bookingId: b.bookingId,
        buyerType: b.buyerType === 'MSN' ? 'MSN Student / Parent' : 'External Attendee',
        bookingDate: new Date(b.bookingDate).toLocaleString('en-IN'),
        customerName: b.customerName,
        studentName: b.studentName || 'N/A',
        phone: b.phone,
        whatsapp: b.whatsapp,
        email: b.email,
        ticketQty: b.ticketQty,
        totalAmount: b.totalAmount,
        paymentStatus: b.paymentStatus,
        paymentId: b.paymentId || 'N/A',
      });
    });

    // Generate Excel Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Nritya_Bharathanjali_Bookings_${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error generating Excel export:', error);
    return NextResponse.json(
      { success: false, error: 'Server error generating Excel export.' },
      { status: 500 }
    );
  }
}
