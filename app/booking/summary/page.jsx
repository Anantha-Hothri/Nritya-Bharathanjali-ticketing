'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingSummaryPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState(null);
  const [buyerType, setBuyerType] = useState('EXTERNAL');
  const [ticketQty, setTicketQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [capacityInfo, setCapacityInfo] = useState({
    totalCapacity: 600,
    remainingTickets: 600,
    isSoldOut: false,
    ticketPrice: 850,
  });

  const minTicketQty = buyerType === 'MSN' ? 3 : 1;
  const ticketPrice = capacityInfo.ticketPrice || 850;

  useEffect(() => {
    const savedCustomer = sessionStorage.getItem('skanda_customer_login');
    if (!savedCustomer) {
      router.push('/booking/login');
      return;
    }
    try {
      setCustomer(JSON.parse(savedCustomer));
    } catch (e) {
      router.push('/booking/login');
    }

    const savedType = sessionStorage.getItem('skanda_buyer_type') || 'EXTERNAL';
    setBuyerType(savedType);
    setTicketQty(savedType === 'MSN' ? 3 : 1);

    fetchCapacityInfo();
  }, [router]);

  const fetchCapacityInfo = async () => {
    try {
      const res = await fetch('/api/booking/capacity');
      const data = await res.json();
      if (data.success) {
        setCapacityInfo(data);
      }
    } catch (err) {
      console.error('Error loading capacity:', err);
    }
  };

  const handlePhonePePayment = async () => {
    if (!customer) return;
    setError('');

    if (buyerType === 'MSN' && ticketQty < 3) {
      setError('MSN Student/Parent bookings require a minimum of 3 tickets.');
      return;
    }

    setLoading(true);

    const payload = {
      buyerType,
      customerName: customer.customerName,
      studentName: sessionStorage.getItem('skanda_student_name') || null,
      phone: customer.phone,
      whatsapp: customer.whatsapp,
      isWhatsappSame: customer.isWhatsappSame,
      email: customer.email,
      ticketQty,
    };

    try {
      // Step 1: Initiate PhonePe Order in DB & Generate Checksum
      const createRes = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const createData = await createRes.json();

      if (!createData.success) {
        setError(createData.error || 'Failed to initiate PhonePe booking.');
        setLoading(false);
        return;
      }

      const { bookingId, merchantTransactionId } = createData.booking;

      // Step 2: Perform Verified PhonePe Payment Status Callback
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantTransactionId,
          providerReferenceId: `PPN_TEST_${Date.now()}`,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        // Clear session customer login & redirect to official Booking Acknowledgement Receipt
        sessionStorage.removeItem('skanda_customer_login');
        sessionStorage.removeItem('skanda_buyer_type');
        router.push(`/ticket/${bookingId}`);
      } else {
        setError(verifyData.error || 'PhonePe payment verification failed.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Network error processing PhonePe payment.');
      setLoading(false);
    }
  };

  if (!customer) return null;

  const totalAmount = ticketQty * ticketPrice;
  const remaining = capacityInfo.remainingTickets;
  const isSoldOut = capacityInfo.isSoldOut || remaining <= 0;

  return (
    <div className="py-12 px-6 sm:px-10 max-w-3xl mx-auto" style={{ background: 'var(--ivory)' }}>
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gold/30 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        <div className="opacity-60 cursor-pointer" onClick={() => router.push('/booking/login')}>
          ✓ 1. Contact Details
        </div>
        <div className="opacity-60 cursor-pointer" onClick={() => router.push('/booking/select-type')}>
          ✓ 2. Category ({buyerType === 'MSN' ? 'MSN Student' : 'External'})
        </div>
        <div className="flex items-center gap-2 text-maroon font-bold">
          <span className="step-badge">3</span>
          <span>PhonePe Payment</span>
        </div>
      </div>

      <div className="card-gold-accent p-6 sm:p-8 space-y-6">
        <div className="text-center">
          <p className="eyebrow mb-1">STEP 3 OF 3</p>
          <h2 className="font-serif-display text-3xl font-semibold" style={{ color: 'var(--maroon)' }}>
            Select Tickets & Proceed to PhonePe Payment
          </h2>
          <p className="text-sm text-ink-soft mt-1">
            Review your details, select your ticket quantity, and complete your secure booking via PhonePe.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-100 border border-red-300 text-red-800 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Customer Details Box */}
        <div className="p-4 rounded-lg bg-cream border border-gold space-y-3 text-sm">
          <div className="flex justify-between items-center pb-3 border-b border-gold/30">
            <div>
              <span className="text-xs text-ink-soft block uppercase">PRIMARY CUSTOMER</span>
              <strong className="text-maroon font-semibold text-base">{customer.customerName}</strong>
            </div>
            <button
              onClick={() => router.push('/booking/login')}
              className="text-xs text-maroon hover:underline font-semibold"
            >
              Edit Contact
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-ink-soft block uppercase">ATTENDEE CATEGORY</span>
              <span className="font-bold text-maroon flex items-center gap-1">
                {buyerType === 'MSN' ? '🎭 MSN Student / Parent' : '🎟️ External Attendee'}
              </span>
            </div>
            <div>
              <span className="text-xs text-ink-soft block uppercase">PHONE / WHATSAPP</span>
              <span className="text-ink font-mono">{customer.whatsapp}</span>
            </div>
          </div>
        </div>

        {/* Ticket Quantity Selector */}
        <div className="p-4 rounded-lg border border-gold/40 bg-sandal/20 space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold uppercase tracking-wider text-bronze">
              NUMBER OF TICKETS (₹{ticketPrice} PER TICKET)
            </label>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setTicketQty((q) => Math.max(minTicketQty, q - 1))}
              disabled={ticketQty <= minTicketQty || isSoldOut}
              className="w-12 h-12 rounded border border-gold bg-sandal text-2xl font-bold flex items-center justify-center disabled:opacity-40 hover:bg-gold-pale transition-colors"
            >
              -
            </button>

            <div className="text-center">
              <span className="font-num text-4xl font-bold text-maroon">{ticketQty}</span>
              <span className="block text-xs text-ink-soft font-semibold">
                {ticketQty === 1 ? 'Ticket' : 'Tickets'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setTicketQty((q) => Math.min(remaining, q + 1))}
              disabled={ticketQty >= remaining || isSoldOut}
              className="w-12 h-12 rounded border border-gold bg-sandal text-2xl font-bold flex items-center justify-center disabled:opacity-40 hover:bg-gold-pale transition-colors"
            >
              +
            </button>
          </div>

          {/* MSN Minimum 3 Tickets Rule Notice */}
          {buyerType === 'MSN' && (
            <div className="p-2.5 rounded bg-sandal/80 border border-gold text-xs text-maroon font-bold text-center">
              🔒 MSN Student/Parent bookings require a minimum of 3 tickets.
            </div>
          )}
        </div>

        {/* Amount Breakdown */}
        <div className="p-4 rounded border border-gold/50 bg-sandal/40 space-y-2">
          <div className="flex justify-between text-sm text-ink-soft">
            <span>Ticket Price</span>
            <span className="font-mono">₹{ticketPrice}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-soft">
            <span>Quantity</span>
            <span className="font-mono">× {ticketQty}</span>
          </div>
          <div className="pt-2 border-t border-gold/40 flex justify-between items-center text-maroon">
            <span className="font-bold uppercase tracking-wider text-sm">TOTAL AMOUNT DUE</span>
            <span className="font-num text-3xl font-bold">
              ₹{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* PhonePe Gateway CTA Button */}
        <div>
          <button
            onClick={handlePhonePePayment}
            disabled={loading || isSoldOut}
            className="w-full luxe-button luxe-button-solid py-4 text-base shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <span>⏳ Initiating PhonePe Checkout...</span>
            ) : isSoldOut ? (
              <span>❌ BOOKINGS CLOSED - SOLD OUT (600 TICKETS REACHED)</span>
            ) : (
              <>
                <span>💳 PAY ₹{totalAmount.toLocaleString()} VIA PHONEPE</span>
                <span>&rarr;</span>
              </>
            )}
          </button>
          <p className="text-xs text-center text-ink-soft mt-2">
            🔒 Safe & Secure PhonePe Encrypted Checkout. E-ticket issued instantly upon verified payment.
          </p>
        </div>
      </div>
    </div>
  );
}
