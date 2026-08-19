'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentContent() {
  const searchParams = useSearchParams();
  const merchantTransactionId = searchParams.get('merchantTransactionId') || searchParams.get('txnId');

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusState, setStatusState] = useState(null); // 'CHECKING' | 'SUCCESS' | 'FAILED' | 'PENDING'
  const [transactionData, setTransactionData] = useState(null);

  // Check payment status on return from PhonePe
  useEffect(() => {
    if (merchantTransactionId) {
      verifyPaymentStatus(merchantTransactionId);
    }
  }, [merchantTransactionId]);

  const verifyPaymentStatus = async (txId) => {
    setStatusState('CHECKING');
    setError('');

    try {
      const response = await fetch(`/api/payment/status/${txId}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await response.json();

      if (data.success) {
        setTransactionData(data);
        if (data.status === 'SUCCESS') {
          setStatusState('SUCCESS');
        } else if (data.status === 'FAILED') {
          setStatusState('FAILED');
        } else {
          setStatusState('PENDING');
        }
      } else {
        setError(data.error || 'Failed to verify payment status.');
        setStatusState('FAILED');
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      setError('Network error verifying payment status with server.');
      setStatusState('FAILED');
    }
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side Validation
    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0 || !isFinite(numericAmount)) {
      setError('Please enter a valid amount greater than ₹0');
      return;
    }

    if (numericAmount > 500000) {
      setError('Amount exceeds maximum allowed limit of ₹5,00,000');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numericAmount }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Payment creation failed');
        setLoading(false);
        return;
      }

      if (data.redirectUrl) {
        // Redirect to PhonePe Checkout Experience
        window.location.href = data.redirectUrl;
      } else {
        setError('PhonePe redirect URL not received.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error creating payment request:', err);
      setError('Network error processing payment. Please try again.');
      setLoading(false);
    }
  };

  // Status Screen UI for Returning from PhonePe
  if (statusState === 'CHECKING') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="card-gold-accent max-w-md w-full p-8 text-center rounded-xl bg-white shadow-xl">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-maroon mb-4"></div>
          <h2 className="text-xl font-bold text-maroon mb-2">Verifying Payment...</h2>
          <p className="text-sm text-gray-600">Please wait while we check your payment status with PhonePe.</p>
        </div>
      </div>
    );
  }

  if (statusState === 'SUCCESS') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="card-gold-accent max-w-md w-full p-8 text-center rounded-xl bg-white shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-emerald-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 text-sm mb-6">Your payment has been verified by PhonePe.</p>

          {transactionData && (
            <div className="bg-cream/50 p-4 rounded-lg border border-gold/30 text-left text-xs text-gray-700 space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Transaction ID:</span>
                <span className="font-mono">{transactionData.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Amount Paid:</span>
                <span className="font-bold text-maroon">₹ {transactionData.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Status:</span>
                <span className="text-emerald-700 font-bold uppercase">PAID</span>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setStatusState(null);
              setAmount('');
              setTransactionData(null);
              window.history.replaceState({}, '', '/payment');
            }}
            className="w-full py-3 px-4 bg-maroon text-white font-semibold rounded-lg hover:bg-maroon-soft transition-colors shadow"
          >
            Make Another Payment
          </button>
        </div>
      </div>
    );
  }

  if (statusState === 'FAILED') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="card-gold-accent max-w-md w-full p-8 text-center rounded-xl bg-white shadow-xl">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            ✕
          </div>
          <h2 className="text-2xl font-bold text-rose-800 mb-2">Payment Failed</h2>
          <p className="text-gray-600 text-sm mb-4">The payment was not completed or was declined.</p>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded mb-6 text-left">
              {error}
            </div>
          )}

          <button
            onClick={() => {
              setStatusState(null);
              setError('');
              window.history.replaceState({}, '', '/payment');
            }}
            className="w-full py-3 px-4 bg-maroon text-white font-semibold rounded-lg hover:bg-maroon-soft transition-colors shadow"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (statusState === 'PENDING') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="card-gold-accent max-w-md w-full p-8 text-center rounded-xl bg-white shadow-xl">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            ⏳
          </div>
          <h2 className="text-2xl font-bold text-amber-800 mb-2">Payment Pending</h2>
          <p className="text-gray-600 text-sm mb-6">Your payment is currently processing with PhonePe.</p>

          <div className="flex gap-3">
            <button
              onClick={() => verifyPaymentStatus(merchantTransactionId)}
              className="flex-1 py-2.5 px-4 bg-amber-600 text-white font-semibold text-xs uppercase tracking-wider rounded hover:bg-amber-700 transition-colors shadow"
            >
              Refresh Status
            </button>
            <button
              onClick={() => {
                setStatusState(null);
                window.history.replaceState({}, '', '/payment');
              }}
              className="flex-1 py-2.5 px-4 border border-gold text-maroon font-semibold text-xs uppercase tracking-wider rounded hover:bg-cream transition-colors"
            >
              New Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Initial Payment Form (ENTER_AMOUNT)
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <div className="card-gold-accent max-w-md w-full p-8 rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-cream text-maroon mb-3">
            💳
          </div>
          <h1 className="text-2xl font-bold text-maroon">Make Payment</h1>
          <p className="text-xs text-gray-500 mt-1">Powered by PhonePe Secure Checkout</p>
        </div>

        {/* Form */}
        <form onSubmit={handlePayNow} className="space-y-6">
          <div>
            <label htmlFor="amount-input" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Enter Amount
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-bold text-lg">
                ₹
              </div>
              <input
                id="amount-input"
                type="number"
                step="any"
                min="1"
                placeholder="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                className="input-luxe pl-10 text-xl font-semibold text-gray-900 placeholder-gray-400 focus:ring-maroon focus:border-maroon"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 font-semibold text-sm uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-maroon hover:bg-maroon-soft text-white hover:shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                <span>Initiating PhonePe Checkout...</span>
              </>
            ) : (
              <span>Pay Now</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-gray-100 text-center text-[11px] text-gray-400">
          🔒 256-Bit Encrypted PhonePe Payment Gateway
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gold border-t-maroon"></div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
