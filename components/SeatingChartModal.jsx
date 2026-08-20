'use client';

import React, { useState, useEffect } from 'react';
import { SEATING_ZONES, AUDITORIUM_CONFIG, DISPLAY_ROWS, getSectionForSeat, getSeatZoneAndStatus } from '../lib/seatingConfig';

export default function SeatingChartModal({ booking, onClose, onConfirmSuccess }) {
  if (!booking) return null;

  const requiredCount = booking.ticketQty;

  // Master seats state fetched from database
  const [allSeatsMap, setAllSeatsMap] = useState({});
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Admin selection state (array of seatIds e.g. ["G15", "G16", "G17"])
  const [selectedSeats, setSelectedSeats] = useState([]);

  // UI Controls: Zoom & Search
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSeatsMaster();
    if (booking.allocatedSeats) {
      const existing = booking.allocatedSeats.split(',').map((s) => s.trim()).filter(Boolean);
      setSelectedSeats(existing);
    }
  }, [booking]);

  const fetchSeatsMaster = async () => {
    setLoadingSeats(true);
    try {
      const res = await fetch('/api/admin/seats');
      const data = await res.json();
      if (data.success && data.seats) {
        const map = {};
        data.seats.forEach((s) => {
          map[s.seatId] = s;
        });
        setAllSeatsMap(map);
      }
    } catch (e) {
      console.error('Error loading seats:', e);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleSeatClick = (seatId, seatData) => {
    if (seatData.status === 'LOCKED') return;
    if (seatData.status === 'ALLOCATED' && seatData.allocatedToBookingId !== booking.id) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
      setErrorMsg('');
    } else {
      if (selectedSeats.length >= requiredCount) {
        setErrorMsg(`Cannot select more than ${requiredCount} seats for this booking (${booking.ticketQty} tickets).`);
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
      setErrorMsg('');
    }
  };

  const handleResetSelection = () => {
    setSelectedSeats([]);
    setErrorMsg('');
  };

  const handleConfirmAllocation = async () => {
    if (selectedSeats.length !== requiredCount) {
      setErrorMsg(`Please select exactly ${requiredCount} seats before confirming.`);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/allocate-seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          seatIds: selectedSeats,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (onConfirmSuccess) {
          onConfirmSuccess(data.booking, data.allocatedSeats);
        }
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to allocate seats.');
      }
    } catch (e) {
      setErrorMsg('Network error saving seat allocation.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeatColorAndState = (seatId, defaultZone, defaultStatus) => {
    const dbSeat = allSeatsMap[seatId];
    const isCurrentlySelected = selectedSeats.includes(seatId);

    if (isCurrentlySelected) {
      return {
        bgColor: '#6A0DAD', // Purple for selected
        textColor: '#FFFFFF',
        statusText: 'SELECTED',
        selectable: true,
      };
    }

    const currentStatus = dbSeat ? dbSeat.status : defaultStatus;
    const allocatedBooking = dbSeat ? dbSeat.allocatedToBookingId : null;

    if (currentStatus === 'LOCKED') {
      return {
        bgColor: '#1565C0', // Locked VIP Blue
        textColor: '#FFFFFF',
        statusText: 'LOCKED VIP',
        selectable: false,
      };
    }

    if (currentStatus === 'ALLOCATED') {
      if (allocatedBooking === booking.id) {
        return {
          bgColor: '#6A0DAD',
          textColor: '#FFFFFF',
          statusText: 'CURRENTLY ALLOCATED',
          selectable: true,
        };
      }
      return {
        bgColor: '#9E9E9E', // Grey for allocated
        textColor: '#FFFFFF',
        statusText: 'ALLOCATED TO ANOTHER BOOKING',
        selectable: false,
      };
    }

    const zoneObj = Object.values(SEATING_ZONES).find((z) => z.name === defaultZone) || SEATING_ZONES.PARENTS;
    return {
      bgColor: zoneObj.color,
      textColor: zoneObj.color === '#D1D5DB' || zoneObj.color === '#D4AF37' || zoneObj.color === '#FA8072' || zoneObj.color === '#00CED1' || zoneObj.color === '#3CB371' ? '#111827' : '#FFFFFF',
      statusText: 'AVAILABLE',
      selectable: true,
    };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-[#14060A] text-[#FAF6EF] animate-fadeIn">
      {/* ================= MODAL HEADER CONTROL BAR (MAROON & GOLD WEBSITE THEME) ================= */}
      <div className="p-4 bg-[#6B1A2B] border-b-2 border-[#D4AF37] flex flex-wrap items-center justify-between gap-4 shadow-xl z-20">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block">
              M.S. NATYAKSHETRA — AUDITORIUM SEATING CHART
            </span>
            <h2 className="font-serif-display text-xl font-bold text-[#FAF6EF] flex items-center gap-2">
              <span>Booking: {booking.bookingId}</span>
              <span className="text-sm font-normal text-[#FAF6EF]/80">
                ({booking.customerName} • {booking.ticketQty} {booking.ticketQty === 1 ? 'Ticket' : 'Tickets'})
              </span>
            </h2>
          </div>
        </div>

        {/* Counter & Status Display */}
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg border-2 flex items-center gap-3 ${
            selectedSeats.length === requiredCount
              ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
              : 'bg-[#34121B] border-[#D4AF37] text-[#FAF6EF]'
          }`}>
            <span className="text-xl">🎟️</span>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] block">SELECTION COUNTER</span>
              <span className="font-mono text-lg font-black tracking-wider">
                Selected: <strong className="text-white">{selectedSeats.length}</strong> / Required: <strong className="text-white">{requiredCount}</strong>
              </span>
            </div>
          </div>

          {/* Controls: Zoom & Search */}
          <div className="flex items-center gap-2 bg-[#250912] p-1.5 rounded-lg border border-[#D4AF37]/40">
            <div className="flex items-center gap-1 border-r border-[#D4AF37]/30 pr-2">
              <button
                onClick={() => setZoomLevel(Math.max(0.3, zoomLevel - 0.1))}
                className="w-8 h-8 rounded bg-[#6B1A2B] hover:bg-[#8B2338] text-white text-xs font-bold flex items-center justify-center border border-[#D4AF37]/40"
                title="Zoom Out"
              >
                🔍-
              </button>
              <span className="text-xs font-mono px-1.5 text-[#D4AF37] font-bold">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
                className="w-8 h-8 rounded bg-[#6B1A2B] hover:bg-[#8B2338] text-white text-xs font-bold flex items-center justify-center border border-[#D4AF37]/40"
                title="Zoom In"
              >
                🔍+
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="px-2 py-1 text-[10px] font-bold rounded bg-[#6B1A2B] hover:bg-[#8B2338] text-white border border-[#D4AF37]/40"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Reset Selection Button */}
          <button
            onClick={handleResetSelection}
            className="px-3 py-2 text-xs font-bold uppercase rounded bg-[#34121B] hover:bg-[#4E1C2A] text-[#FAF6EF] border border-[#D4AF37]/50 transition-colors"
          >
            🔄 Reset
          </button>

          {/* Action CTAs */}
          <button
            onClick={handleConfirmAllocation}
            disabled={selectedSeats.length !== requiredCount || submitting}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 border-2 ${
              selectedSeats.length === requiredCount && !submitting
                ? 'bg-[#6B1A2B] hover:bg-[#8A2338] text-white border-[#D4AF37] cursor-pointer'
                : 'bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed opacity-60'
            }`}
          >
            <span>💾 ALLOCATE {selectedSeats.length} SEATS</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-900 hover:bg-red-800 text-white border border-red-600 transition-colors"
          >
            ✕ CANCEL
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-red-800 text-white px-6 py-2.5 text-xs font-bold text-center border-b border-red-500 flex justify-between items-center z-30 shadow-md">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-white font-bold">✕</button>
        </div>
      )}

      {/* ================= MAIN SEATING CHART DISPLAY CANVAS ================= */}
      <div className="flex-grow overflow-auto p-6 flex flex-col items-center justify-start relative scrollbar-thin">
        {loadingSeats ? (
          <div className="py-24 text-center text-[#D4AF37] text-sm font-medium">
            ⏳ Syncing real-time auditorium seating database...
          </div>
        ) : (
          <div
            className="transition-transform duration-200 ease-out origin-top space-y-8 w-[1088px] sm:w-[1244px] mx-auto flex flex-col items-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Section Headers Bar Aligned Directly Above Straight Aisles */}
            <div className="w-full flex items-center justify-center text-center text-xs font-bold text-[#D4AF37] uppercase tracking-wider sticky top-0 bg-[#14060A]/95 py-2 z-10 border-b border-[#D4AF37]/30">
              <div className="w-[320px] sm:w-[360px] text-center p-1.5 rounded bg-[#34121B] border border-[#D4AF37]/40">
                ⬅️ C-SIDE (LEFT SECTION • SEATS 1 - 11)
              </div>
              <div className="w-16 sm:w-24 shrink-0" />
              <div className="w-[320px] sm:w-[360px] text-center p-1.5 rounded bg-[#34121B] border border-[#D4AF37]/40">
                ⏺️ M-SIDE (MIDDLE SECTION • SEATS 12 - 20)
              </div>
              <div className="w-16 sm:w-24 shrink-0" />
              <div className="w-[320px] sm:w-[360px] text-center p-1.5 rounded bg-[#34121B] border border-[#D4AF37]/40">
                ➡️ R-SIDE (RIGHT SECTION • SEATS 21 - 38)
              </div>
            </div>

            {/* AUDITORIUM ROWS: TOP (Row R) to BOTTOM (Row A) */}
            <div className="w-full space-y-2">
              {DISPLAY_ROWS.map((rowObj) => {
                const rowLetter = rowObj.row;

                const renderSeatPill = (seatId, num) => {
                  const { zone, status } = getSeatZoneAndStatus(rowLetter, num);
                  const stateObj = getSeatColorAndState(seatId, zone, status);
                  const isSearchMatch = searchTerm && seatId === searchTerm;

                  return (
                    <button
                      key={seatId}
                      onClick={() => handleSeatClick(seatId, { status: stateObj.statusText, allocatedToBookingId: allSeatsMap[seatId]?.allocatedToBookingId })}
                      disabled={!stateObj.selectable}
                      title={`Seat ${seatId} (${getSectionForSeat(rowLetter, num)}) | State: ${stateObj.statusText}`}
                      className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded text-[8px] sm:text-[9px] font-mono font-bold flex items-center justify-center shrink-0 transition-all ${
                        isSearchMatch ? 'ring-2 ring-yellow-400 scale-125 z-20' : ''
                      } ${
                        stateObj.selectable
                          ? 'hover:scale-110 cursor-pointer shadow-sm'
                          : 'cursor-not-allowed opacity-80'
                      }`}
                      style={{
                        backgroundColor: stateObj.bgColor,
                        color: stateObj.textColor,
                        borderColor: isSearchMatch ? '#FACC15' : 'rgba(255,255,255,0.2)',
                      }}
                    >
                      <span>{seatId}</span>
                      {selectedSeats.includes(seatId) && (
                        <span className="absolute -top-1 -right-1 bg-white text-purple-950 rounded-full w-3.5 h-3.5 text-[7.5px] flex items-center justify-center font-black">
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
                    <div className="w-[320px] sm:w-[360px] flex flex-nowrap gap-0.5 sm:gap-1 items-center justify-end">{cSideSeats}</div>
                    {/* Clean Straight Vertical Aisle Gap (+2 blocks wider) */}
                    <div className="w-16 sm:w-24 shrink-0" />
                    {/* M-Side (Centered in fixed width column) */}
                    <div className="w-[320px] sm:w-[360px] flex flex-nowrap gap-0.5 sm:gap-1 items-center justify-center">{mSideSeats}</div>
                    {/* Clean Straight Vertical Aisle Gap (+2 blocks wider) */}
                    <div className="w-16 sm:w-24 shrink-0" />
                    {/* R-Side (Left aligned so inner edge starts at exact same vertical line) */}
                    <div className="w-[320px] sm:w-[360px] flex flex-nowrap gap-0.5 sm:gap-1 items-center justify-start">{rSideSeats}</div>
                  </div>
                );
              })}
            </div>

            {/* STAGE BAR: EXACTLY 100% OF THE 3 COLUMNS COMBINED */}
            <div className="pt-8 pb-4 w-full">
              <div className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#6B1A2B] via-[#8B263E] to-[#6B1A2B] text-white font-serif-display text-base font-bold tracking-widest uppercase shadow-xl border-2 border-[#D4AF37] flex items-center justify-center gap-3 text-center">
                <span>🎭</span>
                <span>AUDITORIUM STAGE / PERFORMANCE AREA</span>
                <span>🎭</span>
              </div>
              <p className="text-[11px] text-[#6B1A2B] mt-2 font-marcellus font-bold text-center">
                All views and seats face towards the main stage at the bottom
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ================= FOOTER ZONE LEGEND BAR ================= */}
      <div className="p-3 bg-[#250912] border-t border-[#D4AF37]/40 text-xs z-20">
        <div className="flex flex-wrap items-center justify-between gap-2 max-w-[1600px] mx-auto">
          {/* Status Color Guide */}
          <div className="flex flex-wrap items-center gap-4 bg-white/95 px-3 py-1.5 rounded text-black font-semibold shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black">Seat States:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#16A34A] border border-black/20" />
              <span className="text-[11px] text-black font-bold">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#6A0DAD] border border-black/20" />
              <span className="text-[11px] text-black font-bold">Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#DC2626] border border-black/20" />
              <span className="text-[11px] text-black font-bold">Allocated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#D4AF37] border border-black/20" />
              <span className="text-[11px] text-black font-bold">VIP</span>
            </div>
          </div>

          {/* Blueprint Zones Legend */}
          <div className="flex flex-wrap items-center gap-3 overflow-x-auto text-[10px]">
            <span className="font-bold text-[#D4AF37] uppercase">ZONES:</span>
            {Object.values(SEATING_ZONES).map((z) => (
              <div key={z.code} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: z.color }} />
                <span className="text-gray-200">{z.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
