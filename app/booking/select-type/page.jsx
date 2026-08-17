'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyerTypeSelectPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [showStudentInput, setShowStudentInput] = useState(false);
  const [error, setError] = useState('');
  const [capacityInfo, setCapacityInfo] = useState({
    totalCapacity: 600,
    remainingTickets: 600,
    isSoldOut: false,
  });

  useEffect(() => {
    const savedData = localStorage.getItem('skanda_customer_login') || sessionStorage.getItem('skanda_customer_login');
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
      if (data.success) {
        setCapacityInfo(data);
      }
    } catch (e) {
      console.error('Error fetching capacity:', e);
    }
  };

  const handleSelectType = (type) => {
    setError('');
    if (type === 'MSN') {
      setShowStudentInput(true);
    } else {
      sessionStorage.setItem('skanda_buyer_type', 'EXTERNAL');
      sessionStorage.removeItem('skanda_student_name');
      router.push('/booking/summary');
    }
  };

  const handleConfirmMsn = (e) => {
    e.preventDefault();
    setError('');
    if (!studentName.trim()) {
      setError('Please enter the MSN Student Name (Child\'s Name).');
      return;
    }
    sessionStorage.setItem('skanda_buyer_type', 'MSN');
    sessionStorage.setItem('skanda_student_name', studentName.trim());
    router.push('/booking/summary');
  };

  if (!customer) return null;

  const { isSoldOut, remainingTickets } = capacityInfo;
  const disableMsn = isSoldOut || remainingTickets < 3;
  const disableExt = isSoldOut || remainingTickets < 1;

  return (
    <div className="py-12 px-6 sm:px-10 max-w-4xl mx-auto" style={{ background: 'var(--ivory)' }}>
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gold/30 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        <div className="opacity-60 cursor-pointer" onClick={() => router.push('/booking/login')}>
          ✓ 1. Contact Details
        </div>
        <div className="flex items-center gap-2 text-maroon font-bold">
          <span className="step-badge">2</span>
          <span>Buyer Category</span>
        </div>
        <div className="opacity-40">3. Ticket Selection & Payment</div>
      </div>

      <div className="text-center mb-8">
        <p className="eyebrow mb-1">STEP 2 OF 3</p>
        <h1 className="font-serif-display text-3xl font-semibold" style={{ color: 'var(--maroon)' }}>
          Select Attendee Category
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Welcome, <strong>{customer.customerName}</strong>! Please choose your category to proceed with ticket booking.
        </p>
      </div>

      {isSoldOut ? (
        <div className="p-4 mb-8 rounded bg-red-900 text-white text-center font-bold text-sm shadow-md max-w-xl mx-auto">
          🔒 BOOKINGS CLOSED — SOLD OUT! All event tickets have been booked.
        </div>
      ) : remainingTickets < 3 ? (
        <div className="p-3 mb-6 rounded bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold text-center max-w-xl mx-auto">
          ⚠️ Notice: Insufficient seats remaining for MSN Student/Parent category (requires min 3 tickets).
        </div>
      ) : null}

      {/* MSN Student Name Modal / Form */}
      {showStudentInput && (
        <div className="card-gold-accent p-6 mb-8 max-w-xl mx-auto border-2 border-gold bg-[#FDFBF7] shadow-xl animate-fadeIn space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gold/30">
            <h3 className="font-serif-display text-xl font-bold text-maroon">
              🎭 MSN Student / Child Information
            </h3>
            <button
              onClick={() => setShowStudentInput(false)}
              className="text-xs text-ink-soft hover:text-maroon font-bold"
            >
              ✕ Cancel
            </button>
          </div>

          <p className="text-xs text-ink-soft">
            Please enter the name of the active student studying at M.S. Natyakshetra.
          </p>

          {error && (
            <div className="p-3 rounded bg-red-100 border border-red-300 text-red-800 text-xs font-bold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleConfirmMsn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bronze mb-1">
                MSN Student Name (Child's Name) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Ananya Natarajan"
                className="input-luxe text-sm"
                required
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="luxe-button luxe-button-solid py-3 text-xs flex-1 font-bold tracking-wider"
              >
                PROCEED TO SUMMARY & PAYMENT &rarr;
              </button>
              <button
                type="button"
                onClick={() => setShowStudentInput(false)}
                className="luxe-button luxe-button-outline py-3 text-xs px-6 font-bold"
              >
                BACK
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Option 1: MSN Student / Parent */}
        <div
          onClick={() => !disableMsn && handleSelectType('MSN')}
          className={`card-gold-accent p-6 text-center transition-all flex flex-col justify-between ${
            disableMsn
              ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300'
              : showStudentInput
              ? 'border-2 border-gold bg-sandal/20'
              : 'cursor-pointer hover:border-maroon hover:shadow-xl group'
          }`}
        >
          <div>
            <div className="w-14 h-14 rounded-full bg-sandal/60 border border-gold flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
              🎭
            </div>

            <h2 className="font-serif-display text-2xl font-semibold text-maroon mb-2">
              MSN Student / Parent
            </h2>

            <p className="text-xs text-ink-soft mb-4 leading-relaxed">
              For active students enrolled at M.S. Natyakshetra and their immediate families attending the production.
            </p>
          </div>

          <div className="pt-3 border-t border-gold/30">
            {remainingTickets < 3 && remainingTickets > 0 ? (
              <span className="text-xs font-bold uppercase text-red-800 bg-red-100 px-3 py-1.5 rounded inline-block">
                ⚠️ Disabled (Only {remainingTickets} tickets left, 3 min required)
              </span>
            ) : (
              <span className="text-xs font-bold uppercase tracking-widest text-maroon bg-sandal/60 px-3 py-1.5 rounded inline-block">
                🔒 Minimum 3 Tickets per booking &rarr;
              </span>
            )}
          </div>
        </div>

        {/* Option 2: External Attendee */}
        <div
          onClick={() => !disableExt && handleSelectType('EXTERNAL')}
          className={`card-gold-accent p-6 text-center transition-all flex flex-col justify-between ${
            disableExt
              ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300'
              : 'cursor-pointer hover:border-maroon hover:shadow-xl group'
          }`}
        >
          <div>
            <div className="w-14 h-14 rounded-full bg-sandal/60 border border-gold flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
              🎟️
            </div>

            <h2 className="font-serif-display text-2xl font-semibold text-maroon mb-2">
              External Attendee
            </h2>

            <p className="text-xs text-ink-soft mb-4 leading-relaxed">
              For classical arts enthusiasts, dance lovers, and general public guests attending the Skanda 2026 event.
            </p>
          </div>

          <div className="pt-3 border-t border-gold/30">
            {disableExt ? (
              <span className="text-xs font-bold uppercase text-red-800 bg-red-100 px-3 py-1.5 rounded inline-block">
                🔒 SOLD OUT
              </span>
            ) : (
              <span className="text-xs font-bold uppercase tracking-widest text-maroon bg-sandal/60 px-3 py-1.5 rounded inline-block">
                Minimum 1 Ticket per booking &rarr;
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
