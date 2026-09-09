'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectTierPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [capacityInfo, setCapacityInfo] = useState({
    totalCapacity: 645,
    remainingTickets: 645,
    isSoldOut: false,
    standardClosed: true,
    standardPrice: 850,
    middleRowPrice: 750,
    backRowPrice: 500,
    standardRemaining: 502,
    middleRowRemaining: 70,
    backRowRemaining: 73,
  });

  useEffect(() => {
    const savedData =
      localStorage.getItem('skanda_customer_login') ||
      sessionStorage.getItem('skanda_customer_login');
    if (!savedData) {
      router.push('/booking/login');
      return;
    }
    try {
      setCustomer(JSON.parse(savedData));
    } catch (e) {
      router.push('/booking/login');
    }
    fetchCapacity();
  }, [router]);

  const fetchCapacity = async () => {
    try {
      const res = await fetch('/api/booking/capacity');
      const data = await res.json();
      if (data.success) setCapacityInfo(data);
    } catch (e) {
      console.error('Error fetching capacity:', e);
    }
  };

  const handleSelectTier = (tier) => {
    sessionStorage.setItem('skanda_buyer_type', 'EXTERNAL');
    sessionStorage.setItem('skanda_seat_tier', tier);
    router.push('/booking/summary');
  };

  if (!customer) return null;

  const {
    isSoldOut,
    standardClosed,
    standardRemaining,
    middleRowRemaining,
    backRowRemaining,
    standardPrice,
    middleRowPrice,
    backRowPrice,
  } = capacityInfo;

  const disableStandard = true; // ₹850 tier permanently closed
  const disableMiddle = isSoldOut || middleRowRemaining <= 0;
  const disableBack = isSoldOut || backRowRemaining <= 0;

  return (
    <div className="py-12 px-6 sm:px-10 max-w-4xl mx-auto" style={{ background: 'var(--ivory)' }}>
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gold/30 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        <div className="opacity-60 cursor-pointer" onClick={() => router.push('/booking/login')}>
          ✓ 1. Contact Details
        </div>
        <div className="flex items-center gap-2 text-maroon font-bold">
          <span className="step-badge">2</span>
          <span>Choose Seat Section</span>
        </div>
        <div className="opacity-40">3. Tickets & Payment</div>
      </div>

      <div className="text-center mb-8">
        <p className="eyebrow mb-1">STEP 2 OF 3</p>
        <h1 className="font-serif-display text-3xl font-semibold" style={{ color: 'var(--maroon)' }}>
          Select Your Seat Section
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Welcome, <strong>{customer.customerName}</strong>! Choose a seating section to continue.
        </p>
      </div>

      {isSoldOut ? (
        <div className="p-4 mb-8 rounded bg-red-900 text-white text-center font-bold text-sm shadow-md max-w-xl mx-auto">
          🔒 BOOKINGS CLOSED — SOLD OUT! All event tickets have been booked.
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {/* Standard Seats — ₹850 — CLOSED */}
        <div className="p-6 rounded-xl border-2 text-center space-y-3 flex flex-col justify-between opacity-50 cursor-not-allowed bg-gray-100 border-gray-300">
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-2xl mx-auto">
              🪑
            </div>
            <h4 className="font-serif-display text-xl font-bold text-gray-500">Standard Seats</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Front and centre sections of the auditorium. Best view of the stage.
            </p>
          </div>
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <div>
              <span className="font-num text-3xl font-extrabold text-gray-400">₹{standardPrice || 850}</span>
              <span className="text-xs text-gray-400 ml-1">per ticket</span>
            </div>
            <span className="inline-block text-xs font-bold uppercase text-gray-600 bg-gray-200 px-3 py-1 rounded tracking-widest">
              🔒 Closed
            </span>
          </div>
        </div>

        {/* Middle Row Seats — ₹750 */}
        <div
          onClick={() => !disableMiddle && handleSelectTier('MIDDLE_ROW')}
          className={`p-6 rounded-xl border-2 text-center space-y-3 transition-all flex flex-col justify-between ${
            disableMiddle
              ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300'
              : 'border-violet-400 bg-violet-50 cursor-pointer hover:border-violet-700 hover:shadow-xl group'
          }`}
        >
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-full bg-violet-100 border border-violet-300 flex items-center justify-center text-2xl mx-auto group-hover:scale-110 transition-transform">
              🎭
            </div>
            <h4 className="font-serif-display text-xl font-bold text-violet-800">Middle Row Seats</h4>
            <p className="text-xs text-violet-700 leading-relaxed">
              Mid-section seating with a comfortable view of the performance.
            </p>
          </div>
          <div className="pt-3 border-t border-violet-200 space-y-2">
            <div>
              <span className="font-num text-3xl font-extrabold text-violet-800">₹{middleRowPrice || 750}</span>
              <span className="text-xs text-violet-600 ml-1">per ticket</span>
            </div>
            {disableMiddle ? (
              <span className="inline-block text-xs font-bold uppercase text-red-800 bg-red-100 px-3 py-1 rounded">
                Sold Out
              </span>
            ) : (
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-800 bg-violet-100 px-3 py-1 rounded">
                {middleRowRemaining} seats left · Select →
              </span>
            )}
          </div>
        </div>

        {/* Back Row Seats — ₹500 */}
        <div
          onClick={() => !disableBack && handleSelectTier('BACK_ROW')}
          className={`p-6 rounded-xl border-2 text-center space-y-3 transition-all flex flex-col justify-between ${
            disableBack
              ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300'
              : 'border-teal-400 bg-teal-50 cursor-pointer hover:border-teal-600 hover:shadow-xl group'
          }`}
        >
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center text-2xl mx-auto group-hover:scale-110 transition-transform">
              🏛️
            </div>
            <h4 className="font-serif-display text-xl font-bold text-teal-800">Back Row Seats</h4>
            <p className="text-xs text-teal-700 leading-relaxed">
              Rear section of the auditorium at the most affordable price.
            </p>
          </div>
          <div className="pt-3 border-t border-teal-200 space-y-2">
            <div>
              <span className="font-num text-3xl font-extrabold text-teal-800">₹{backRowPrice || 500}</span>
              <span className="text-xs text-teal-600 ml-1">per ticket</span>
            </div>
            {disableBack ? (
              <span className="inline-block text-xs font-bold uppercase text-red-800 bg-red-100 px-3 py-1 rounded">
                Sold Out
              </span>
            ) : (
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-teal-800 bg-teal-100 px-3 py-1 rounded">
                {backRowRemaining} seats left · Select →
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => router.push('/booking/login')}
          className="text-xs text-ink-soft hover:text-maroon font-semibold underline"
        >
          ← Back to Contact Details
        </button>
      </div>
    </div>
  );
}
