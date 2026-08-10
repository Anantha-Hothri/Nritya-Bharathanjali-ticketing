'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyerTypeSelectPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const savedData = sessionStorage.getItem('skanda_customer_login');
    if (!savedData) {
      router.push('/booking/login');
      return;
    }
    setCustomer(JSON.parse(savedData));
  }, [router]);

  const handleSelectType = (type) => {
    sessionStorage.setItem('skanda_buyer_type', type);
    if (type === 'MSN') {
      router.push('/booking/msn');
    } else {
      router.push('/booking/external');
    }
  };

  if (!customer) return null;

  return (
    <div className="py-12 px-6 sm:px-10 max-w-4xl mx-auto" style={{ background: 'var(--ivory)' }}>
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gold/30 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        <div className="opacity-60 cursor-pointer" onClick={() => router.push('/booking/login')}>
          ✓ 1. Contact Details
        </div>
        <div className="flex items-center gap-2 text-maroon font-bold">
          <span className="step-badge">2</span>
          <span>Buyer Type</span>
        </div>
        <div className="opacity-40">3. Ticket Selection</div>
        <div className="opacity-40">4. Payment</div>
      </div>

      <div className="text-center mb-8">
        <p className="eyebrow mb-1">STEP 2 OF 4</p>
        <h2 className="font-serif-display text-3xl font-semibold" style={{ color: 'var(--maroon)' }}>
          Select Customer Category
        </h2>
        <p className="text-sm text-ink-soft mt-1">
          Welcome, <strong>{customer.customerName}</strong>! Please choose your attendee category to unlock your seat inventory.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Option 1: MSN Student / Parent */}
        <div
          onClick={() => handleSelectType('MSN')}
          className="card-gold-accent p-6 text-center cursor-pointer hover:border-maroon hover:shadow-xl transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-full bg-sandal/60 border border-gold flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
              🎭
            </div>

            <h3 className="font-serif-display text-2xl font-semibold text-maroon mb-2">
              MSN Student / Parent
            </h3>

            <p className="text-xs text-ink-soft mb-4 leading-relaxed">
              For active students enrolled at M.S. Natyakshetra and their families. Requires your unique class Batch Code.
            </p>
          </div>

          <div className="pt-3 border-t border-gold/30">
            <span className="text-xs font-bold uppercase tracking-widest text-bronze group-hover:text-maroon">
              Minimum 3 Tickets • Pre-Allocated Rows &rarr;
            </span>
          </div>
        </div>

        {/* Option 2: External Attendee */}
        <div
          onClick={() => handleSelectType('EXTERNAL')}
          className="card-gold-accent p-6 text-center cursor-pointer hover:border-maroon hover:shadow-xl transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-full bg-sandal/60 border border-gold flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
              🎟️
            </div>

            <h3 className="font-serif-display text-2xl font-semibold text-maroon mb-2">
              External Attendee
            </h3>

            <p className="text-xs text-ink-soft mb-4 leading-relaxed">
              For classical arts enthusiasts, dance lovers, and general public guests attending the Skanda 2026 production.
            </p>
          </div>

          <div className="pt-3 border-t border-gold/30">
            <span className="text-xs font-bold uppercase tracking-widest text-bronze group-hover:text-maroon">
              Minimum 1 Ticket • Configured Rows &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
