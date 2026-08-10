'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingSummaryPage() {
  const router = useRouter();

  const [bookingDraft, setBookingDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const draft = sessionStorage.getItem('skanda_booking_draft');
    if (!draft) {
      router.push('/booking/login');
      return;
    }
    setBookingDraft(JSON.parse(draft));
  }, [router]);

  const handlePayAndConfirm = async () => {
    setError('');
    setLoading(true);

    try {
      // Step 1: Create Order in DB
      const createRes = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingDraft),
      });

      const createData = await createRes.json();

      if (!createData.success) {
        setError(createData.error || 'Failed to create booking order.');
        setLoading(false);
        return;
      }

      const { bookingId } = createData.booking;

      // Step 2: Simulate Razorpay Verified Payment Callback
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: 'valid_mock_signature',
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        // Clear session draft & redirect to digital E-Ticket
        sessionStorage.removeItem('skanda_booking_draft');
        router.push(`/ticket/${bookingId}`);
      } else {
        setError(verifyData.error || 'Payment verification failed.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Network error processing payment.');
      setLoading(false);
    }
  };

  if (!bookingDraft) return null;

  return (
    <div className="py-12 px-6 sm:px-10 max-w-4xl mx-auto" style={{ background: 'var(--ivory)' }}>
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gold/30 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        <div className="opacity-60 cursor-pointer" onClick={() => router.push('/booking/login')}>
          ✓ 1. Contact Details
        </div>
        <div className="opacity-60 cursor-pointer" onClick={() => router.push('/booking/select-type')}>
          ✓ 2. Category
        </div>
        <div className="opacity-60 cursor-pointer" onClick={() => router.push(bookingDraft.buyerType === 'MSN' ? '/booking/msn' : '/booking/external')}>
          ✓ 3. Ticket Qty
        </div>
        <div className="flex items-center gap-2 text-maroon font-bold">
          <span className="step-badge">4</span>
          <span>Summary & Payment</span>
        </div>
      </div>

      <div className="card-gold-accent p-6 sm:p-8 space-y-6">
        <div className="text-center">
          <p className="eyebrow mb-1">FINAL STEP 4</p>
          <h2 className="font-serif-display text-3xl font-semibold" style={{ color: 'var(--maroon)' }}>
            Booking Summary & Payment
          </h2>
          <p className="text-sm text-ink-soft mt-1">
            Please review your booking details before proceeding to Razorpay checkout.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-100 border border-red-300 text-red-800 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Customer & Category Summary Box */}
        <div className="p-4 rounded-lg bg-cream border border-gold space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gold/30">
            <div>
              <span className="text-xs text-ink-soft block uppercase">PRIMARY CUSTOMER</span>
              <strong className="text-maroon font-semibold">{bookingDraft.customerName}</strong>
            </div>
            <div>
              <span className="text-xs text-ink-soft block uppercase">PHONE / WHATSAPP</span>
              <span className="text-ink font-mono">{bookingDraft.whatsapp}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gold/30">
            <div>
              <span className="text-xs text-ink-soft block uppercase">EMAIL</span>
              <span className="text-ink truncate block">{bookingDraft.email}</span>
            </div>
            <div>
              <span className="text-xs text-ink-soft block uppercase">ATTENDEE CATEGORY</span>
              <span className="inline-block px-2 py-0.5 text-xs font-bold bg-maroon text-ivory rounded uppercase">
                {bookingDraft.buyerType === 'MSN' ? 'MSN Student / Parent' : 'External Attendee'}
              </span>
            </div>
          </div>

          {bookingDraft.buyerType === 'MSN' && (
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gold/30">
              <div>
                <span className="text-xs text-ink-soft block uppercase">STUDENT NAME</span>
                <strong className="text-maroon">{bookingDraft.studentName}</strong>
              </div>
              <div>
                <span className="text-xs text-ink-soft block uppercase">BATCH & CODE</span>
                <span className="text-ink font-semibold">
                  {bookingDraft.batchName} ({bookingDraft.batchCode})
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-ink-soft block uppercase">ALLOCATED SEATING ROW</span>
              <strong className="text-maroon font-serif-display text-base">
                {bookingDraft.allocatedRow}
              </strong>
            </div>
            <div>
              <span className="text-xs text-ink-soft block uppercase">TICKET QUANTITY</span>
              <span className="text-maroon font-num font-bold text-lg">
                {bookingDraft.ticketQty} Tickets
              </span>
            </div>
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="p-4 rounded border border-gold/50 bg-sandal/40 space-y-2">
          <div className="flex justify-between text-sm text-ink-soft">
            <span>Ticket Price per Seat</span>
            <span className="font-mono">₹{bookingDraft.ticketPrice}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-soft">
            <span>Quantity</span>
            <span className="font-mono">× {bookingDraft.ticketQty}</span>
          </div>
          <div className="pt-2 border-t border-gold/40 flex justify-between items-center text-maroon">
            <span className="font-bold uppercase tracking-wider text-sm">TOTAL AMOUNT DUE</span>
            <span className="font-num text-3xl font-bold">
              ₹{bookingDraft.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Razorpay Gateway CTA Button */}
        <div>
          <button
            onClick={handlePayAndConfirm}
            disabled={loading}
            className="w-full luxe-button luxe-button-solid py-4 text-base shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <span>⏳ Processing Razorpay Verification...</span>
            ) : (
              <>
                <span>💳 PAY ₹{bookingDraft.totalAmount.toLocaleString()} VIA RAZORPAY</span>
                <span>&rarr;</span>
              </>
            )}
          </button>
          <p className="text-xs text-center text-ink-soft mt-2">
            🔒 Safe & Secure 256-bit Encrypted Checkout. E-ticket issued instantly upon verification.
          </p>
        </div>
      </div>
    </div>
  );
}
