'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Data states
  const [metrics, setMetrics] = useState({
    totalCapacity: 600,
    remainingTickets: 600,
    occupancyPct: 0,
    totalCollections: 0,
    totalTicketsBooked: 0,
    totalPaidBookings: 0,
    totalBookings: 0,
    msnTickets: 0,
    msnCollections: 0,
    externalTickets: 0,
    externalCollections: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    loadAllAdminData();
  }, [router]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const resB = await fetch('/api/admin/bookings');
      if (resB.status === 401) {
        router.push('/admin/login');
        return;
      }
      const dataB = await resB.json();
      if (dataB.success) {
        setMetrics(dataB.metrics);
        setBookings(dataB.bookings);
      } else {
        router.push('/admin/login');
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    window.open('/api/admin/export-excel', '_blank');
  };

  // Helper to remove bracket suffixes like (MSN Parent) or (External)
  const cleanName = (name) => {
    if (!name) return '';
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  };

  // Filter logic for Live Bookings (Includes searching by MSN Student Name)
  const filteredBookings = bookings.filter((b) => {
    if (categoryFilter !== 'ALL' && b.buyerType !== categoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = cleanName(b.customerName).toLowerCase().includes(q);
      const matchStudent = (b.studentName || '').toLowerCase().includes(q);
      const matchPhone = b.phone.includes(q);
      const matchEmail = (b.email || '').toLowerCase().includes(q);
      const matchId = b.bookingId.toLowerCase().includes(q);
      return matchName || matchStudent || matchPhone || matchEmail || matchId;
    }
    return true;
  });

  // Dynamic totals for filtered subset
  let filteredTickets = 0;
  let filteredCollections = 0;
  let filteredPaidBuyers = 0;
  let pendingBookingsCount = 0;

  bookings.forEach((b) => {
    if (b.paymentStatus === 'PENDING') {
      pendingBookingsCount += 1;
    }
  });

  filteredBookings.forEach((b) => {
    if (b.paymentStatus === 'PAID') {
      filteredTickets += b.ticketQty;
      filteredCollections += b.totalAmount;
      filteredPaidBuyers += 1;
    }
  });

  const totalCapacity = metrics.totalCapacity || 600;
  const bookedTickets = metrics.totalTicketsBooked || 0;
  const remainingTickets = metrics.remainingTickets !== undefined ? metrics.remainingTickets : Math.max(0, totalCapacity - bookedTickets);
  const occupancyPct = Math.round((bookedTickets / totalCapacity) * 100);

  return (
    <div className="py-8 px-6 sm:px-10 max-w-[1500px] mx-auto" style={{ background: 'var(--ivory)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-gold/40">
        <div>
          <span className="eyebrow text-bronze">CONTROL CENTER</span>
          <h1 className="font-serif-display text-4xl font-bold text-maroon">
            Admin Live Bookings & Dashboard
          </h1>
          <p className="text-sm text-ink-soft">
            Nritya Bharathanjali 2026 – Skanda Production • September 26, 2026 • <strong>600 Total Capacity</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded border border-gold transition-all shadow-sm flex items-center gap-1.5 ${
              showAnalytics
                ? 'bg-maroon text-ivory border-maroon'
                : 'bg-sandal text-maroon hover:bg-gold-pale'
            }`}
          >
            📊 {showAnalytics ? 'Hide Analytics' : 'Show Analytics & Insights'}
          </button>
          <button
            onClick={loadAllAdminData}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded border border-gold bg-cream hover:bg-sandal text-maroon shadow-sm flex items-center gap-1.5"
          >
            🔄 Refresh Data
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded border border-gold bg-maroon text-ivory hover:bg-maroon-soft shadow-sm flex items-center gap-1.5"
          >
            📥 Export to Excel
          </button>
          <button
            onClick={async () => {
              try {
                await fetch('/api/admin/logout', { method: 'POST' });
              } catch (e) {}
              sessionStorage.removeItem('skanda_admin_session');
              router.push('/admin/login');
              router.refresh();
            }}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded bg-red-800 text-white hover:bg-red-900 shadow-sm"
          >
            🔒 Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-ink-soft font-medium">
          ⏳ Syncing live database metrics...
        </div>
      ) : (
        <div className="space-y-6">
          {/* ================= OPTIONAL STATISTICAL ANALYTICS PANEL ================= */}
          {showAnalytics && (
            <div className="card-gold-accent p-6 space-y-6 bg-white-warm shadow-md border-2 border-gold animate-fadeIn">
              <div className="flex justify-between items-center pb-3 border-b border-gold/30">
                <div>
                  <span className="eyebrow">STATISTICAL OBSERVATIONS</span>
                  <h3 className="font-serif-display text-2xl font-bold text-maroon">
                    Live Booking Analytics & Summary Insights
                  </h3>
                </div>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="text-xs font-bold text-ink-soft hover:text-maroon underline"
                >
                  Close Analytics ✕
                </button>
              </div>

              {/* Top-Level Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* 1. Total Revenue */}
                <div className="p-4 rounded-lg bg-cream border border-gold text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bronze block">TOTAL REVENUE</span>
                  <div className="font-num text-2xl font-bold text-maroon">
                    ₹{metrics.totalCollections.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-ink-soft block">Verified Online</span>
                </div>

                {/* 2. Total Tickets Booked */}
                <div className="p-4 rounded-lg bg-cream border border-gold text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bronze block">TICKETS BOOKED</span>
                  <div className="font-num text-2xl font-bold text-amber-900">
                    {bookedTickets} / 600
                  </div>
                  <span className="text-[10px] text-ink-soft block">Confirmed Issued</span>
                </div>

                {/* 3. Remaining Tickets */}
                <div className="p-4 rounded-lg bg-cream border border-gold text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bronze block">REMAINING TICKETS</span>
                  <div className="font-num text-2xl font-bold text-emerald-900">
                    {remainingTickets}
                  </div>
                  <span className="text-[10px] text-ink-soft block">Available Out of 600</span>
                </div>

                {/* 4. Paid Bookings */}
                <div className="p-4 rounded-lg bg-cream border border-gold text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bronze block">PAID BOOKINGS</span>
                  <div className="font-num text-2xl font-bold text-emerald-900">
                    {metrics.totalPaidBookings}
                  </div>
                  <span className="text-[10px] text-ink-soft block">Successful Orders</span>
                </div>

                {/* 6. Total Bookings */}
                <div className="p-4 rounded-lg bg-cream border border-gold text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bronze block">TOTAL ORDERS</span>
                  <div className="font-num text-2xl font-bold text-maroon">
                    {metrics.totalBookings}
                  </div>
                  <span className="text-[10px] text-ink-soft block">All Order Attempts</span>
                </div>
              </div>

              {/* Visual Occupancy Bar & Category Share */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gold/30 items-center">
                {/* Occupancy Rate Bar */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-maroon">🎟️ Event Capacity Occupancy Rate ({occupancyPct}%)</span>
                    <span className="text-ink-soft font-mono">{bookedTickets} / 600 Tickets</span>
                  </div>

                  <div className="w-full h-5 bg-sandal/60 rounded-full overflow-hidden border border-gold flex">
                    <div
                      className="bg-gradient-to-r from-maroon to-maroon-soft h-full transition-all duration-1000 flex items-center justify-center text-ivory text-[10px] font-bold font-num"
                      style={{ width: `${Math.min(100, occupancyPct)}%` }}
                    >
                      {occupancyPct > 5 ? `${occupancyPct}%` : ''}
                    </div>
                  </div>
                </div>

                {/* Category Share Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-center">
                    <span className="font-bold text-amber-900 block text-[11px]">🎭 MSN Students</span>
                    <strong className="font-num text-base text-amber-950">{metrics.msnTickets || 0}</strong> tickets
                    <span className="block text-[10px] text-ink-soft">₹{(metrics.msnCollections || 0).toLocaleString()}</span>
                  </div>

                  <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-center">
                    <span className="font-bold text-blue-900 block text-[11px]">🎟️ External Guests</span>
                    <strong className="font-num text-base text-blue-950">{metrics.externalTickets || 0}</strong> tickets
                    <span className="block text-[10px] text-ink-soft">₹{(metrics.externalCollections || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= MAIN LIVE BOOKINGS SEARCH & LEDGER TABLE ================= */}
          {/* Filter Bar */}
          <div className="card-gold-accent p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Search Query Input */}
              <div className="w-full sm:w-1/2">
                <label className="block text-xs font-bold uppercase text-bronze mb-1">
                  🔍 Search Customer, Student/Child Name, Phone, Email, Ref ID:
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Customer, Student Name, Phone, Email..."
                  className="input-luxe text-sm py-2"
                />
              </div>

              {/* Category Filter */}
              <div className="w-full sm:w-1/3">
                <label className="block text-xs font-bold uppercase text-bronze mb-1">
                  🏷️ Filter Attendee Category:
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input-luxe text-sm py-2"
                >
                  <option value="ALL">All Categories</option>
                  <option value="MSN">MSN Student / Parent (Min 3 Tickets)</option>
                  <option value="EXTERNAL">External Attendee (Min 1 Ticket)</option>
                </select>
              </div>
            </div>

            {/* DYNAMIC SUMMARY BAR */}
            <div className="pt-3 border-t border-gold/30 flex flex-wrap justify-between items-center gap-4 text-xs font-bold bg-cream/70 p-3 rounded">
              <div className="flex flex-wrap items-center gap-6">
                <span className="text-maroon">
                  👥 Paid Buyers: <strong className="text-base text-amber-900 font-num">{filteredPaidBuyers}</strong>
                </span>
                <span className="text-maroon">
                  🎟️ Tickets Sold: <strong className="text-base text-emerald-900 font-num">{filteredTickets}</strong>
                </span>
                <span className="text-maroon">
                  💰 Total Collections: <strong className="text-base text-maroon font-num">₹{filteredCollections.toLocaleString()}</strong>
                </span>
              </div>
              <div className="text-ink-soft text-[11px]">
                Showing {filteredBookings.length} of {bookings.length} Records
              </div>
            </div>
          </div>

          {/* Table with Dynamic Footer Summary Row */}
          <div className="card-gold-accent p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-serif-display text-2xl font-semibold text-maroon">
                Live Customer Bookings Ledger ({filteredBookings.length} Records)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-maroon text-ivory font-marcellus uppercase tracking-wider">
                    <th className="p-2.5">Booking ID</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Customer Name & Student</th>
                    <th className="p-2.5">Phone / WhatsApp</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5 text-right">Tickets</th>
                    <th className="p-2.5 text-right">Amount (₹)</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/30">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-ink-soft font-medium">
                        No booking records found matching selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-cream/50">
                        <td className="p-2.5 font-mono font-bold text-maroon">{b.bookingId}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.buyerType === 'MSN'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}>
                            {b.buyerType === 'MSN' ? 'MSN Student' : 'External'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <div className="font-semibold text-ink">{cleanName(b.customerName)}</div>
                          {b.buyerType === 'MSN' && b.studentName && (
                            <div className="text-[11px] text-bronze font-bold mt-0.5">
                              Student: {b.studentName}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 font-mono">{b.whatsapp}</td>
                        <td className="p-2.5 text-ink-soft">{b.email}</td>
                        <td className="p-2.5 text-right font-num font-bold text-emerald-900">{b.ticketQty} tickets</td>
                        <td className="p-2.5 text-right font-num font-bold text-maroon">₹{b.totalAmount}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.paymentStatus === 'PAID'
                              ? 'bg-sandal text-maroon border border-gold/60'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="p-2.5 text-[10px] text-ink-soft">
                          {new Date(b.bookingDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Table Totals Summary Footer */}
                {filteredBookings.length > 0 && (
                  <tfoot>
                    <tr className="bg-sandal/60 border-t-2 border-gold font-bold text-ink">
                      <td colSpan={5} className="p-3 text-right uppercase tracking-wider font-marcellus">
                        TOTALS:
                      </td>
                      <td className="p-3 text-right font-num text-emerald-950 text-sm">
                        {filteredTickets} tickets
                      </td>
                      <td className="p-3 text-right font-num text-maroon text-sm">
                        ₹{filteredCollections.toLocaleString()}
                      </td>
                      <td colSpan={2} className="p-3 text-xs text-ink-soft">
                        ({filteredPaidBuyers} Buyers Paid)
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
