'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SEATING_ZONES, AUDITORIUM_CONFIG, DISPLAY_ROWS, getSectionForSeat, getSeatZoneAndStatus } from '../../../lib/seatingConfig';

export default function AdminSeatAllocationPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [seatsMaster, setSeatsMaster] = useState({});

  // Active Selected Booking for the Right Panel
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Selected seat IDs for current booking (e.g. ["F6", "F7"])
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  // Filter & Search states
  const [filterMode, setFilterMode] = useState('UNALLOCATED'); // 'ALL' | 'UNALLOCATED' | 'ALLOCATED'
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [seatSearchTerm, setSeatSearchTerm] = useState('');

  // UI status feedback
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [lastAllocatedInfo, setLastAllocatedInfo] = useState(null);

  useEffect(() => {
    loadData();
    // Real-time polling every 6 seconds to keep seats and bookings fully synced across admins
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [resB, resS] = await Promise.all([
        fetch('/api/admin/bookings'),
        fetch('/api/admin/seats'),
      ]);

      if (resB.status === 401) {
        router.push('/admin/login');
        return;
      }

      const dataB = await resB.json();
      const dataS = await resS.json();

      if (dataB.success) setBookings(dataB.bookings);
      if (dataS.success && dataS.seats) {
        const map = {};
        dataS.seats.forEach((s) => {
          map[s.seatId] = s;
        });
        setSeatsMaster(map);
      }
    } catch (e) {
      console.error('Error syncing seat allocation data:', e);
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 6000);
  };

  const cleanName = (name) => {
    if (!name) return '';
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  };

  // Handle selecting a booking row from the bottom panel
  const handleSelectBookingRow = (booking) => {
    setSelectedBooking(booking);
    setSelectedSeatIds([]);
    setErrorMsg('');
  };

  // Handle clicking a seat pill on the interactive chart
  const handleSeatClick = (seatId, seatState) => {
    if (!selectedBooking) {
      setErrorMsg('Please select a booking first from the bottom panel.');
      return;
    }

    if (seatState.status === 'VIP') {
      setErrorMsg(`Seat ${seatId} is reserved for VIP/Parents and cannot be allocated.`);
      return;
    }

    const maxAllowed = selectedBooking.ticketQty;

    // Toggle seat selection
    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seatId));
      setErrorMsg('');
    } else {
      if (selectedSeatIds.length >= maxAllowed) {
        setErrorMsg(`Selected max ${maxAllowed} seats for this booking. Deselect one first to change.`);
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seatId]);
      setErrorMsg('');
    }
  };

  // Submit Seat Allocation for Selected Booking
  const handleAllocateSeatsSubmit = async () => {
    if (!selectedBooking) return;

    if (selectedSeatIds.length !== selectedBooking.ticketQty) {
      setErrorMsg(`Required seat count mismatch. Selected ${selectedSeatIds.length} out of ${selectedBooking.ticketQty} required seats.`);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/allocate-seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          seatIds: selectedSeatIds,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Find next unallocated booking in list
        const remainingUnallocated = bookings.filter(
          (b) => b.id !== selectedBooking.id && b.paymentStatus === 'PAID' && !(b.allocationStatus === 'ALLOCATED' && b.allocatedSeats)
        );
        const nextUp = remainingUnallocated.length > 0 ? remainingUnallocated[0] : null;

        setLastAllocatedInfo({
          customerName: cleanName(selectedBooking.customerName),
          bookingId: selectedBooking.bookingId,
          allocatedSeats: selectedSeatIds.join(', '),
          nextBooking: nextUp,
        });

        triggerToast(
          `✅ Seats (${selectedSeatIds.join(', ')}) allocated to ${cleanName(selectedBooking.customerName)}!`
        );

        setSelectedBooking(null);
        setSelectedSeatIds([]);
        loadData();
      } else {
        setErrorMsg(data.error || 'Seat allocation failed.');
      }
    } catch (e) {
      setErrorMsg('Network error saving seat allocation.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter Bookings for Bottom Panel
  const filteredBookings = bookings.filter((b) => {
    // Only PAID bookings are eligible for seat allocation
    if (b.paymentStatus !== 'PAID') return false;

    const isAllocated = b.allocationStatus === 'ALLOCATED' && b.allocatedSeats;

    if (filterMode === 'UNALLOCATED' && isAllocated) return false;
    if (filterMode === 'ALLOCATED' && !isAllocated) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = cleanName(b.customerName).toLowerCase().includes(q);
      const matchStudent = (b.studentName || '').toLowerCase().includes(q);
      const matchPhone = b.phone.includes(q);
      const matchId = b.bookingId.toLowerCase().includes(q);
      const matchTeam = (b.teamCode || 'General').toLowerCase().includes(q);
      const matchSeats = (b.allocatedSeats || '').toLowerCase().includes(q);
      return matchName || matchStudent || matchPhone || matchId || matchTeam || matchSeats;
    }

    return true;
  });

  // Determine seat visual colors (🟢 Green, 🟣 Purple, 🔴 Red, ⭐ Gold)
  const getSeatState = (seatId, defaultZone, defaultStatus) => {
    const isSelectedCurrentSession = selectedSeatIds.includes(seatId);
    if (isSelectedCurrentSession) {
      return {
        color: '#6A0DAD', // 🟣 Purple
        label: 'Selected',
        selectable: true,
        isVip: false,
      };
    }

    const dbSeat = seatsMaster[seatId];
    const status = dbSeat ? dbSeat.status : defaultStatus;
    const allocatedBooking = dbSeat ? dbSeat.allocatedToBookingId : null;

    if (status === 'LOCKED') {
      return {
        color: '#D4AF37', // ⭐ Gold for VIP
        label: 'VIP',
        selectable: false,
        isVip: true,
      };
    }

    if (status === 'ALLOCATED') {
      if (selectedBooking && allocatedBooking === selectedBooking.id) {
        return {
          color: '#6A0DAD', // 🟣 Purple
          label: 'Selected',
          selectable: true,
          isVip: false,
        };
      }
      return {
        color: '#DC2626', // 🔴 Red for Allocated
        label: 'Allocated',
        selectable: false,
        isVip: false,
      };
    }

    return {
      color: '#16A34A', // 🟢 Green for Available
      label: 'Available',
      selectable: true,
      isVip: false,
    };
  };

  return (
    <div className="py-6 px-4 sm:px-8 max-w-[1650px] mx-auto min-h-screen space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-emerald-400 font-bold text-xs animate-bounce flex items-center gap-2">
          <span>🎉</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="ml-3 text-white font-bold">✕</button>
        </div>
      )}

      {/* Top Action Toolbar */}
      <div className="flex justify-end items-center pb-2 border-b border-[#D4AF37]/30">
        <button
          onClick={loadData}
          className="px-4 py-2 text-xs font-bold uppercase rounded border border-gold bg-cream hover:bg-sandal text-[#6B1A2B] shadow-sm flex items-center gap-1.5 transition-colors"
        >
          🔄 Refresh Seats & Ledger
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-[#6B1A2B] font-medium text-sm">
          ⏳ Synchronising live auditorium blueprint and bookings database...
        </div>
      ) : (
        <div className="space-y-6">
          {/* ================= MIDDLE GRID: SEATING CHART (CENTER) + BOOKING DETAILS (RIGHT) ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ---------------- CENTER PANEL: INTERACTIVE SEATING CHART (LG:COL-8) ---------------- */}
            <div className="lg:col-span-8 card-gold-accent p-4 bg-[#FAF6EF] text-[#250912] shadow-xl flex flex-col justify-between border-2 border-[#D4AF37]">
              {/* Seating Chart Top Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D4AF37]/30 text-xs">
                <div className="font-bold text-[#6B1A2B] tracking-wider uppercase text-[11px] flex items-center gap-2">
                  <span>AUDITORIUM BLUEPRINT SEATING CHART</span>
                  {selectedBooking && (
                    <span className="px-2 py-0.5 rounded bg-[#6B1A2B] text-white text-[10px] font-mono">
                      Target: {selectedBooking.bookingId} ({selectedBooking.ticketQty} Seats Req.)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-[#6B1A2B] p-1 rounded border border-[#D4AF37]/40">
                    <button
                      onClick={() => setZoomLevel(Math.max(0.3, zoomLevel - 0.1))}
                      className="w-6 h-6 rounded bg-[#250912] text-white text-xs font-bold flex items-center justify-center border border-[#D4AF37]/40 hover:bg-[#6B1A2B]"
                      title="Zoom Out"
                    >
                      -
                    </button>
                    <span className="text-[10px] font-mono px-1.5 text-white font-bold">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
                      className="w-6 h-6 rounded bg-[#250912] text-white text-xs font-bold flex items-center justify-center border border-[#D4AF37]/40 hover:bg-[#6B1A2B]"
                      title="Zoom In"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Error / Alert banner inside chart */}
              {errorMsg && (
                <div className="mt-2 p-2 rounded bg-red-900/90 border border-red-500 text-white text-xs font-bold text-center flex justify-between items-center">
                  <span>⚠️ {errorMsg}</span>
                  <button onClick={() => setErrorMsg('')} className="text-white font-bold">✕</button>
                </div>
              )}

              {/* Seating Grid Canvas */}
              <div className="overflow-auto py-6 px-6 sm:px-10 flex-grow min-h-[420px] max-h-[580px] scrollbar-thin">
                <div
                  className="transition-transform duration-150 origin-top space-y-2 w-[1028px] sm:w-[1212px] mx-auto flex flex-col items-center"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  {/* Section Headers Aligned Directly Centered Above Columns */}
                  <div className="w-full flex items-center justify-center text-center text-xs font-extrabold text-[#6B1A2B] uppercase tracking-wider sticky top-0 bg-[#FAF6EF]/95 py-2 z-10 mb-2 border-b border-[#D4AF37]/30">
                    <div className="w-[300px] sm:w-[340px] text-center">C-Side (Left)</div>
                    <div className="w-16 sm:w-24 shrink-0" />
                    <div className="w-[300px] sm:w-[340px] text-center">M-Side (Middle)</div>
                    <div className="w-16 sm:w-24 shrink-0" />
                    <div className="w-[300px] sm:w-[340px] text-center">R-Side (Right)</div>
                  </div>

                  {/* Auditorium Rows: TOP (Row R) to BOTTOM (Row A) */}
                  {DISPLAY_ROWS.map((rowObj) => {
                    const rowLetter = rowObj.row;

                    const renderSeatPill = (seatId, num) => {
                      const { zone, status } = getSeatZoneAndStatus(rowLetter, num);
                      const stateObj = getSeatState(seatId, zone, status);
                      const isMatch = seatSearchTerm && seatId === seatSearchTerm;

                      return (
                        <button
                          key={seatId}
                          onClick={() => handleSeatClick(seatId, { status: stateObj.label, allocatedToBookingId: seatsMaster[seatId]?.allocatedToBookingId })}
                          disabled={!stateObj.selectable}
                          title={`Seat ${seatId} (${getSectionForSeat(rowLetter, num)}) | State: ${stateObj.label}`}
                          className={`relative w-5 h-5 sm:w-6 sm:h-6 rounded text-[8px] sm:text-[9px] font-mono font-bold flex items-center justify-center shrink-0 transition-all ${
                            isMatch ? 'ring-2 ring-yellow-400 scale-125 z-20' : ''
                          } ${
                            stateObj.selectable
                              ? 'hover:scale-110 cursor-pointer shadow-sm'
                              : 'cursor-not-allowed opacity-80'
                          }`}
                          style={{
                            backgroundColor: stateObj.color,
                            color: '#FFFFFF',
                            border: isMatch ? '2px solid #FACC15' : '1px solid rgba(255,255,255,0.2)',
                          }}
                        >
                          <span>{seatId}</span>
                          {selectedSeatIds.includes(seatId) && (
                            <span className="absolute -top-1 -right-1 bg-white text-purple-950 rounded-full w-3 h-3 text-[7px] flex items-center justify-center font-black">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    };

                    const cSideSeats = [];
                    for (let n = rowObj.cSide[0]; n <= rowObj.cSide[1]; n++) {
                      cSideSeats.push(renderSeatPill(`${rowLetter}${n}`, n));
                    }

                    const mSideSeats = [];
                    for (let n = rowObj.mSide[0]; n <= rowObj.mSide[1]; n++) {
                      mSideSeats.push(renderSeatPill(`${rowLetter}${n}`, n));
                    }

                    const rSideSeats = [];
                    for (let n = rowObj.rSide[0]; n <= rowObj.rSide[1]; n++) {
                      rSideSeats.push(renderSeatPill(`${rowLetter}${n}`, n));
                    }

                    return (
                      <div key={rowLetter} className="w-full flex flex-nowrap items-center justify-center bg-transparent py-0.5">
                        {/* C-Side (Right aligned so inner edge ends at exact same vertical line) */}
                        <div className="w-[300px] sm:w-[340px] flex flex-nowrap gap-0.5 sm:gap-1 items-center justify-end">{cSideSeats}</div>
                        {/* Clean Straight Vertical Aisle Gap (+2 blocks wider) */}
                        <div className="w-16 sm:w-24 shrink-0" />
                        {/* M-Side (Centered in fixed width column) */}
                        <div className="w-[300px] sm:w-[340px] flex flex-nowrap gap-0.5 sm:gap-1 items-center justify-center">{mSideSeats}</div>
                        {/* Clean Straight Vertical Aisle Gap (+2 blocks wider) */}
                        <div className="w-16 sm:w-24 shrink-0" />
                        {/* R-Side (Left aligned so inner edge starts at exact same vertical line) */}
                        <div className="w-[300px] sm:w-[340px] flex flex-nowrap gap-0.5 sm:gap-1 items-center justify-start">{rSideSeats}</div>
                      </div>
                    );
                  })}

                  {/* STAGE BAR: EXACTLY 100% OF THE 3 COLUMNS COMBINED */}
                  <div className="pt-8 pb-4 w-full">
                    <div className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-[#6B1A2B] via-[#8B263E] to-[#6B1A2B] text-white text-xs sm:text-sm font-bold uppercase tracking-widest border-2 border-[#D4AF37] shadow-md text-center">
                      🎭 STAGE (FRONT OF AUDITORIUM)
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Legend Bar */}
              <div className="pt-3 border-t border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-3 text-xs bg-white/95 p-2.5 rounded text-black font-semibold shadow-sm">
                <span className="font-bold text-black uppercase text-[11px]">Seat States Legend:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-[#16A34A] border border-black/20" />
                  <span className="text-black font-bold">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-[#6A0DAD] border border-black/20" />
                  <span className="text-black font-bold">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-[#DC2626] border border-black/20" />
                  <span className="text-black font-bold">Allocated</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-[#D4AF37] border border-black/20" />
                  <span className="text-black font-bold">VIP</span>
                </div>
              </div>
            </div>

            {/* ---------------- RIGHT PANEL: BOOKING DETAILS PANEL (LG:COL-4) ---------------- */}
            <div className="lg:col-span-4 card-gold-accent p-5 bg-[#FDFBF7] shadow-xl flex flex-col justify-between border-2 border-gold space-y-4">
              <div className="space-y-4">
                <div className="border-b border-gold/40 pb-3 flex justify-between items-center">
                  <h3 className="font-serif-display text-xl font-bold text-[#6B1A2B]">
                    Booking Details
                  </h3>
                  {selectedBooking && (
                    <button
                      onClick={() => {
                        setSelectedBooking(null);
                        setSelectedSeatIds([]);
                      }}
                      className="text-[10px] font-bold text-gray-500 hover:text-maroon underline"
                    >
                      Clear Selection ✕
                    </button>
                  )}
                </div>

                {selectedBooking ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-cream border border-gold/40 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-ink-soft uppercase text-[10px] font-bold">NAME</span>
                        <strong className="text-ink text-sm font-semibold">{cleanName(selectedBooking.customerName)}</strong>
                      </div>

                      {selectedBooking.studentName && (
                        <div className="flex justify-between pt-1 border-t border-gold/20">
                          <span className="text-ink-soft uppercase text-[10px] font-bold">STUDENT NAME</span>
                          <strong className="text-[#6B1A2B] font-bold">{selectedBooking.studentName}</strong>
                        </div>
                      )}

                      <div className="flex justify-between pt-1 border-t border-gold/20">
                        <span className="text-ink-soft uppercase text-[10px] font-bold">BOOKING ID</span>
                        <strong className="font-mono text-[#6B1A2B] font-extrabold text-sm">{selectedBooking.bookingId}</strong>
                      </div>

                      <div className="flex justify-between pt-1 border-t border-gold/20">
                        <span className="text-ink-soft uppercase text-[10px] font-bold">PHONE</span>
                        <span className="font-mono text-ink font-semibold">{selectedBooking.whatsapp || selectedBooking.phone}</span>
                      </div>

                      <div className="flex justify-between pt-1 border-t border-gold/20">
                        <span className="text-ink-soft uppercase text-[10px] font-bold">EMAIL</span>
                        <span className="font-mono text-ink text-[11px] truncate">{selectedBooking.email}</span>
                      </div>

                      <div className="flex justify-between pt-1 border-t border-gold/20">
                        <span className="text-ink-soft uppercase text-[10px] font-bold">NO. OF SEATS</span>
                        <strong className="text-emerald-900 font-num text-sm font-bold">{selectedBooking.ticketQty}</strong>
                      </div>

                      <div className="flex justify-between pt-1 border-t border-gold/20">
                        <span className="text-ink-soft uppercase text-[10px] font-bold">TYPE</span>
                        <span className="font-bold text-maroon">
                          {selectedBooking.buyerType === 'MSN' ? 'MSN' : 'External'}
                        </span>
                      </div>

                      <div className="flex justify-between pt-1 border-t border-gold/20">
                        <span className="text-ink-soft uppercase text-[10px] font-bold">TEAM / CODE</span>
                        <span className="px-2 py-0.5 rounded bg-sandal text-[#6B1A2B] font-mono font-bold text-[10px] border border-gold/50">
                          {selectedBooking.teamCode || 'General'}
                        </span>
                      </div>
                    </div>

                    {/* Live Selected Seats Display */}
                    <div className="p-4 rounded-lg bg-purple-50 border-2 border-purple-300 text-purple-950 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-purple-800 block">
                        SELECTED SEATS ({selectedSeatIds.length} / {selectedBooking.ticketQty})
                      </span>
                      <strong className="font-mono text-lg font-black text-purple-900 block">
                        {selectedSeatIds.length > 0 ? selectedSeatIds.join(', ') : 'None Selected'}
                      </strong>
                      <span className="text-[10px] text-purple-700 block">
                        Click available 🟢 green seats on the chart to select.
                      </span>
                    </div>
                  </div>
                ) : lastAllocatedInfo ? (
                  <div className="p-4 rounded-lg bg-emerald-50 border-2 border-emerald-400 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                        <span>✅</span> ALLOCATION COMPLETE
                      </span>
                      <span className="font-mono text-xs font-extrabold text-emerald-950">
                        {lastAllocatedInfo.bookingId}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-emerald-900">
                      <p>Customer: <strong className="font-semibold text-emerald-950">{lastAllocatedInfo.customerName}</strong></p>
                      <p>Allocated Seats: <strong className="font-mono font-black text-emerald-950">{lastAllocatedInfo.allocatedSeats}</strong></p>
                    </div>

                    {lastAllocatedInfo.nextBooking ? (
                      <div className="pt-3 border-t border-emerald-300 space-y-2">
                        <span className="text-[10px] font-bold text-emerald-900 uppercase block tracking-wider">
                          👉 ALLOCATE NEXT PERSON NOW:
                        </span>
                        <div className="p-2.5 rounded bg-white border border-emerald-300 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-maroon">
                            <span>{cleanName(lastAllocatedInfo.nextBooking.customerName)}</span>
                            <span className="font-mono">{lastAllocatedInfo.nextBooking.bookingId}</span>
                          </div>
                          <div className="text-[11px] text-ink-soft flex justify-between">
                            <span>Requires: {lastAllocatedInfo.nextBooking.ticketQty} Seats</span>
                            <span className="font-mono">{lastAllocatedInfo.nextBooking.phone}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedBooking(lastAllocatedInfo.nextBooking);
                            setSelectedSeatIds([]);
                          }}
                          className="w-full py-3 px-4 rounded-lg bg-[#6B1A2B] hover:bg-[#8B2338] text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 border-2 border-[#D4AF37] cursor-pointer transition-all hover:scale-[1.02]"
                        >
                          <span>GO TO NEXT PERSON ({cleanName(lastAllocatedInfo.nextBooking.customerName)})</span>
                          <span>&rarr;</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 text-xs font-bold text-emerald-900 text-center">
                        🎉 All paid bookings are fully allocated!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-ink-soft space-y-3">
                    <div className="text-3xl">👈</div>
                    <p className="text-xs font-semibold text-maroon">No Booking Selected</p>
                    <p className="text-[11px]">
                      Click <strong>"Select"</strong> on any booking in the unallocated list below to begin allocation.
                    </p>
                    {filteredBookings.filter((b) => b.allocationStatus !== 'ALLOCATED' || !b.allocatedSeats).length > 0 && (
                      <button
                        onClick={() => {
                          const nextFirst = filteredBookings.find((b) => b.allocationStatus !== 'ALLOCATED' || !b.allocatedSeats);
                          if (nextFirst) {
                            setSelectedBooking(nextFirst);
                            setSelectedSeatIds([]);
                          }
                        }}
                        className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#6B1A2B] hover:bg-[#8B2338] text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2 border border-gold cursor-pointer transition-all"
                      >
                        <span>⚡ ALLOCATE FIRST UNALLOCATED PERSON</span>
                        <span>&rarr;</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={handleAllocateSeatsSubmit}
                  disabled={
                    !selectedBooking ||
                    selectedSeatIds.length !== selectedBooking.ticketQty ||
                    submitting
                  }
                  className={`w-full py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 border-2 ${
                    selectedBooking && selectedSeatIds.length === selectedBooking.ticketQty
                      ? 'bg-[#6B1A2B] hover:bg-[#8B2338] text-[#FAF6EF] border-[#D4AF37] cursor-pointer'
                      : 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>✅</span>
                  <span>{submitting ? 'ALLOCATING...' : 'ALLOCATE SEATS'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= BOTTOM PANEL: UNALLOCATED BOOKINGS LIST ================= */}
          <div className="card-gold-accent p-6 bg-white/90 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gold/30 pb-4">
              <div>
                <h3 className="font-serif-display text-xl font-bold text-[#6B1A2B]">
                  Unallocated Bookings Ledger ({filteredBookings.length} Records)
                </h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  Bookings automatically disappear from the unallocated view upon successful seat confirmation.
                </p>
              </div>

              {/* Filter Toggles & Search Bar */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Filter Mode Buttons */}
                <div className="flex rounded border border-gold bg-cream overflow-hidden">
                  <button
                    onClick={() => setFilterMode('UNALLOCATED')}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                      filterMode === 'UNALLOCATED'
                        ? 'bg-[#6B1A2B] text-white'
                        : 'text-[#6B1A2B] hover:bg-sandal'
                    }`}
                  >
                    Unallocated
                  </button>
                  <button
                    onClick={() => setFilterMode('ALLOCATED')}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                      filterMode === 'ALLOCATED'
                        ? 'bg-[#6B1A2B] text-white'
                        : 'text-[#6B1A2B] hover:bg-sandal'
                    }`}
                  >
                    Allocated
                  </button>
                  <button
                    onClick={() => setFilterMode('ALL')}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                      filterMode === 'ALL'
                        ? 'bg-[#6B1A2B] text-white'
                        : 'text-[#6B1A2B] hover:bg-sandal'
                    }`}
                  >
                    All Bookings
                  </button>
                </div>

                {/* Search Bar */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Name, ID, Team, Phone..."
                  className="input-luxe text-xs py-1.5 px-3 w-56"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#6B1A2B] text-ivory font-marcellus uppercase tracking-wider">
                    <th className="p-2.5 w-10 text-center">Status</th>
                    <th className="p-2.5">Booking ID</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Team / Code</th>
                    <th className="p-2.5 text-center">No. of Seats</th>
                    <th className="p-2.5">Allocated Seats</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/30">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-ink-soft font-medium">
                        No bookings found matching selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const isAllocated = b.allocationStatus === 'ALLOCATED' && b.allocatedSeats;
                      const isTargeting = selectedBooking && selectedBooking.id === b.id;

                      return (
                        <tr
                          key={b.id}
                          className={`transition-colors ${
                            isTargeting ? 'bg-amber-100/90 font-semibold' : 'hover:bg-amber-50/70'
                          }`}
                        >
                          <td className="p-2.5 text-center text-sm">
                            {isAllocated ? '✅' : '☐'}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-[#6B1A2B]">{b.bookingId}</td>
                          <td className="p-2.5">
                            <div className="font-semibold text-ink">{cleanName(b.customerName)}</div>
                            {b.studentName && (
                              <div className="text-[10px] text-bronze font-bold">Student: {b.studentName}</div>
                            )}
                          </td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.buyerType === 'MSN' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                            }`}>
                              {b.buyerType === 'MSN' ? 'MSN' : 'External'}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-[11px] font-bold text-[#6B1A2B]">
                            {b.teamCode || 'General'}
                          </td>
                          <td className="p-2.5 text-center font-num font-bold text-emerald-900">
                            {b.ticketQty}
                          </td>
                          <td className="p-2.5 font-mono text-[11px]">
                            {isAllocated ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 font-bold border border-emerald-300">
                                {b.allocatedSeats}
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-800 italic">Unallocated</span>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => handleSelectBookingRow(b)}
                              className={`px-3 py-1 text-[11px] font-bold uppercase rounded transition-colors shadow-sm ${
                                isTargeting
                                  ? 'bg-purple-800 text-white'
                                  : 'bg-[#6B1A2B] hover:bg-[#8B2338] text-white'
                              }`}
                            >
                              {isTargeting ? 'Selected ➜' : 'Select'}
                            </button>
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
    </div>
  );
}
