'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentsVerificationPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [txnInputs, setTxnInputs] = useState({}); // { [bookingId]: value }
  const [confirmingId, setConfirmingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pending-payments');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setPendingPayments(data.bookings);
      }
    } catch (e) {
      console.error('Error loading pending payments:', e);
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const cleanName = (name) => {
    if (!name) return '';
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  };

  const handleTxnInputChange = (bookingId, value) => {
    setTxnInputs((prev) => ({ ...prev, [bookingId]: value.toUpperCase() }));
  };

  const handleVerify = async (booking) => {
    const transactionId = (txnInputs[booking.bookingId] || booking.utrNumber || '').trim();

    if (
      !window.confirm(
        `Approve payment for ${cleanName(booking.customerName)} (${booking.bookingId})?\n\nAmount: ₹${booking.totalAmount}${booking.utrNumber ? `\nSubmitted UTR: ${booking.utrNumber}` : ''}\n\nThis will mark the booking as PAID and automatically issue the e-ticket via WhatsApp & Email.`
      )
    ) {
      return;
    }

    setConfirmingId(booking.bookingId);
    try {
      const res = await fetch('/api/admin/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          verifiedTransactionId: transactionId || booking.utrNumber || 'MANUAL_VERIFIED',
        }),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`✅ Payment approved for ${cleanName(booking.customerName)}! E-ticket issued.`);
        setPendingPayments((prev) => prev.filter((b) => b.bookingId !== booking.bookingId));
        setTxnInputs((prev) => {
          const next = { ...prev };
          delete next[booking.bookingId];
          return next;
        });
      } else {
        triggerToast(`❌ Error approving payment: ${data.error}`);
      }
    } catch (e) {
      triggerToast('❌ Network error approving payment.');
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="py-8 px-6 sm:px-10 max-w-[1600px] mx-auto min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-emerald-400 font-bold text-xs animate-bounce flex items-center gap-2">
          <span>🔔</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="ml-3 text-white font-bold">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#D4AF37]/30">
        <div>
          <h1 className="font-serif-display text-2xl font-semibold text-[#6B1A2B] flex items-center gap-2">
            <span>💵</span>
            <span>Manual Payments Verification</span>
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Check the customer details & submitted UTR below against your UPI app, then click <strong>Verify & Approve</strong>.
          </p>
        </div>
        <button
          onClick={loadPendingPayments}
          className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded border border-gold bg-cream hover:bg-sandal text-[#6B1A2B] shadow-sm flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-ink-soft font-medium">
          ⏳ Loading pending payments...
        </div>
      ) : pendingPayments.length === 0 ? (
        <div className="card-gold-accent p-10 text-center bg-white/80 shadow-md">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-ink-soft font-medium">No pending payments awaiting verification.</p>
          <p className="text-xs text-ink-soft/70 mt-1">Bookings appear here once a customer submits their UPI payment details.</p>
        </div>
      ) : (
        <div className="card-gold-accent p-6 space-y-4 bg-white/90 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-display text-lg font-semibold text-[#6B1A2B]">
              Awaiting Verification ({pendingPayments.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#6B1A2B] text-ivory font-marcellus uppercase tracking-wider">
                  <th className="p-2.5">Booking ID</th>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5">Phone / WhatsApp</th>
                  <th className="p-2.5 text-right">Tickets</th>
                  <th className="p-2.5 text-right">Amount (₹)</th>
                  <th className="p-2.5">Time Claimed</th>
                  <th className="p-2.5">Submitted UTR / Ref</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/30">
                {pendingPayments.map((b) => (
                  <tr key={b.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-2.5 font-mono font-bold text-[#6B1A2B]">{b.bookingId}</td>
                    <td className="p-2.5 font-semibold text-ink">{cleanName(b.customerName)}</td>
                    <td className="p-2.5 font-mono">{b.whatsapp || b.phone}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-900">{b.ticketQty}</td>
                    <td className="p-2.5 text-right font-num font-bold text-maroon">₹{b.totalAmount}</td>
                    <td className="p-2.5 text-ink-soft">
                      {b.upiPaymentAt
                        ? new Date(b.upiPaymentAt).toLocaleString('en-IN', {
                            hour: '2-digit', minute: '2-digit', hour12: true,
                            day: '2-digit', month: 'short',
                          })
                        : '—'}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-amber-900">
                      {b.utrNumber ? (
                        <span className="bg-amber-100 px-2 py-1 rounded border border-amber-300">
                          {b.utrNumber}
                        </span>
                      ) : (
                        <input
                          type="text"
                          value={txnInputs[b.bookingId] || ''}
                          onChange={(e) => handleTxnInputChange(b.bookingId, e.target.value)}
                          placeholder="Optional UTR..."
                          maxLength={30}
                          className="w-full p-1 rounded border border-gold/60 bg-cream/50 font-mono text-xs focus:outline-none focus:border-[#6B1A2B]"
                        />
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => handleVerify(b)}
                        disabled={confirmingId === b.bookingId}
                        className="px-3.5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold disabled:opacity-50 shadow-sm whitespace-nowrap cursor-pointer transition-all hover:scale-[1.02]"
                      >
                        {confirmingId === b.bookingId ? '⏳ Approving...' : '✅ Verify & Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs bg-amber-50 p-3 rounded border border-amber-200 space-y-1">
            <p className="font-bold text-amber-900">👉 Simple 1-Click Verification:</p>
            <ol className="space-y-0.5 text-amber-800 ml-3 list-decimal">
              <li>Check your UPI app (GPay / PhonePe / Paytm) for money received from the customer phone/name</li>
              <li>Verify the amount & submitted UTR shown in the table</li>
              <li>Click <strong>"Verify & Approve"</strong> — the customer's e-ticket is generated and sent via WhatsApp & Email automatically</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
