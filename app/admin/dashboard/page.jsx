'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Tab 1 (Live Bookings) is now the default landing tab
  const [activeTab, setActiveTab] = useState('TAB1'); 
  const [loading, setLoading] = useState(true);

  // Data states
  const [metrics, setMetrics] = useState({
    totalCollections: 0,
    totalSeatsBooked: 0,
    totalPeopleBooked: 0,
    totalBookings: 0,
    msnCollections: 0,
    msnSeatsBooked: 0,
    msnPeopleBooked: 0,
    externalCollections: 0,
    externalSeatsBooked: 0,
    externalPeopleBooked: 0,
    batchBreakdown: [],
  });

  const [bookings, setBookings] = useState([]);
  const [batches, setBatches] = useState([]);
  const [externalRows, setExternalRows] = useState([]);

  // Form states for creating batch
  const [newBatch, setNewBatch] = useState({
    batchName: '',
    batchCode: '',
    assignedRows: 'Row A, Row B, Row C',
    capacity: 60,
    ticketPrice: 500,
  });
  const [batchMsg, setBatchMsg] = useState('');

  // Form states for external allocation
  const [newExtRow, setNewExtRow] = useState({
    rowName: '',
    capacity: 30,
    ticketPrice: 500,
  });
  const [extMsg, setExtMsg] = useState('');

  // Filter states for Tab 1 Live Bookings
  const [filterType, setFilterType] = useState('ALL');
  const [filterBatch, setFilterBatch] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const adminSession = sessionStorage.getItem('skanda_admin_session');
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }
    loadAllAdminData();
  }, [router]);

  // When filterType changes to EXTERNAL, reset filterBatch to ALL so MSN batch filter isn't active
  const handleCategoryChange = (val) => {
    setFilterType(val);
    if (val === 'EXTERNAL') {
      setFilterBatch('ALL');
    }
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Bookings & Metrics
      const resB = await fetch('/api/admin/bookings');
      const dataB = await resB.json();
      if (dataB.success) {
        setMetrics(dataB.metrics);
        setBookings(dataB.bookings);
      }

      // 2. Fetch Batches
      const resBatch = await fetch('/api/admin/batches');
      const dataBatch = await resBatch.json();
      if (dataBatch.success) {
        setBatches(dataBatch.batches);
      }

      // 3. Fetch External Allocations
      const resExt = await fetch('/api/admin/external');
      const dataExt = await resExt.json();
      if (dataExt.success) {
        setExternalRows(dataExt.external);
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setBatchMsg('');
    try {
      const rowsArray = newBatch.assignedRows.split(',').map((r) => r.trim()).filter(Boolean);
      const res = await fetch('/api/admin/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchName: newBatch.batchName,
          batchCode: newBatch.batchCode,
          assignedRows: rowsArray,
          capacity: Number(newBatch.capacity),
          ticketPrice: Number(newBatch.ticketPrice),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBatchMsg('✅ Batch created / updated successfully!');
        setNewBatch({
          batchName: '',
          batchCode: '',
          assignedRows: 'Row A, Row B',
          capacity: 50,
          ticketPrice: 500,
        });
        loadAllAdminData();
      } else {
        setBatchMsg(`❌ ${data.error}`);
      }
    } catch (err) {
      setBatchMsg('❌ Error creating batch.');
    }
  };

  const handleCreateExternalRow = async (e) => {
    e.preventDefault();
    setExtMsg('');
    try {
      const res = await fetch('/api/admin/external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExtRow),
      });
      const data = await res.json();
      if (data.success) {
        setExtMsg('✅ External row allocation saved successfully!');
        setNewExtRow({ rowName: '', capacity: 30, ticketPrice: 500 });
        loadAllAdminData();
      } else {
        setExtMsg(`❌ ${data.error}`);
      }
    } catch (err) {
      setExtMsg('❌ Error saving external row allocation.');
    }
  };

  const handleExportExcel = () => {
    window.open('/api/admin/export-excel', '_blank');
  };

  // Filter logic for Tab 1 Live Bookings
  const filteredBookings = bookings.filter((b) => {
    if (filterType !== 'ALL' && b.buyerType !== filterType) return false;
    if (filterType !== 'EXTERNAL' && filterBatch !== 'ALL' && b.batchCode !== filterBatch) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.customerName.toLowerCase().includes(q);
      const matchPhone = b.phone.includes(q);
      const matchId = b.bookingId.toLowerCase().includes(q);
      const matchCode = (b.batchCode || '').toLowerCase().includes(q);
      const matchStudent = (b.studentName || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchId || matchCode || matchStudent;
    }
    return true;
  });

  // Dynamic totals for filtered subset
  let filteredSeats = 0;
  let filteredCollections = 0;
  let filteredPaidBuyers = 0;

  filteredBookings.forEach((b) => {
    if (b.paymentStatus === 'PAID') {
      filteredSeats += b.ticketQty;
      filteredCollections += b.totalAmount;
      filteredPaidBuyers += 1;
    }
  });

  // Calculate Total Capacity across all Batches & External Rows
  const totalMsnCapacity = batches.reduce((acc, b) => acc + b.capacity, 0);
  const totalExtCapacity = externalRows.reduce((acc, r) => acc + r.capacity, 0);
  const totalAuditoriumCapacity = totalMsnCapacity + totalExtCapacity;
  const overallOccupancyPct = totalAuditoriumCapacity > 0 ? Math.round((metrics.totalSeatsBooked / totalAuditoriumCapacity) * 100) : 0;

  const msnRevPct = metrics.totalCollections > 0 ? Math.round((metrics.msnCollections / metrics.totalCollections) * 100) : 0;
  const extRevPct = metrics.totalCollections > 0 ? Math.round((metrics.externalCollections / metrics.totalCollections) * 100) : 0;

  const msnSeatsPct = metrics.totalSeatsBooked > 0 ? Math.round((metrics.msnSeatsBooked / metrics.totalSeatsBooked) * 100) : 0;
  const extSeatsPct = metrics.totalSeatsBooked > 0 ? Math.round((metrics.externalSeatsBooked / metrics.totalSeatsBooked) * 100) : 0;

  return (
    <div className="py-8 px-6 sm:px-10 max-w-[1500px] mx-auto" style={{ background: 'var(--ivory)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-gold/40">
        <div>
          <span className="eyebrow text-bronze">CONTROL CENTER</span>
          <h1 className="font-serif-display text-4xl font-bold text-maroon">
            Admin Inventory & Collections Panel
          </h1>
          <p className="text-sm text-ink-soft">
            Nritya Bharathanjali 2026 – Skanda Production • September 26, 2026
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllAdminData}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded border border-gold bg-cream hover:bg-sandal text-maroon shadow-sm"
          >
            🔄 Refresh Data
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('skanda_admin_session');
              router.push('/admin/login');
            }}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded bg-red-800 text-white hover:bg-red-900 shadow-sm"
          >
            🔒 Logout
          </button>
        </div>
      </div>

      {/* RE-ORDERED 6 TABS NAVIGATION (Live Bookings FIRST) */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gold/30 pb-2">
        <button
          onClick={() => setActiveTab('TAB1')}
          className={`px-5 py-3 font-marcellus text-sm font-semibold rounded-t-lg transition-all ${
            activeTab === 'TAB1'
              ? 'bg-maroon text-ivory border-t-2 border-x border-gold shadow-md'
              : 'bg-cream text-ink-soft hover:text-maroon'
          }`}
        >
          📋 1. Live Bookings ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('TAB2')}
          className={`px-5 py-3 font-marcellus text-sm font-semibold rounded-t-lg transition-all ${
            activeTab === 'TAB2'
              ? 'bg-maroon text-ivory border-t-2 border-x border-gold shadow-md'
              : 'bg-cream text-ink-soft hover:text-maroon'
          }`}
        >
          🎭 2. MSN Batch Management
        </button>

        <button
          onClick={() => setActiveTab('TAB3')}
          className={`px-5 py-3 font-marcellus text-sm font-semibold rounded-t-lg transition-all ${
            activeTab === 'TAB3'
              ? 'bg-maroon text-ivory border-t-2 border-x border-gold shadow-md'
              : 'bg-cream text-ink-soft hover:text-maroon'
          }`}
        >
          🎟️ 3. External Allocations
        </button>

        <button
          onClick={() => setActiveTab('TAB4')}
          className={`px-5 py-3 font-marcellus text-sm font-semibold rounded-t-lg transition-all ${
            activeTab === 'TAB4'
              ? 'bg-maroon text-ivory border-t-2 border-x border-gold shadow-md'
              : 'bg-cream text-ink-soft hover:text-maroon'
          }`}
        >
          💰 4. Revenue Matrices
        </button>

        <button
          onClick={() => setActiveTab('TAB5')}
          className={`px-5 py-3 font-marcellus text-sm font-semibold rounded-t-lg transition-all ${
            activeTab === 'TAB5'
              ? 'bg-maroon text-ivory border-t-2 border-x border-gold shadow-md'
              : 'bg-cream text-ink-soft hover:text-maroon'
          }`}
        >
          📊 5. Visual Dashboard & Analytics
        </button>

        <button
          onClick={() => setActiveTab('TAB6')}
          className={`px-5 py-3 font-marcellus text-sm font-semibold rounded-t-lg transition-all ${
            activeTab === 'TAB6'
              ? 'bg-maroon text-ivory border-t-2 border-x border-gold shadow-md'
              : 'bg-cream text-ink-soft hover:text-maroon'
          }`}
        >
          📥 6. Excel Export
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-ink-soft font-medium">
          ⏳ Syncing live inventory and database metrics...
        </div>
      ) : (
        <>
          {/* ================= TAB 1: LIVE BOOKINGS (FIRST LANDING TAB) ================= */}
          {activeTab === 'TAB1' && (
            <div className="space-y-6">
              {/* Filter Bar with Conditional MSN Batch Dropdown */}
              <div className="card-gold-accent p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-bronze mb-1">
                      📁 Attendee Category:
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full p-2.5 border border-gold rounded text-sm bg-white font-medium"
                    >
                      <option value="ALL">All Categories (MSN + External)</option>
                      <option value="MSN">MSN Student / Parent Only</option>
                      <option value="EXTERNAL">External Attendees Only</option>
                    </select>
                  </div>

                  {/* MSN Batch Dropdown: HIDDEN when filterType === 'EXTERNAL' */}
                  {filterType !== 'EXTERNAL' ? (
                    <div>
                      <label className="block text-xs font-bold uppercase text-bronze mb-1">
                        🎭 Filter by MSN Batch:
                      </label>
                      <select
                        value={filterBatch}
                        onChange={(e) => setFilterBatch(e.target.value)}
                        className="w-full p-2.5 border border-gold rounded text-sm bg-white font-medium"
                      >
                        <option value="ALL">All Batches</option>
                        {batches.map((b) => (
                          <option key={b.id} value={b.batchCode}>
                            {b.batchName} ({b.batchCode})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded bg-cream border border-gold/40 text-xs text-ink-soft italic flex items-center">
                      ℹ️ Batch filter hidden for External Attendees.
                    </div>
                  )}

                  {/* Search Query Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-bronze mb-1">
                      🔍 Search Customer / Phone:
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Name, Phone, Code, Ref..."
                      className="input-luxe text-sm py-2"
                    />
                  </div>
                </div>

                {/* DYNAMIC FILTERED SUMMARY BAR */}
                <div className="pt-3 border-t border-gold/30 flex flex-wrap justify-between items-center gap-4 text-xs font-bold bg-cream/70 p-3 rounded">
                  <div className="flex flex-wrap items-center gap-6">
                    <span className="text-maroon">
                      👥 Filtered Buyers: <strong className="text-base text-amber-900 font-num">{filteredPaidBuyers}</strong>
                    </span>
                    <span className="text-maroon">
                      🎟️ Filtered Seats Sold: <strong className="text-base text-emerald-900 font-num">{filteredSeats}</strong>
                    </span>
                    <span className="text-maroon">
                      💰 Filtered Collection: <strong className="text-base text-maroon font-num">₹{filteredCollections.toLocaleString()}</strong>
                    </span>
                  </div>

                  {(filterType !== 'ALL' || filterBatch !== 'ALL' || searchQuery.trim()) && (
                    <button
                      onClick={() => {
                        setFilterType('ALL');
                        setFilterBatch('ALL');
                        setSearchQuery('');
                      }}
                      className="text-xs text-red-800 underline hover:text-red-900 font-semibold"
                    >
                      Clear Filters ✕
                    </button>
                  )}
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
                        <th className="p-2.5">Customer Name (Buyer)</th>
                        <th className="p-2.5">Phone / WhatsApp</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Student / Batch Code</th>
                        <th className="p-2.5">Allocated Row</th>
                        <th className="p-2.5 text-right">Seats Booked (Qty)</th>
                        <th className="p-2.5 text-right">Amount (₹)</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/30">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-6 text-center text-ink-soft font-medium">
                            No booking records match the selected category or batch filters.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-cream/50">
                            <td className="p-2.5 font-mono font-bold text-maroon">{b.bookingId}</td>
                            <td className="p-2.5 font-semibold text-ink">{b.customerName}</td>
                            <td className="p-2.5 font-mono">{b.whatsapp}</td>
                            <td className="p-2.5">
                              <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${b.buyerType === 'MSN' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'}`}>
                                {b.buyerType}
                              </span>
                            </td>
                            <td className="p-2.5 font-medium">
                              {b.buyerType === 'MSN' ? `${b.studentName || 'Student'} (${b.batchCode})` : 'External'}
                            </td>
                            <td className="p-2.5 font-semibold text-maroon">{b.allocatedRow}</td>
                            <td className="p-2.5 text-right font-num font-bold text-emerald-900">{b.ticketQty} seats</td>
                            <td className="p-2.5 text-right font-num font-bold text-maroon">₹{b.totalAmount}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
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
                          <td colSpan={6} className="p-3 text-right uppercase tracking-wider font-marcellus">
                            FILTERED DISPLAYED TOTALS:
                          </td>
                          <td className="p-3 text-right font-num text-emerald-950 text-sm">
                            {filteredSeats} seats
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

          {/* ================= TAB 2: MSN BATCH MANAGEMENT ================= */}
          {activeTab === 'TAB2' && (
            <div className="space-y-8">
              <div className="card-gold-accent p-6 space-y-4">
                <h3 className="font-serif-display text-2xl font-semibold text-maroon">
                  ➕ Create / Configure MSN Batch Allocation
                </h3>

                {batchMsg && (
                  <div className="p-3 rounded bg-sandal/50 text-sm font-semibold">{batchMsg}</div>
                )}

                <form onSubmit={handleCreateBatch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-bronze uppercase mb-1">Batch Name</label>
                    <input
                      type="text"
                      value={newBatch.batchName}
                      onChange={(e) => setNewBatch({ ...newBatch, batchName: e.target.value })}
                      placeholder="e.g. Bharatanatyam Grade 4"
                      className="input-luxe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-bronze uppercase mb-1">Unique Batch Code</label>
                    <input
                      type="text"
                      value={newBatch.batchCode}
                      onChange={(e) => setNewBatch({ ...newBatch, batchCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. SKANDA-G4"
                      className="input-luxe font-mono uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-bronze uppercase mb-1">Assigned Rows (Comma Separated)</label>
                    <input
                      type="text"
                      value={newBatch.assignedRows}
                      onChange={(e) => setNewBatch({ ...newBatch, assignedRows: e.target.value })}
                      placeholder="e.g. Row A, Row B, Row C"
                      className="input-luxe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-bronze uppercase mb-1">Total Seat Capacity</label>
                    <input
                      type="number"
                      value={newBatch.capacity}
                      onChange={(e) => setNewBatch({ ...newBatch, capacity: e.target.value })}
                      className="input-luxe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-bronze uppercase mb-1">Ticket Price (₹)</label>
                    <input
                      type="number"
                      value={newBatch.ticketPrice}
                      onChange={(e) => setNewBatch({ ...newBatch, ticketPrice: e.target.value })}
                      className="input-luxe"
                      required
                    />
                  </div>

                  <div className="flex items-end">
                    <button type="submit" className="w-full luxe-button luxe-button-solid py-3">
                      SAVE BATCH ALLOCATION
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Batches Table */}
              <div className="card-gold-accent p-6 space-y-4">
                <h3 className="font-serif-display text-2xl font-semibold text-maroon">
                  Active MSN Batches — People & Seats Allocation Ledger
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-maroon text-ivory font-marcellus text-xs uppercase tracking-wider">
                        <th className="p-3">Batch Name</th>
                        <th className="p-3">Batch Code</th>
                        <th className="p-3">Assigned Rows</th>
                        <th className="p-3 text-right">People Booked (Buyers)</th>
                        <th className="p-3 text-right">Seats Booked</th>
                        <th className="p-3 text-right">Seats Remaining</th>
                        <th className="p-3 text-right">Total Capacity</th>
                        <th className="p-3 text-right">Collections (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/30">
                      {batches.map((b) => (
                        <tr key={b.id} className="hover:bg-cream/50">
                          <td className="p-3 font-semibold text-ink">{b.batchName}</td>
                          <td className="p-3 font-mono font-bold text-maroon">{b.batchCode}</td>
                          <td className="p-3 text-xs">{b.assignedRows.join(', ')}</td>
                          <td className="p-3 text-right font-num font-bold text-amber-900">{b.peopleBooked} buyers</td>
                          <td className="p-3 text-right font-num text-emerald-800 font-bold">{b.bookedCount} seats</td>
                          <td className="p-3 text-right font-num text-amber-800 font-bold">{b.remainingCount} seats</td>
                          <td className="p-3 text-right font-num">{b.capacity} seats</td>
                          <td className="p-3 text-right font-num font-bold text-maroon">₹{b.totalCollected.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: EXTERNAL ALLOCATIONS ================= */}
          {activeTab === 'TAB3' && (
            <div className="space-y-8">
              <div className="card-gold-accent p-6 space-y-4">
                <h3 className="font-serif-display text-2xl font-semibold text-maroon">
                  ➕ Configure External Seating Rows
                </h3>

                {extMsg && <div className="p-3 rounded bg-sandal/50 text-sm font-semibold">{extMsg}</div>}

                <form onSubmit={handleCreateExternalRow} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-bronze uppercase mb-1">Auditorium Row Name</label>
                    <input
                      type="text"
                      value={newExtRow.rowName}
                      onChange={(e) => setNewExtRow({ ...newExtRow, rowName: e.target.value.toUpperCase() })}
                      placeholder="e.g. ROW D"
                      className="input-luxe uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-bronze uppercase mb-1">Row Seat Capacity</label>
                    <input
                      type="number"
                      value={newExtRow.capacity}
                      onChange={(e) => setNewExtRow({ ...newExtRow, capacity: e.target.value })}
                      className="input-luxe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-bronze uppercase mb-1">Ticket Price (₹)</label>
                    <input
                      type="number"
                      value={newExtRow.ticketPrice}
                      onChange={(e) => setNewExtRow({ ...newExtRow, ticketPrice: e.target.value })}
                      className="input-luxe"
                      required
                    />
                  </div>

                  <div className="flex items-end">
                    <button type="submit" className="w-full luxe-button luxe-button-solid py-3">
                      SAVE EXTERNAL ROW
                    </button>
                  </div>
                </form>
              </div>

              {/* Table */}
              <div className="card-gold-accent p-6 space-y-4">
                <h3 className="font-serif-display text-2xl font-semibold text-maroon">
                  External Attendee Seating Pool & People Booked
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-maroon text-ivory font-marcellus text-xs uppercase tracking-wider">
                        <th className="p-3">Row Name</th>
                        <th className="p-3 text-right">People Booked (Buyers)</th>
                        <th className="p-3 text-right">Seats Booked</th>
                        <th className="p-3 text-right">Seats Remaining</th>
                        <th className="p-3 text-right">Row Capacity</th>
                        <th className="p-3 text-right">Ticket Price</th>
                        <th className="p-3 text-right">Total Collection (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/30">
                      {externalRows.map((r) => (
                        <tr key={r.id} className="hover:bg-cream/50">
                          <td className="p-3 font-bold font-serif-display text-maroon text-base">{r.rowName}</td>
                          <td className="p-3 text-right font-num font-bold text-amber-900">{r.peopleBooked} buyers</td>
                          <td className="p-3 text-right font-num text-emerald-800 font-bold">{r.bookedCount} seats</td>
                          <td className="p-3 text-right font-num text-amber-800 font-bold">{r.remainingCount} seats</td>
                          <td className="p-3 text-right font-num">{r.capacity} seats</td>
                          <td className="p-3 text-right font-num">₹{r.ticketPrice}</td>
                          <td className="p-3 text-right font-num font-bold text-maroon">₹{r.totalCollected.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: REVENUE & BATCH MATRICES ================= */}
          {activeTab === 'TAB4' && (
            <div className="space-y-8">
              <div className="card-gold-accent p-6 space-y-6">
                <h3 className="font-serif-display text-3xl font-semibold text-maroon">
                  Financial Collections & Revenue Matrices
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-lg bg-cream border-2 border-gold text-center space-y-2">
                    <span className="eyebrow">OVERALL COLLECTION</span>
                    <div className="font-num text-4xl font-bold text-maroon">
                      ₹{metrics.totalCollections.toLocaleString()}
                    </div>
                    <span className="text-xs text-ink-soft block">
                      {metrics.totalSeatsBooked} Seats Sold across {metrics.totalPeopleBooked} Buyers
                    </span>
                  </div>

                  <div className="p-6 rounded-lg bg-cream border border-gold text-center space-y-2">
                    <span className="eyebrow">MSN BATCH METRICS</span>
                    <div className="font-num text-4xl font-bold text-amber-900">
                      ₹{metrics.msnCollections.toLocaleString()}
                    </div>
                    <span className="text-xs text-ink-soft block">
                      {metrics.msnSeatsBooked} Seats Sold across {metrics.msnPeopleBooked} MSN Parents
                    </span>
                  </div>

                  <div className="p-6 rounded-lg bg-cream border border-gold text-center space-y-2">
                    <span className="eyebrow">EXTERNAL AUDIENCE METRICS</span>
                    <div className="font-num text-4xl font-bold text-emerald-900">
                      ₹{metrics.externalCollections.toLocaleString()}
                    </div>
                    <span className="text-xs text-ink-soft block">
                      {metrics.externalSeatsBooked} Seats Sold across {metrics.externalPeopleBooked} External Guests
                    </span>
                  </div>
                </div>
              </div>

              {/* Batch Breakdown Revenue Table */}
              <div className="card-gold-accent p-6 space-y-4">
                <h3 className="font-serif-display text-2xl font-semibold text-maroon">
                  Batch Revenue Matrix
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-maroon text-ivory font-marcellus text-xs uppercase tracking-wider">
                        <th className="p-3">Batch Name</th>
                        <th className="p-3">Batch Code</th>
                        <th className="p-3 text-right">People Booked (Buyers)</th>
                        <th className="p-3 text-right">Seats Booked (Tickets)</th>
                        <th className="p-3 text-right">Total Revenue (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/30">
                      {metrics.batchBreakdown.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-ink-soft">
                            No MSN batch revenue recorded yet.
                          </td>
                        </tr>
                      ) : (
                        metrics.batchBreakdown.map((row, idx) => (
                          <tr key={idx} className="hover:bg-cream/50">
                            <td className="p-3 font-semibold text-ink">{row.batchName}</td>
                            <td className="p-3 font-mono font-bold text-maroon">{row.batchCode}</td>
                            <td className="p-3 text-right font-num font-bold text-amber-900">{row.peopleBooked} buyers</td>
                            <td className="p-3 text-right font-num font-bold text-emerald-900">{row.seatsBooked} seats</td>
                            <td className="p-3 text-right font-num font-bold text-maroon">
                              ₹{row.collection.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: VISUAL DASHBOARD & ANALYTICS ================= */}
          {activeTab === 'TAB5' && (
            <div className="space-y-8">
              {/* Overall Auditorium Occupancy Progress Gauge Card */}
              <div className="card-gold-accent p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gold/30 pb-4">
                  <div>
                    <span className="eyebrow">AUDITORIUM OCCUPANCY RATE</span>
                    <h3 className="font-serif-display text-3xl font-bold text-maroon">
                      Overall Seat Capacity vs. Booked Tickets
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="font-num text-4xl font-extrabold text-maroon">{overallOccupancyPct}%</span>
                    <span className="block text-xs uppercase tracking-wider text-bronze">OCCUPANCY RATE</span>
                  </div>
                </div>

                {/* Main Visual Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-emerald-900">🎟️ Seats Booked: {metrics.totalSeatsBooked} seats</span>
                    <span className="text-amber-900">💺 Seats Remaining: {Math.max(0, totalAuditoriumCapacity - metrics.totalSeatsBooked)} seats</span>
                  </div>

                  <div className="w-full h-6 bg-sandal/60 rounded-full overflow-hidden border border-gold flex">
                    <div
                      className="bg-gradient-to-r from-maroon to-maroon-soft h-full transition-all duration-1000 flex items-center justify-center text-ivory text-xs font-bold font-num"
                      style={{ width: `${Math.min(100, overallOccupancyPct)}%` }}
                    >
                      {overallOccupancyPct > 5 ? `${overallOccupancyPct}%` : ''}
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-ink-soft pt-1 font-mono">
                    <span>0 Seats</span>
                    <span>Total Auditorium Capacity: {totalAuditoriumCapacity} Seats</span>
                  </div>
                </div>

                {/* Split Comparison Cards (Revenue vs. Seats) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Revenue Distribution Visual */}
                  <div className="p-6 rounded-lg bg-cream border border-gold space-y-4">
                    <h4 className="font-marcellus text-lg font-semibold text-maroon flex items-center gap-2">
                      <span>💰</span> Revenue Category Share
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-amber-900">MSN Batch Revenue: ₹{metrics.msnCollections.toLocaleString()}</span>
                          <span className="font-num text-maroon">{msnRevPct}%</span>
                        </div>
                        <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-gold/40">
                          <div className="bg-amber-700 h-full rounded-full" style={{ width: `${msnRevPct}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-emerald-900">External Revenue: ₹{metrics.externalCollections.toLocaleString()}</span>
                          <span className="font-num text-maroon">{extRevPct}%</span>
                        </div>
                        <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-gold/40">
                          <div className="bg-emerald-700 h-full rounded-full" style={{ width: `${extRevPct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seat Distribution Visual */}
                  <div className="p-6 rounded-lg bg-cream border border-gold space-y-4">
                    <h4 className="font-marcellus text-lg font-semibold text-maroon flex items-center gap-2">
                      <span>🎟️</span> Seat Distribution Share
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-amber-900">MSN Parent Seats: {metrics.msnSeatsBooked} seats ({metrics.msnPeopleBooked} buyers)</span>
                          <span className="font-num text-maroon">{msnSeatsPct}%</span>
                        </div>
                        <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-gold/40">
                          <div className="bg-amber-700 h-full rounded-full" style={{ width: `${msnSeatsPct}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-emerald-900">External Seats: {metrics.externalSeatsBooked} seats ({metrics.externalPeopleBooked} buyers)</span>
                          <span className="font-num text-maroon">{extSeatsPct}%</span>
                        </div>
                        <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-gold/40">
                          <div className="bg-emerald-700 h-full rounded-full" style={{ width: `${extSeatsPct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MSN Batches Occupancy Visual Progress Cards */}
              <div className="card-gold-accent p-6 space-y-6">
                <h3 className="font-serif-display text-2xl font-semibold text-maroon">
                  MSN Batch Occupancy & Revenue Visual Progress
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {batches.map((b) => {
                    const batchPct = b.capacity > 0 ? Math.round((b.bookedCount / b.capacity) * 100) : 0;
                    return (
                      <div key={b.id} className="p-5 rounded-lg bg-cream/70 border border-gold space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="inline-block px-2 py-0.5 text-xs font-mono font-bold bg-maroon text-ivory rounded">
                              {b.batchCode}
                            </span>
                            <h4 className="font-serif-display text-xl font-bold text-maroon mt-1">
                              {b.batchName}
                            </h4>
                            <span className="text-xs text-ink-soft">Rows: {b.assignedRows.join(', ')}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-num text-2xl font-bold text-maroon">{batchPct}%</span>
                            <span className="block text-[10px] uppercase text-bronze">FILLED</span>
                          </div>
                        </div>

                        {/* Progress Meter */}
                        <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-gold/40">
                          <div
                            className="bg-maroon h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, batchPct)}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gold/30 text-center text-xs">
                          <div>
                            <span className="text-ink-soft block text-[10px]">BUYERS</span>
                            <strong className="text-amber-900 font-num text-sm">{b.peopleBooked}</strong>
                          </div>
                          <div>
                            <span className="text-ink-soft block text-[10px]">SEATS BOOKED</span>
                            <strong className="text-emerald-900 font-num text-sm">{b.bookedCount} / {b.capacity}</strong>
                          </div>
                          <div>
                            <span className="text-ink-soft block text-[10px]">REVENUE</span>
                            <strong className="text-maroon font-num text-sm">₹{b.totalCollected.toLocaleString()}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* External Rows Visual Fill Progress Cards */}
              <div className="card-gold-accent p-6 space-y-6">
                <h3 className="font-serif-display text-2xl font-semibold text-maroon">
                  External Seating Rows Fill Progress
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {externalRows.map((r) => {
                    const rowPct = r.capacity > 0 ? Math.round((r.bookedCount / r.capacity) * 100) : 0;
                    return (
                      <div key={r.id} className="p-5 rounded-lg bg-cream/70 border border-gold space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-serif-display text-2xl font-bold text-maroon">
                            {r.rowName}
                          </h4>
                          <span className="font-num text-xl font-bold text-maroon">{rowPct}%</span>
                        </div>

                        {/* Progress Meter */}
                        <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-gold/40">
                          <div
                            className="bg-emerald-700 h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, rowPct)}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gold/30 text-center text-xs">
                          <div>
                            <span className="text-ink-soft block text-[10px]">SEATS SOLD</span>
                            <strong className="text-emerald-900 font-num">{r.bookedCount} / {r.capacity}</strong>
                          </div>
                          <div>
                            <span className="text-ink-soft block text-[10px]">REVENUE</span>
                            <strong className="text-maroon font-num">₹{r.totalCollected.toLocaleString()}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: EXCEL EXPORT ================= */}
          {activeTab === 'TAB6' && (
            <div className="space-y-6">
              <div className="card-gold-accent p-8 text-center space-y-4 max-w-xl mx-auto">
                <div className="text-5xl">📊</div>
                <h3 className="font-serif-display text-3xl font-bold text-maroon">
                  Export Booking Data to Excel
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Download a complete formatted Microsoft Excel spreadsheet (`.xlsx`) containing all verified bookings, customer details, WhatsApp numbers, batch codes, seat counts, row allocations, and Razorpay transaction IDs.
                </p>

                <div className="pt-4">
                  <button
                    onClick={handleExportExcel}
                    className="luxe-button luxe-button-solid px-8 py-4 text-base shadow-xl"
                  >
                    📥 DOWNLOAD EXCEL SPREADSHEET (.XLSX) &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
