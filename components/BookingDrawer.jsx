'use client';

import React from 'react';

export default function BookingDrawer({ booking, onClose, onOpenSeatingChart }) {
  if (!booking) return null;

  const isAllocated = booking.allocationStatus === 'ALLOCATED' && booking.allocatedSeats;
  const allocatedSeatsList = isAllocated ? booking.allocatedSeats.split(',').map((s) => s.trim()) : [];

  const cleanName = (name) => {
    if (!name) return '';
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-[#FDFBF7] h-full shadow-2xl flex flex-col justify-between border-l-2 border-[#D4AF37] z-10">
        {/* Drawer Header */}
        <div className="p-6 bg-[#6B1A2B] text-[#FAF6EF] flex justify-between items-start border-b border-[#D4AF37]/40">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block">
              BOOKING DETAILS CARD
            </span>
            <h2 className="font-mono text-2xl font-extrabold text-white mt-1">
              {booking.bookingId}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                booking.buyerType === 'MSN'
                  ? 'bg-[#D4AF37] text-[#6B1A2B]'
                  : 'bg-blue-100 text-blue-900'
              }`}>
                {booking.buyerType === 'MSN' ? 'MSN' : 'External Attendee'}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                booking.paymentStatus === 'PAID'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-amber-700 text-white'
              }`}>
                ✓ {booking.paymentStatus}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl font-bold p-1 leading-none rounded hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Drawer Body - Scrollable content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-grow text-xs text-[#2C1810]">
          {/* Seat Allocation Status Card */}
          <div className={`p-5 rounded-xl border-2 ${
            isAllocated
              ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950'
              : 'bg-amber-50/80 border-amber-400 text-amber-950'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                CURRENT SEAT ALLOCATION STATUS
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                isAllocated ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
              }`}>
                {isAllocated ? '✅ SEATS ALLOCATED' : '🔲 PENDING ALLOCATION'}
              </span>
            </div>

            {isAllocated ? (
              <div>
                <div className="font-mono text-xl font-black text-emerald-900 tracking-wider my-1">
                  {booking.allocatedSeats}
                </div>
                <div className="text-[10px] text-emerald-700 mt-1 flex justify-between">
                  <span>Allocated By: <strong>{booking.allocatedBy || 'Admin'}</strong></span>
                  <span>{booking.allocatedAt ? new Date(booking.allocatedAt).toLocaleString() : ''}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-900 font-semibold my-1">
                Seats Not Yet Allocated — {booking.ticketQty} {booking.ticketQty === 1 ? 'Seat' : 'Seats'} Required
              </div>
            )}
          </div>

          {/* Customer & Attendee Details */}
          <div className="card-gold-accent p-5 space-y-3 bg-white">
            <h3 className="font-serif-display text-base font-bold text-[#6B1A2B] border-b border-[#D4AF37]/30 pb-2">
              👤 Customer & Student Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase text-bronze font-bold block">CUSTOMER NAME</span>
                <span className="text-sm font-bold text-ink block">{cleanName(booking.customerName)}</span>
              </div>

              {booking.studentName && (
                <div>
                  <span className="text-[10px] uppercase text-bronze font-bold block">STUDENT / CHILD NAME</span>
                  <span className="text-sm font-bold text-[#6B1A2B] block">{booking.studentName}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gold/20">
              <div>
                <span className="text-[10px] uppercase text-bronze font-bold block">PHONE / WHATSAPP</span>
                <span className="font-mono font-bold text-ink">{booking.whatsapp || booking.phone}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-bronze font-bold block">EMAIL ADDRESS</span>
                <span className="font-mono text-ink text-[11px] truncate block">{booking.email}</span>
              </div>
            </div>
          </div>

          {/* Ticket & Financial Summary */}
          <div className="card-gold-accent p-5 space-y-3 bg-white">
            <h3 className="font-serif-display text-base font-bold text-[#6B1A2B] border-b border-[#D4AF37]/30 pb-2">
              🎟️ Booking & Payment Summary
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded bg-cream border border-gold/40">
                <span className="text-[10px] uppercase font-bold text-bronze block">TICKETS</span>
                <strong className="text-base text-[#6B1A2B] font-num">{booking.ticketQty}</strong>
              </div>

              <div className="p-2.5 rounded bg-cream border border-gold/40">
                <span className="text-[10px] uppercase font-bold text-bronze block">AMOUNT PAID</span>
                <strong className="text-base text-emerald-900 font-num">₹{booking.totalAmount}</strong>
              </div>

              <div className="p-2.5 rounded bg-cream border border-gold/40">
                <span className="text-[10px] uppercase font-bold text-bronze block">BOOKING DATE</span>
                <strong className="text-[11px] text-ink font-mono block mt-1">
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-4 rounded-lg bg-[#FAF6EF] border border-[#D4AF37]/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-bronze block">EVENT INFO</span>
            <strong className="text-xs text-[#6B1A2B] block">Nritya Bharathanjali 2026 — Skanda Production</strong>
            <span className="text-[11px] text-ink-soft block">Sept 26, 2026 • Dhwani Auditorium, CMRIT Campus</span>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 bg-cream border-t border-[#D4AF37]/40 flex gap-3">
          <button
            onClick={() => onOpenSeatingChart(booking)}
            className="flex-1 py-3 px-4 rounded-lg bg-[#6B1A2B] hover:bg-[#8B2338] text-[#FAF6EF] text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 border border-[#D4AF37]"
          >
            <span>🪑</span>
            <span>{isAllocated ? 'RE-ALLOCATE / EDIT SEATS' : 'ALLOCATE SEATS NOW'}</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-lg bg-white hover:bg-sandal text-[#6B1A2B] text-xs font-bold uppercase tracking-wider border border-gold/60 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
