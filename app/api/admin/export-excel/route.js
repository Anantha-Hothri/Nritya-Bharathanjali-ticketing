import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { getAdminSession } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

// Exports exactly the booking rows the admin dashboard currently has on
// screen (after search/category/payment/allocation filters) — the client
// sends its already-filtered list rather than the server re-querying
// everything, so the sheet always matches what was visible when exported.
export async function POST(request) {
  const adminSession = await getAdminSession(request);
  if (!adminSession) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
  }

  try {
    const { bookings = [], filters = {} } = await request.json();

    if (!Array.isArray(bookings)) {
      return NextResponse.json({ success: false, error: 'Invalid bookings payload.' }, { status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'M.S. Natyakshetra Admin';
    workbook.created = new Date();

    // ================= SHEET 1: BOOKINGS =================
    const sheet = workbook.addWorksheet('Skanda 2026 Bookings');

    sheet.columns = [
      { header: 'Booking ID', key: 'bookingId', width: 16 },
      { header: 'Buyer Category', key: 'buyerType', width: 22 },
      { header: 'Team / Code', key: 'teamCode', width: 16 },
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
      { header: 'UTR / Transaction ID', key: 'utrNumber', width: 20 },
      { header: 'Allocation Status', key: 'allocationStatus', width: 16 },
      { header: 'Allocated Seats', key: 'allocatedSeats', width: 22 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6E1423' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    bookings.forEach((b) => {
      sheet.addRow({
        bookingId: b.bookingId,
        buyerType: b.buyerType === 'MSN' ? 'MSN Student / Parent' : 'External Attendee',
        teamCode: b.teamCode || 'General',
        bookingDate: b.bookingDate ? new Date(b.bookingDate).toLocaleString('en-IN') : 'N/A',
        customerName: b.customerName,
        studentName: b.studentName || 'N/A',
        phone: b.phone,
        whatsapp: b.whatsapp,
        email: b.email,
        ticketQty: b.ticketQty,
        totalAmount: b.totalAmount,
        paymentStatus: b.paymentStatus,
        paymentId: b.paymentId || 'N/A',
        utrNumber: b.utrNumber || 'N/A',
        allocationStatus: b.allocationStatus === 'ALLOCATED' && b.allocatedSeats ? 'Allocated' : 'Pending Allocation',
        allocatedSeats: b.allocatedSeats || 'N/A',
      });
    });

    sheet.autoFilter = { from: 'A1', to: `P${bookings.length + 1}` };

    // ================= SHEET 2: EXPORT SUMMARY =================
    const summarySheet = workbook.addWorksheet('Export Summary');
    summarySheet.columns = [{ key: 'label', width: 28 }, { key: 'value', width: 40 }];

    const paidBookings = bookings.filter((b) => b.paymentStatus === 'PAID');
    const allocatedCount = bookings.filter((b) => b.allocationStatus === 'ALLOCATED' && b.allocatedSeats).length;
    const totalTickets = paidBookings.reduce((sum, b) => sum + (b.ticketQty || 0), 0);
    const totalCollections = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const summaryRows = [
      ['Report', 'Nritya Bharathanjali 2026 — Live Bookings Ledger Export'],
      ['Exported At', new Date().toLocaleString('en-IN')],
      ['Exported By', adminSession.username || 'admin'],
      ['', ''],
      ['Filters Applied', ''],
      ['Attendee Category', filters.categoryFilter || 'All'],
      ['Payment Status', filters.paymentFilter || 'All'],
      ['Seat Allocation', filters.allocationFilter || 'All'],
      ['Search Query', filters.searchQuery ? filters.searchQuery : '(none)'],
      ['', ''],
      ['Totals For This Export', ''],
      ['Total Records', bookings.length],
      ['Paid Bookings', paidBookings.length],
      ['Tickets Sold (Paid)', totalTickets],
      ['Total Collections (₹)', totalCollections],
      ['Bookings With Seats Allocated', allocatedCount],
    ];

    summaryRows.forEach(([label, value]) => summarySheet.addRow({ label, value }));

    summarySheet.getColumn('label').font = { bold: true };
    summarySheet.getRow(1).font = { bold: true, size: 13, color: { argb: 'FF6E1423' } };
    summarySheet.getRow(5).font = { bold: true, color: { argb: 'FF6E1423' } };
    summarySheet.getRow(11).font = { bold: true, color: { argb: 'FF6E1423' } };

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
