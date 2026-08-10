'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MSNBookingPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);

  const [batchCodeInput, setBatchCodeInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [validatedBatch, setValidatedBatch] = useState(null);
  const [codeError, setCodeError] = useState('');

  const [studentName, setStudentName] = useState('');
  const [ticketQty, setTicketQty] = useState(3);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const savedCustomer = sessionStorage.getItem('skanda_customer_login');
    if (!savedCustomer) {
      router.push('/booking/login');
      return;
    }
    setCustomer(JSON.parse(savedCustomer));

    const savedType = sessionStorage.getItem('skanda_buyer_type');
    if (savedType !== 'MSN') {
      sessionStorage.setItem('skanda_buyer_type', 'MSN');
    }
  }, [router]);

  const handleValidateCode = async (e) => {
    e.preventDefault();
    setCodeError('');
    setValidatedBatch(null);

    if (!batchCodeInput.trim()) {
      setCodeError('Please enter your MSN Batch Code.');
      return;
    }

    setValidating(true);
    try {
      const res = await fetch('/api/booking/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchCode: batchCodeInput.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setValidatedBatch(data.batch);
        // Default to minimum 3 tickets
        setTicketQty(3);
      } else {
        setCodeError(data.error || 'Invalid batch code.');
      }
    } catch (err) {
      setCodeError('Network error validating batch code.');
    } finally {
      setValidating(false);
    }
  };

  const handleProceedToSummary = (e) => {
    e.preventDefault();
    setFormError('');

    if (!studentName.trim()) {
      setFormError('Please enter the Student / Child Full Name.');
      return;
    }

    if (ticketQty < 3) {
      setFormError('MSN Student/Parent bookings require a minimum of 3 tickets.');
      return;
    }

    if (validatedBatch && ticketQty > validatedBatch.remainingCount) {
      setFormError(`Only ${validatedBatch.remainingCount} tickets are remaining for this batch allocation.`);
      return;
    }

    const msnBookingData = {
      buyerType: 'MSN',
      customerName: customer.customerName,
      phone: customer.phone,
      whatsapp: customer.whatsapp,
      isWhatsappSame: customer.isWhatsappSame,
      email: customer.email,
      studentName: studentName.trim(),
      batchName: validatedBatch.batchName,
      batchCode: validatedBatch.batchCode,
      allocatedRow: validatedBatch.assignedRows.join(', '),
      ticketQty,
      ticketPrice: validatedBatch.ticketPrice,
      totalAmount: ticketQty * validatedBatch.ticketPrice,
    };

    sessionStorage.setItem('skanda_booking_draft', JSON.stringify(msnBookingData));
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
          ✓ 2. MSN Category
        </div>
        <div className="flex items-center gap-2 text-maroon font-bold">
          <span className="step-badge">3</span>
          <span>Batch & Tickets</span>
        </div>
        <div className="opacity-40">4. Payment</div>
      </div>

      <div className="card-gold-accent p-6 sm:p-8 space-y-6">
        <div className="text-center">
          <p className="eyebrow mb-1">MSN STUDENT / PARENT BOOKING</p>
          <h2 className="font-serif-display text-3xl font-semibold" style={{ color: 'var(--maroon)' }}>
            Batch Code Validation
          </h2>
          <p className="text-sm text-ink-soft mt-1">
            Enter the unique Batch Code provided by your instructor to unlock your assigned rows.
          </p>
        </div>

        {/* STEP A: Enter Batch Code */}
        {!validatedBatch ? (
          <form onSubmit={handleValidateCode} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bronze mb-1.5">
                Class / Batch Code <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={batchCodeInput}
                  onChange={(e) => setBatchCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SKANDA-G4"
                  className="input-luxe text-lg tracking-wider font-mono uppercase"
                  required
                />
                <button
                  type="submit"
                  disabled={validating}
                  className="luxe-button luxe-button-solid whitespace-nowrap px-6"
                >
                  {validating ? 'VALIDATING...' : 'VERIFY CODE'}
                </button>
              </div>
              <p className="text-xs text-ink-soft mt-1">
                Example demo batch codes: <code className="bg-sandal px-1 rounded">SKANDA-G4</code>, <code className="bg-sandal px-1 rounded">SKANDA-SENIOR</code>, <code className="bg-sandal px-1 rounded">SKANDA-JUNIOR</code>
              </p>
            </div>

            {codeError && (
              <div className="p-3 rounded bg-red-100 border border-red-300 text-red-800 text-sm">
                ❌ {codeError}
              </div>
            )}
          </form>
        ) : (
          /* STEP B: Validated Batch Details & Ticket Selection */
          <form onSubmit={handleProceedToSummary} className="space-y-6 pt-2">
            {/* Batch Info Card */}
            <div className="p-4 rounded-lg bg-cream border border-gold space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-bronze">VALIDATED BATCH</span>
                  <h3 className="font-serif-display text-2xl font-semibold text-maroon">
                    {validatedBatch.batchName}
                  </h3>
                  <span className="inline-block px-2 py-0.5 text-xs font-mono font-bold bg-maroon text-ivory rounded mt-1">
                    CODE: {validatedBatch.batchCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setValidatedBatch(null)}
                  className="text-xs text-maroon underline hover:text-maroon-deep font-medium"
                >
                  Change Code
                </button>
              </div>

              <div className="pt-2 border-t border-gold/40 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-ink-soft block">ASSIGNED AUDITORIUM ROWS</span>
                  <strong className="text-maroon font-serif-display text-base">
                    {validatedBatch.assignedRows.join(', ')}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-ink-soft block">AVAILABLE TICKETS</span>
                  <strong className="text-maroon font-mono">
                    {validatedBatch.remainingCount} tickets remaining
                  </strong>
                </div>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded bg-red-100 border border-red-300 text-red-800 text-sm">
                ⚠️ {formError}
              </div>
            )}

            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bronze mb-1.5">
                Student / Child Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Ananya Ramesh"
                className="input-luxe"
                required
              />
            </div>

            {/* Ticket Quantity Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bronze mb-1.5">
                Number of Tickets <span className="text-red-600">*</span> (MINIMUM 3 TICKETS)
              </label>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setTicketQty((q) => Math.max(3, q - 1))}
                  disabled={ticketQty <= 3}
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
                  onClick={() => setTicketQty((q) => Math.min(validatedBatch.remainingCount, q + 1))}
                  disabled={ticketQty >= validatedBatch.remainingCount}
                  className="w-12 h-12 rounded border border-gold bg-sandal text-xl font-bold flex items-center justify-center disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <p className="text-xs text-maroon font-medium mt-2">
                🔒 System constraint: MSN Student/Parent bookings require at least 3 tickets.
              </p>
            </div>

            {/* Price Summary Box */}
            <div className="p-4 rounded border border-gold/40 bg-sandal/30 flex justify-between items-center">
              <div>
                <span className="text-xs text-ink-soft block uppercase">TICKET AMOUNT</span>
                <span className="text-sm font-semibold text-ink">
                  {ticketQty} Tickets × ₹{validatedBatch.ticketPrice}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-ink-soft block uppercase">TOTAL COST</span>
                <span className="font-num text-2xl font-bold text-maroon">
                  ₹{(ticketQty * validatedBatch.ticketPrice).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full luxe-button luxe-button-solid py-4 text-base shadow-md"
            >
              PROCEED TO BOOKING SUMMARY & PAYMENT &rarr;
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
