'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookingDrawer from '../../../components/BookingDrawer';
import SeatingChartModal from '../../../components/SeatingChartModal';

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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
  const [allocationFilter, setAllocationFilter] = useState('ALL'); // 'ALL' | 'ALLOCATED' | 'NOT_ALLOCATED'
  const [paymentFilter, setPaymentFilter] = useState('ALL'); // 'ALL' | 'PAID' | 'PENDING'

  // Selected Booking Drawer & Modal state
  const [activeBooking, setActiveBooking] = useState(null);
  const [showSeatingChart, setShowSeatingChart] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [exporting, setExporting] = useState(false);

  // Add Manual Person Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    buyerType: 'MSN',
    customerName: '',
    studentName: '',
    phone: '',
    whatsapp: '',
    isWhatsappSame: true,
    email: '',
    ticketQty: 1,
    totalAmount: 850,
    paymentStatus: 'PAID',
    teamCode: 'General',
  });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  const handleAddPersonSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.customerName || !addFormData.phone || !addFormData.email) {
      setAddError('Please fill in Customer Name, Phone, and Email.');
      return;
    }
    setAddSubmitting(true);
    setAddError('');
    try {
      const res = await fetch('/api/admin/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addFormData),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`✅ Customer ${data.booking.customerName} added successfully (${data.booking.bookingId})!`);
        setShowAddModal(false);
        setAddFormData({
          buyerType: 'MSN',
          customerName: '',
          studentName: '',
          phone: '',
          whatsapp: '',
          isWhatsappSame: true,
          email: '',
          ticketQty: 1,
          totalAmount: 850,
          paymentStatus: 'PAID',
          teamCode: 'General',
        });
        loadAllAdminData();
      } else {
        setAddError(data.error || 'Failed to add customer record.');
      }
    } catch (err) {
      setAddError('Network error adding customer booking record.');
    } finally {
      setAddSubmitting(false);
    }
  };

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
        // Exclude PENDING (unpaid, never-followed-up) records from the dashboard ledger —
        // only bookings that reached UTR_SUBMITTED or PAID are real, actionable records.
        setBookings(dataB.bookings.filter((b) => b.paymentStatus !== 'PENDING'));
      } else {
        router.push('/admin/login');
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const cleanName = (name) => {
    if (!name) return '';
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  // Row click opens drawer
  const handleRowClick = (booking) => {
    setActiveBooking(booking);
  };

  const handleOpenSeatingChartFromDrawer = (booking) => {
    setActiveBooking(booking);
    setShowSeatingChart(true);
  };

  const handleBookingDeleted = (deletedBooking, result) => {
    setBookings((prev) => prev.filter((b) => b.id !== deletedBooking.id));
    setActiveBooking(null);
    triggerToast(
      `🗑️ Booking ${result.deletedBookingId} deleted.${
        result.freedSeatCount > 0 ? ` ${result.freedSeatCount} seat(s) freed back to Available.` : ''
      }`
    );
    // Refresh from server so metrics (collections, tickets sold, etc.) recompute against the live data
    loadAllAdminData();
  };

  const handleSeatAllocationSuccess = (updatedBooking, allocatedSeatsList) => {
    // Update local bookings state immediately
    const nextBookingsList = bookings.map((b) => (b.id === updatedBooking.id ? updatedBooking : b));
    setBookings(nextBookingsList);

    // Find next unallocated paid booking
    const remainingUnallocated = nextBookingsList.filter(
      (b) => b.id !== updatedBooking.id && b.paymentStatus === 'PAID' && !(b.allocationStatus === 'ALLOCATED' && b.allocatedSeats)
    );

    if (remainingUnallocated.length > 0) {
      const nextPerson = remainingUnallocated[0];
      setActiveBooking(nextPerson);
      setShowSeatingChart(true);
      triggerToast(
        `✅ Seats (${allocatedSeatsList.join(', ')}) allocated to ${cleanName(updatedBooking.customerName)}! Now allocating for ${cleanName(nextPerson.customerName)} (${nextPerson.ticketQty} seats).`
      );
    } else {
      setActiveBooking(null);
      setShowSeatingChart(false);
      triggerToast(`🎉 Seats (${allocatedSeatsList.join(', ')}) allocated! All paid bookings are fully allocated.`);
    }

    loadAllAdminData();
  };

  // Filtering Logic
  const filteredBookings = bookings.filter((b) => {
    if (categoryFilter !== 'ALL' && b.buyerType !== categoryFilter) {
      return false;
    }
    if (paymentFilter !== 'ALL' && b.paymentStatus !== paymentFilter) {
      return false;
    }
    if (allocationFilter !== 'ALL') {
      const isAllocated = b.allocationStatus === 'ALLOCATED' && b.allocatedSeats;
      if (allocationFilter === 'ALLOCATED' && !isAllocated) return false;
      if (allocationFilter === 'NOT_ALLOCATED' && isAllocated) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = cleanName(b.customerName).toLowerCase().includes(q);
      const matchStudent = (b.studentName || '').toLowerCase().includes(q);
      const matchPhone = b.phone.includes(q);
      const matchEmail = (b.email || '').toLowerCase().includes(q);
      const matchId = b.bookingId.toLowerCase().includes(q);
      const matchSeats = (b.allocatedSeats || '').toLowerCase().includes(q);
      return matchName || matchStudent || matchPhone || matchEmail || matchId || matchSeats;
    }
    return true;
  });

  // Dynamic totals for filtered subset
  let filteredTickets = 0;
  let filteredCollections = 0;
  let filteredPaidBuyers = 0;

  filteredBookings.forEach((b) => {
    if (b.paymentStatus === 'PAID') {
      filteredTickets += b.ticketQty;
      filteredCollections += b.totalAmount;
      filteredPaidBuyers += 1;
    }
  });

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/export-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookings: filteredBookings,
          filters: { categoryFilter, paymentFilter, allocationFilter, searchQuery },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        triggerToast(`❌ Export failed: ${data.error || 'Server error.'}`);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Nritya_Bharathanjali_Bookings_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      triggerToast(`📥 Exported ${filteredBookings.length} record(s) matching the current view.`);
    } catch (e) {
      triggerToast('❌ Network error exporting to Excel.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="py-8 px-6 sm:px-10 max-w-[1600px] mx-auto min-h-screen">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-emerald-400 font-bold text-xs animate-bounce flex items-center gap-2">
          <span>🎉</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="ml-3 text-white font-bold">✕</button>
        </div>
      )}



      {loading ? (
        <div className="py-16 text-center text-ink-soft font-medium">
          ⏳ Syncing live database metrics & seat records...
        </div>
      ) : (
        <div className="space-y-6">
          {/* ================= FILTER BAR ================= */}
          <div className="card-gold-accent p-5 space-y-4 bg-white/80 shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Query Input */}
              <div className="lg:col-span-1">
                <label className="block text-xs font-bold uppercase text-bronze mb-1">
                  🔍 Search Customer / Seat ID / Phone:
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Name, Student, Phone, Seats..."
                  className="input-luxe text-xs py-2 w-full"
                />
              </div>

              {/* Seat Allocation Status Filter */}
              <div>
                <label className="block text-xs font-bold uppercase text-bronze mb-1">
                  🪑 Seat Allocation Status:
                </label>
                <select
                  value={allocationFilter}
                  onChange={(e) => setAllocationFilter(e.target.value)}
                  className="input-luxe text-xs py-2 w-full"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ALLOCATED">Seats Allocated ✅</option>
                  <option value="NOT_ALLOCATED">Seats Not Allocated 🔲</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-bold uppercase text-bronze mb-1">
                  🏷️ Attendee Category:
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input-luxe text-xs py-2 w-full"
                >
                  <option value="ALL">All Categories</option>
                  <option value="MSN">MSN</option>
                  <option value="EXTERNAL">External Attendee</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div>
                <label className="block text-xs font-bold uppercase text-bronze mb-1">
                  💳 Payment Status:
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="input-luxe text-xs py-2 w-full"
                >
                  <option value="ALL">All Payments</option>
                  <option value="PAID">Paid Only</option>
                  <option value="UTR_SUBMITTED">Awaiting Manual Verification</option>
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

          {/* ================= LEDGER TABLE ================= */}
          <div className="card-gold-accent p-6 space-y-4 bg-white/90 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-display text-2xl font-semibold text-[#6B1A2B]">
                  Live Customer Bookings Ledger ({filteredBookings.length} Records)
                </h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  💡 Click any row to view customer details and allocate seats on the interactive chart.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setAddError('');
                    setShowAddModal(true);
                  }}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border border-[#D4AF37] bg-[#6B1A2B] text-white hover:bg-[#8B2338] shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>➕</span>
                  <span>Add New Record</span>
                </button>
                <button
                  onClick={loadAllAdminData}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded border border-gold bg-cream hover:bg-sandal text-[#6B1A2B] shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  🔄 Refresh Data
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={exporting}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded border border-gold bg-[#6B1A2B] text-ivory hover:bg-maroon-soft shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {exporting ? '⏳ Exporting...' : `📥 Export ${filteredBookings.length} to Excel`}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#6B1A2B] text-ivory font-marcellus uppercase tracking-wider">
                    <th className="p-2.5 w-10 text-center">Seat</th>
                    <th className="p-2.5">Booking ID</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Customer Name & Student</th>
                    <th className="p-2.5">Phone / WhatsApp</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5 text-right">Tickets</th>
                    <th className="p-2.5 text-right">Amount (₹)</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Allocated Seats</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/30">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-ink-soft font-medium">
                        No booking records found matching selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const isAllocated = b.allocationStatus === 'ALLOCATED' && b.allocatedSeats;
                      return (
                        <tr
                          key={b.id}
                          onClick={() => handleRowClick(b)}
                          className="hover:bg-amber-50/70 cursor-pointer transition-colors"
                        >
                          {/* Green Tick / Checkbox indicator */}
                          <td className="p-2.5 text-center text-sm">
                            {isAllocated ? (
                              <span title="Seats Allocated ✅">✅</span>
                            ) : (
                              <span title="Seats Not Allocated 🔲" className="text-gray-400">🔲</span>
                            )}
                          </td>

                          <td className="p-2.5 font-mono font-bold text-[#6B1A2B]">{b.bookingId}</td>

                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.buyerType === 'MSN'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-900 border border-blue-300'
                            }`}>
                              {b.buyerType === 'MSN' ? 'MSN' : 'External'}
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

                          <td className="p-2.5 font-mono">{b.whatsapp || b.phone}</td>

                          <td className="p-2.5 text-ink-soft">{b.email}</td>

                          <td className="p-2.5 text-right font-num font-bold text-emerald-900">
                            {b.ticketQty} tickets
                          </td>

                          <td className="p-2.5 text-right font-num font-bold text-maroon">
                            ₹{b.totalAmount}
                          </td>

                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.paymentStatus === 'PAID'
                                ? 'bg-sandal text-maroon border border-gold/60'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {b.paymentStatus}
                            </span>
                          </td>

                          {/* Allocated Seat Tag */}
                          <td className="p-2.5">
                            {isAllocated ? (
                              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-950 border border-emerald-300 font-mono font-bold text-[11px] inline-block shadow-sm">
                                {b.allocatedSeats}
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-800 italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Pending Allocation
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Booking Card Drawer */}
      {activeBooking && !showSeatingChart && (
        <BookingDrawer
          booking={activeBooking}
          onClose={() => setActiveBooking(null)}
          onOpenSeatingChart={handleOpenSeatingChartFromDrawer}
          onDeleted={handleBookingDeleted}
        />
      )}

      {/* Interactive Seating Chart Modal */}
      {showSeatingChart && activeBooking && (
        <SeatingChartModal
          booking={activeBooking}
          onClose={() => setShowSeatingChart(false)}
          onConfirmSuccess={handleSeatAllocationSuccess}
        />
      )}

      {/* Add Person / Manual Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FAF6EF] border-2 border-[#D4AF37] rounded-xl shadow-2xl max-w-xl w-full p-6 text-[#2C1810] space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-[#D4AF37]/40 pb-3">
              <h3 className="font-serif-display text-xl font-bold text-[#6B1A2B] flex items-center gap-2">
                <span>➕</span>
                <span>Add New Person / Booking Record</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded bg-[#6B1A2B] text-white font-bold text-xs hover:bg-[#8B2338]"
              >
                ✕
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded bg-red-900 text-white text-xs font-bold">
                ⚠️ {addError}
              </div>
            )}

            <form onSubmit={handleAddPersonSubmit} className="space-y-4 text-xs">
              {/* Buyer Type Toggle */}
              <div className="space-y-1">
                <label className="block font-bold text-[#6B1A2B] uppercase">Student / Buyer Type</label>
                <div className="flex rounded border border-[#D4AF37] overflow-hidden bg-white p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setAddFormData({ ...addFormData, buyerType: 'MSN' })}
                    className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                      addFormData.buyerType === 'MSN' ? 'bg-[#6B1A2B] text-white' : 'text-[#6B1A2B] hover:bg-sandal'
                    }`}
                  >
                    MSN Student / Parent
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddFormData({ ...addFormData, buyerType: 'EXTERNAL' })}
                    className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                      addFormData.buyerType === 'EXTERNAL' ? 'bg-[#6B1A2B] text-white' : 'text-[#6B1A2B] hover:bg-sandal'
                    }`}
                  >
                    External Guest
                  </button>
                </div>
              </div>

              {/* Customer Name & Student Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#6B1A2B] uppercase mb-1">Customer / Parent Name *</label>
                  <input
                    type="text"
                    required
                    value={addFormData.customerName}
                    onChange={(e) => setAddFormData({ ...addFormData, customerName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full p-2.5 rounded border border-[#D4AF37]/60 bg-white text-ink font-medium focus:outline-none focus:border-[#6B1A2B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#6B1A2B] uppercase mb-1">Student Name {addFormData.buyerType === 'MSN' ? '*' : '(Optional)'}</label>
                  <input
                    type="text"
                    value={addFormData.studentName}
                    onChange={(e) => setAddFormData({ ...addFormData, studentName: e.target.value })}
                    placeholder="e.g. Aarav Kumar"
                    className="w-full p-2.5 rounded border border-[#D4AF37]/60 bg-white text-ink font-medium focus:outline-none focus:border-[#6B1A2B]"
                  />
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#6B1A2B] uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={addFormData.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAddFormData({
                        ...addFormData,
                        phone: val,
                        whatsapp: addFormData.isWhatsappSame ? val : addFormData.whatsapp,
                      });
                    }}
                    placeholder="e.g. 9876543210"
                    className="w-full p-2.5 rounded border border-[#D4AF37]/60 bg-white font-mono font-medium focus:outline-none focus:border-[#6B1A2B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#6B1A2B] uppercase mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={addFormData.whatsapp}
                    onChange={(e) => setAddFormData({ ...addFormData, whatsapp: e.target.value, isWhatsappSame: false })}
                    placeholder="e.g. 9876543210"
                    className="w-full p-2.5 rounded border border-[#D4AF37]/60 bg-white font-mono font-medium focus:outline-none focus:border-[#6B1A2B]"
                  />
                </div>
              </div>

              {/* Email & Team Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#6B1A2B] uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    placeholder="e.g. ramesh@example.com"
                    className="w-full p-2.5 rounded border border-[#D4AF37]/60 bg-white font-medium focus:outline-none focus:border-[#6B1A2B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#6B1A2B] uppercase mb-1">Team / Batch Code</label>
                  <input
                    type="text"
                    value={addFormData.teamCode}
                    onChange={(e) => setAddFormData({ ...addFormData, teamCode: e.target.value })}
                    placeholder="e.g. General / Team-A"
                    className="w-full p-2.5 rounded border border-[#D4AF37]/60 bg-white font-medium focus:outline-none focus:border-[#6B1A2B]"
                  />
                </div>
              </div>

              {/* Tickets, Amount & Payment Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#6B1A2B] uppercase mb-1">Ticket Qty *</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={addFormData.ticketQty}
                    onChange={(e) => {
                      const qty = Math.max(1, parseInt(e.target.value) || 1);
                      setAddFormData({ ...addFormData, ticketQty: qty, totalAmount: qty * 850 });
                    }}
                    className="w-full p-2.5 rounded border border-[#D4AF37]/60 bg-white font-mono font-bold focus:outline-none focus:border-[#6B1A2B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#6B1A2B] uppercase mb-1">Total Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={addFormData.totalAmount}
                    onChange={(e) => setAddFormData({ ...addFormData, totalAmount: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded border border-[#D4AF37]/60 bg-white font-mono font-bold text-maroon focus:outline-none focus:border-[#6B1A2B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#6B1A2B] uppercase mb-1">Payment Status</label>
                  <select
                    value={addFormData.paymentStatus}
                    onChange={(e) => setAddFormData({ ...addFormData, paymentStatus: e.target.value })}
                    className="w-full p-2.5 rounded border border-[#D4AF37]/60 bg-white font-bold focus:outline-none focus:border-[#6B1A2B]"
                  >
                    <option value="PAID">PAID (Verified)</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#D4AF37]/40 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold uppercase text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="px-6 py-2.5 rounded bg-[#6B1A2B] hover:bg-[#8B2338] text-white font-bold uppercase text-xs tracking-wider shadow-md border border-[#D4AF37] cursor-pointer"
                >
                  {addSubmitting ? 'Adding Customer...' : 'Confirm & Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
