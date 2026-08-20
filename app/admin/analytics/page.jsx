'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAnalyticsPage() {
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

  const [seatsMaster, setSeatsMaster] = useState([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
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

      if (dataB.success) setMetrics(dataB.metrics);
      if (dataS.success) setSeatsMaster(dataS.seats);
    } catch (e) {
      console.error('Error loading analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const totalCapacity = metrics.totalCapacity || 600;
  const bookedTickets = metrics.totalTicketsBooked || 0;
  const remainingTickets = metrics.remainingTickets !== undefined ? metrics.remainingTickets : Math.max(0, totalCapacity - bookedTickets);
  const occupancyPct = Math.round((bookedTickets / totalCapacity) * 100);

  let totalAllocatedSeats = 0;
  seatsMaster.forEach((s) => {
    if (s.status === 'ALLOCATED') totalAllocatedSeats++;
  });

  return (
    <div className="py-8 px-6 sm:px-10 max-w-[1600px] mx-auto min-h-screen space-y-6">
      {/* Top Action Toolbar */}
      <div className="flex justify-end items-center pb-4 border-b border-[#D4AF37]/30">
        <button
          onClick={loadAnalyticsData}
          className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded border border-gold bg-cream hover:bg-sandal text-[#6B1A2B] shadow-sm flex items-center gap-1.5 transition-colors"
        >
          🔄 Refresh Analytics
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-ink-soft font-medium">
          ⏳ Computing analytics & insights...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top-Level Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* 1. Total Revenue */}
            <div className="p-5 rounded-xl bg-white border border-gold text-center space-y-1 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bronze block">TOTAL REVENUE</span>
              <div className="font-num text-2xl sm:text-3xl font-extrabold text-[#6B1A2B]">
                ₹{metrics.totalCollections.toLocaleString()}
              </div>
              <span className="text-[10px] text-ink-soft block">Verified Online Gateway</span>
            </div>

            {/* 2. Total Tickets Booked */}
            <div className="p-5 rounded-xl bg-white border border-gold text-center space-y-1 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bronze block">TICKETS BOOKED</span>
              <div className="font-num text-2xl sm:text-3xl font-extrabold text-amber-900">
                {bookedTickets} / 600
              </div>
              <span className="text-[10px] text-ink-soft block">Confirmed Issued</span>
            </div>

            {/* 3. Remaining Capacity */}
            <div className="p-5 rounded-xl bg-white border border-gold text-center space-y-1 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bronze block">REMAINING CAPACITY</span>
              <div className="font-num text-2xl sm:text-3xl font-extrabold text-emerald-900">
                {remainingTickets}
              </div>
              <span className="text-[10px] text-ink-soft block">Available Out of 600</span>
            </div>

            {/* 4. Allocated Seats */}
            <div className="p-5 rounded-xl bg-white border border-gold text-center space-y-1 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bronze block">ALLOCATED SEATS</span>
              <div className="font-num text-2xl sm:text-3xl font-extrabold text-purple-900">
                {totalAllocatedSeats}
              </div>
              <span className="text-[10px] text-ink-soft block">Assigned on Chart</span>
            </div>

            {/* 5. Total Orders */}
            <div className="p-5 rounded-xl bg-white border border-gold text-center space-y-1 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bronze block">PAID ORDERS</span>
              <div className="font-num text-2xl sm:text-3xl font-extrabold text-[#6B1A2B]">
                {metrics.totalPaidBookings}
              </div>
              <span className="text-[10px] text-ink-soft block">Successful Transactions</span>
            </div>
          </div>

          {/* Occupancy Rate Bar Card */}
          <div className="card-gold-accent p-6 bg-white shadow-md space-y-4">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-[#6B1A2B] text-base">🎟️ Event Capacity Occupancy Rate ({occupancyPct}%)</span>
              <span className="text-ink-soft font-mono text-xs">{bookedTickets} / 600 Tickets Sold</span>
            </div>

            <div className="w-full h-7 bg-sandal/60 rounded-full overflow-hidden border-2 border-gold flex shadow-inner">
              <div
                className="bg-gradient-to-r from-[#6B1A2B] to-[#8B2338] h-full transition-all duration-1000 flex items-center justify-center text-ivory text-xs font-bold font-num"
                style={{ width: `${Math.min(100, occupancyPct)}%` }}
              >
                {occupancyPct > 5 ? `${occupancyPct}% Occupied` : ''}
              </div>
            </div>
          </div>

          {/* Category Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MSN Students Share */}
            <div className="card-gold-accent p-6 bg-amber-50/70 border-2 border-amber-300 shadow-md space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-serif-display text-xl font-bold text-amber-950">
                  🎭 MSN Category
                </h3>
                <span className="px-2.5 py-1 text-xs font-bold bg-amber-200 text-amber-900 rounded uppercase">
                  Internal Category
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-white/80 rounded-lg border border-amber-200 text-center">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">TICKETS ISSUED</span>
                  <strong className="font-num text-2xl text-amber-950 block">{metrics.msnTickets || 0}</strong>
                </div>

                <div className="p-3 bg-white/80 rounded-lg border border-amber-200 text-center">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">COLLECTIONS</span>
                  <strong className="font-num text-2xl text-amber-950 block">₹{(metrics.msnCollections || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* External Attendees Share */}
            <div className="card-gold-accent p-6 bg-blue-50/70 border-2 border-blue-300 shadow-md space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-serif-display text-xl font-bold text-blue-950">
                  🎟️ External Attendees Category
                </h3>
                <span className="px-2.5 py-1 text-xs font-bold bg-blue-200 text-blue-900 rounded uppercase">
                  General Public
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-white/80 rounded-lg border border-blue-200 text-center">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">TICKETS ISSUED</span>
                  <strong className="font-num text-2xl text-blue-950 block">{metrics.externalTickets || 0}</strong>
                </div>

                <div className="p-3 bg-white/80 rounded-lg border border-blue-200 text-center">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">COLLECTIONS</span>
                  <strong className="font-num text-2xl text-blue-950 block">₹{(metrics.externalCollections || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
