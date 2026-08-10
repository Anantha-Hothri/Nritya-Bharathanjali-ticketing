'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExternalBookingPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState(null);
  const [error, setError] = useState('');

  const [ticketQty, setTicketQty] = useState(1);

  useEffect(() => {
    const savedCustomer = sessionStorage.getItem('skanda_customer_login');
    if (!savedCustomer) {
      router.push('/booking/login');
      return;
    }
    setCustomer(JSON.parse(savedCustomer));
    sessionStorage.setItem('skanda_buyer_type', 'EXTERNAL');

    // Fetch external inventory
    fetchExternalInventory();
  }, [router]);

  const fetchExternalInventory = async () => {
    try {
      const res = await fetch('/api/booking/external-inventory');
      const data = await res.json();
      if (data.success) {
        setInventory(data.inventory);
      } else {
        setError(data.error || 'Failed to load ticket inventory.');
      }
    } catch (err) {
      setError('Network error loading ticket inventory.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToSummary = (e) => {
    e.preventDefault();
    if (!inventory || inventory.totalRemaining <= 0) {
      setError('Sorry, external tickets are sold out!');
      return;
    }

    if (ticketQty < 1) {
      setError('Please select at least 1 ticket.');
      return;
    }

    if (ticketQty > inventory.totalRemaining) {
      setError(`Only ${inventory.totalRemaining} external tickets remaining.`);
      return;
    }

    // Determine row allocation summary
    const availableRowsList = inventory.availableRows.map((r) => r.rowName).join(', ');

    const externalBookingData = {
      buyerType: 'EXTERNAL',
      customerName: customer.customerName,
      phone: customer.phone,
      whatsapp: customer.whatsapp,
      isWhatsappSame: customer.isWhatsappSame,
      email: customer.email,
      studentName: null,
      batchName: null,
      batchCode: null,
      allocatedRow: availableRowsList || 'External Seats Pool',
      ticketQty,
      ticketPrice: inventory.defaultPrice,
      totalAmount: ticketQty * inventory.defaultPrice,
    };

    sessionStorage.setItem('skanda_booking_draft', JSON.stringify(externalBookingData));
    router.push('/booking/summary');
  };

  if (!customer) return null;

  return (
    <div className="py-12 px-6 sm:px-10 max-w-4xl mx-auto" style={{ background: 'var(--ivory)' }}>
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gold/30 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        <div className="opacity-60 cursor-pointer" onClick={() => router.push('/booking/login')}>
          ✓ 1. Contact Details
        </div>
        <div className="opacity-60 cursor-pointer" onClick={() => router.push('/booking/select-type')}>
          ✓ 2. External Category
        </div>
        <div className="flex items-center gap-2 text-maroon font-bold">
          <span className="step-badge">3</span>
          <span>Ticket Selection</span>
        </div>
        <div className="opacity-40">4. Payment</div>
      </div>

      <div className="card-gold-accent p-6 sm:p-8 space-y-6">
        <div className="text-center">
          <p className="eyebrow mb-1">EXTERNAL ATTENDEE BOOKING</p>
          <h2 className="font-serif-display text-3xl font-semibold" style={{ color: 'var(--maroon)' }}>
            Select External Tickets
          </h2>
          <p className="text-sm text-ink-soft mt-1">
            Book tickets directly from the Admin-configured external attendee seating inventory.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-ink-soft font-medium">
            ⌛ Loading live seating inventory...
          </div>
        ) : error ? (
          <div className="p-4 rounded bg-red-100 border border-red-300 text-red-800 text-sm text-center">
            ⚠️ {error}
          </div>
        ) : (
          <form onSubmit={handleProceedToSummary} className="space-y-6">
            {/* Inventory Status Card */}
            <div className="p-4 rounded-lg bg-cream border border-gold space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-bronze">EXTERNAL SEATING POOL</span>
                <span className="px-2.5 py-1 text-xs font-bold bg-maroon text-ivory rounded-full">
                  {inventory.totalRemaining} Tickets Available
                </span>
              </div>

              <div className="pt-2 border-t border-gold/40 text-xs text-ink-soft">
                <strong>Allocated Rows:</strong>{' '}
                {inventory.rows.map((r) => `${r.rowName} (${r.remainingCount} left)`).join(' • ')}
              </div>
            </div>

            {/* Ticket Quantity Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bronze mb-1.5">
                Number of Tickets <span className="text-red-600">*</span> (MINIMUM 1 TICKET)
              </label>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setTicketQty((q) => Math.max(1, q - 1))}
                  disabled={ticketQty <= 1}
                  className="w-12 h-12 rounded border border-gold bg-sandal text-xl font-bold flex items-center justify-center disabled:opacity-40"
                >
                  -
                </button>

                <div className="text-center">
                  <span className="font-num text-3xl font-bold text-maroon">{ticketQty}</span>
                  <span className="block text-xs text-ink-soft">Tickets</span>
                </div>

                <button
                  type="button"
                  onClick={() => setTicketQty((q) => Math.min(inventory.totalRemaining, q + 1))}
                  disabled={ticketQty >= inventory.totalRemaining}
                  className="w-12 h-12 rounded border border-gold bg-sandal text-xl font-bold flex items-center justify-center disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Summary Box */}
            <div className="p-4 rounded border border-gold/40 bg-sandal/30 flex justify-between items-center">
              <div>
                <span className="text-xs text-ink-soft block uppercase">TICKET AMOUNT</span>
                <span className="text-sm font-semibold text-ink">
                  {ticketQty} Tickets × ₹{inventory.defaultPrice}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-ink-soft block uppercase">TOTAL COST</span>
                <span className="font-num text-2xl font-bold text-maroon">
                  ₹{(ticketQty * inventory.defaultPrice).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={inventory.totalRemaining <= 0}
              className="w-full luxe-button luxe-button-solid py-4 text-base shadow-md disabled:opacity-50"
            >
              PROCEED TO BOOKING SUMMARY & PAYMENT &rarr;
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
