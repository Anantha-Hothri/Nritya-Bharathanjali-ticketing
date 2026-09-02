'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingSummaryPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState(null);
  const [buyerType, setBuyerType] = useState('EXTERNAL');
  const [seatTier, setSeatTier] = useState('STANDARD');
  const [ticketQty, setTicketQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [capacityInfo, setCapacityInfo] = useState({
    totalCapacity: 645,
    remainingTickets: 645,
    isSoldOut: false,
    ticketPrice: 850,
    standardPrice: 850,
    backRowPrice: 500,
  });

  // UPI payment state
  const [step, setStep] = useState('SELECT'); // 'SELECT' | 'PAYMENT'
  const [upiInfo, setUpiInfo] = useState(null);   // { upiId, upiDeepLink, qrCodeDataUrl, amount, reference }
  const [bookingInfo, setBookingInfo] = useState(null); // { bookingId, ... }
  const [submitting, setSubmitting] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [upiCopied, setUpiCopied] = useState(false);

  const minTicketQty = buyerType === 'MSN' ? 3 : 1;
  const isBackRow = seatTier === 'BACK_ROW';
  const ticketPrice = isBackRow
    ? (capacityInfo.backRowPrice || 500)
    : (capacityInfo.standardPrice || capacityInfo.ticketPrice || 850);

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

    const savedTier = sessionStorage.getItem('skanda_seat_tier') || 'STANDARD';
    setSeatTier(savedTier);

    fetchCapacityInfo();
  }, [router]);

  const fetchCapacityInfo = async () => {
    try {
      const res = await fetch('/api/booking/capacity');
      const data = await res.json();
      if (data.success) setCapacityInfo(data);
    } catch (err) {
      console.error('Error loading capacity:', err);
    }
  };

  // Step 1 → 2: Create booking and show UPI payment screen
  const handleProceedToPay = async () => {
    if (!customer) return;
    setError('');

    if (buyerType === 'MSN' && ticketQty < 3) {
      setError('MSN Student/Parent bookings require a minimum of 3 tickets.');
      return;
    }

    setLoading(true);

    const payload = {
      buyerType,
      seatTier,
      customerName: customer.customerName,
      studentName: sessionStorage.getItem('skanda_student_name') || null,
      phone: customer.phone,
      whatsapp: customer.whatsapp,
      isWhatsappSame: customer.isWhatsappSame,
      email: customer.email,
      ticketQty,
    };

    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to create booking. Please try again.');
        setLoading(false);
        return;
      }

      setBookingInfo(data.booking);
      setUpiInfo(data.upi);
      setStep('PAYMENT');
      setLoading(false);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  // Step 2: User clicks "I've Paid" — flag booking for manual admin verification, go to pending page
  const handlePaymentClaimed = async () => {
    if (!bookingInfo) return;

    const trimmedUtr = utrInput.trim();

    if (!trimmedUtr) {
      setError('Please enter the UPI Transaction ID / UTR Number before confirming payment.');
      return;
    }

    if (!/^\d{12}$/.test(trimmedUtr)) {
      setError('Invalid Transaction ID. Please enter the exact 12-digit UPI Transaction ID / UTR Number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/payment/submit-utr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingInfo.bookingId,
          utrNumber: trimmedUtr,
        }),
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.removeItem('skanda_customer_login');
        sessionStorage.removeItem('skanda_buyer_type');
        sessionStorage.removeItem('skanda_student_name');
        sessionStorage.removeItem('skanda_seat_tier');
        router.push(`/booking/pending?id=${bookingInfo.bookingId}`);
      } else {
        setError(data.error || 'Failed to record payment. Please contact support.');
        setSubmitting(false);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  const handleCopyUpiId = async () => {
    if (!upiInfo || !upiInfo.upiId) return;
    try {
      await navigator.clipboard.writeText(upiInfo.upiId);
    } catch (e) {
      // Fallback for browsers without Clipboard API access
      const textarea = document.createElement('textarea');
      textarea.value = upiInfo.upiId;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2000);
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
          ✓ 2. Category ({buyerType === 'MSN' ? 'MSN' : 'External'} · {isBackRow ? 'Back Row' : 'Standard'})
        </div>
        <div className="flex items-center gap-2 text-maroon font-bold">
          <span className="step-badge">3</span>
          <span>{step === 'SELECT' ? 'Tickets & Payment' : 'Pay via UPI'}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 border border-red-300 text-red-800 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* ── STEP 1: Ticket selector ── */}
      {step === 'SELECT' && (
        <div className="card-gold-accent p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <p className="eyebrow mb-1">STEP 3 OF 3</p>
            <h2 className="font-serif-display text-3xl font-semibold" style={{ color: 'var(--maroon)' }}>
              Select Tickets & Proceed to Payment
            </h2>
            <p className="text-sm text-ink-soft mt-1">
              Review your details, select ticket quantity, and pay via UPI.
            </p>
          </div>

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
                  {buyerType === 'MSN' ? '🎭 MSN' : '🎟️ External Attendee'}
                </span>
              </div>
              <div>
                <span className="text-xs text-ink-soft block uppercase">SEAT SECTION</span>
                <span className={`font-bold flex items-center gap-1 ${isBackRow ? 'text-teal-700' : 'text-maroon'}`}>
                  {isBackRow ? '🏛️ Back Row (Q & R)' : '🪑 Standard Seats'}
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-bronze">
              NUMBER OF TICKETS (₹{ticketPrice} PER TICKET)
            </label>
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
              <span className="font-num text-3xl font-bold">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Back Row Info Banner */}
          {isBackRow && (
            <div className="p-3 rounded-lg bg-teal-50 border border-teal-300 text-teal-800 text-xs font-semibold flex items-start gap-2">
              <span className="text-base">🏛️</span>
              <span>
                <strong>Back Row Seats Selected (₹500/ticket).</strong> Your seats will be in Rows Q or R at the back of the auditorium. Exact seat assignments are made by our team before the event and sent to you.
              </span>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleProceedToPay}
            disabled={loading || isSoldOut}
            className="w-full luxe-button luxe-button-solid py-4 text-base shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <span>⏳ Preparing Payment...</span>
            ) : isSoldOut ? (
              <span>❌ BOOKINGS CLOSED — SOLD OUT</span>
            ) : (
              <>
                <span>💳 PROCEED TO PAY ₹{totalAmount.toLocaleString()} VIA UPI</span>
                <span>&rarr;</span>
              </>
            )}
          </button>
          <p className="text-xs text-center text-ink-soft mt-2">
            🔒 Secure UPI payment. E-ticket issued after payment confirmation.
          </p>
        </div>
      )}

      {/* ── STEP 2: UPI Payment Screen ── */}
      {step === 'PAYMENT' && upiInfo && bookingInfo && (
        <div className="card-gold-accent p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <p className="eyebrow mb-1">STEP 3 OF 3</p>
            <h2 className="font-serif-display text-2xl font-semibold" style={{ color: 'var(--maroon)' }}>
              Complete Your UPI Payment
            </h2>
            <p className="text-sm text-ink-soft mt-1">
              Scan the QR code, or copy the UPI ID below and pay via your UPI app.
            </p>
          </div>

          {/* Amount banner */}
          <div className="text-center p-4 rounded-xl bg-maroon/5 border-2 border-gold/60">
            <p className="text-xs font-bold uppercase tracking-wider text-bronze mb-1">Amount to Pay</p>
            <p className="font-num text-4xl font-bold text-maroon">₹{upiInfo.amount.toLocaleString()}</p>
            <p className="text-xs text-ink-soft mt-1">
              Booking: <span className="font-mono font-bold text-maroon">{bookingInfo.bookingId}</span>
              &nbsp;·&nbsp; {bookingInfo.ticketQty} ticket{bookingInfo.ticketQty > 1 ? 's' : ''}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-bronze">Scan with Any UPI App</p>
            <div className="p-3 rounded-xl bg-white border-2 border-gold/60 shadow-md inline-block">
              <img
                src={upiInfo.qrCodeDataUrl}
                alt="UPI QR Code"
                className="w-56 h-56"
              />
            </div>
            <p className="text-xs text-ink-soft">Or pay directly using this UPI ID:</p>
            <div className="w-full flex items-center gap-2 p-2 pl-4 rounded-lg border border-gold/60 bg-cream">
              <span className="flex-1 font-mono font-bold text-maroon text-sm select-all">
                {upiInfo.upiId}
              </span>
              <button
                type="button"
                onClick={handleCopyUpiId}
                className={`px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-colors shrink-0 ${
                  upiCopied
                    ? 'bg-emerald-700 text-white border border-emerald-500'
                    : 'bg-maroon text-white border border-gold hover:bg-maroon-soft'
                }`}
              >
                {upiCopied ? (
                  <>
                    <span>✅</span>
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-center text-ink-soft -mt-2">
            ⚠️ If you are buying 5 tickets or more, the QR code might not work — either scan it with a different phone, or enter the UPI ID above directly in your UPI app and pay.
          </p>

          {/* Transaction ID / UTR Input */}
          <div className="p-4 rounded-lg border border-gold/40 bg-sandal/20 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-bronze">
              UPI Transaction ID / UTR Number (12 Digits) <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={utrInput}
              onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="Enter the 12-digit Transaction ID / UTR from your UPI app"
              maxLength={12}
              className="input-luxe w-full font-mono text-sm"
            />
            <p className="text-xs text-ink-soft">
              Find this in your UPI app's payment history / receipt after paying. Required to confirm your payment.
            </p>
          </div>

          {/* Confirm button */}
          <button
            onClick={handlePaymentClaimed}
            disabled={submitting || utrInput.length !== 12}
            className="w-full luxe-button luxe-button-solid py-4 text-base shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {submitting ? (
              <span>⏳ Confirming...</span>
            ) : (
              <>
                <span>✅ I've Completed the Payment</span>
              </>
            )}
          </button>

          <p className="text-xs text-center text-ink-soft">
            Your booking will be confirmed within a few minutes. You'll receive a WhatsApp message and email with your e-ticket link.
          </p>

          <button
            onClick={() => { setStep('SELECT'); setError(''); }}
            className="w-full text-xs text-ink-soft hover:text-maroon underline text-center"
          >
            ← Back to ticket selection
          </button>
        </div>
      )}
    </div>
  );
}
