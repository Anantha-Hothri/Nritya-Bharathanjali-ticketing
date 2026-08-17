'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyBookingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  // Check for auto-search term from existing booking session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('skanda_customer_login') || sessionStorage.getItem('skanda_customer_login');
      if (stored) {
        const parsed = JSON.parse(stored);
        const term = parsed.phone || parsed.email || '';
        if (term) {
          setSearchQuery(term);
          fetchMyBookings(term);
        }
      }
    } catch (e) {}
  }, []);

  const fetchMyBookings = async (queryTerm) => {
    const term = queryTerm || searchQuery;
    if (!term.trim()) {
      setError('Please enter your phone number, email address, or booking ID.');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch(`/api/booking/customer-bookings?query=${encodeURIComponent(term.trim())}`);
      const data = await res.json();

      if (data.success) {
        setBookings(data.bookings);
      } else {
        setError(data.error || 'Failed to retrieve your bookings.');
      }
    } catch (err) {
      setError('Network error loading your bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMyBookings(searchQuery);
  };

  return (
    <div className="py-12 px-6 sm:px-10 max-w-4xl mx-auto" style={{ background: 'var(--ivory)' }}>
      {/* Page Header */}
      <div className="text-center mb-8">
        <p className="eyebrow mb-1">RECEIPT RETRIEVAL PORTAL</p>
        <h1 className="font-serif-display text-4xl font-bold" style={{ color: 'var(--maroon)' }}>
          My Bookings & Acknowledgement Receipts
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Enter your registered Mobile Number, Email, or Booking Reference ID (SKD-XXXXX) to view and download your official receipts.
        </p>
      </div>

      {/* SEARCH BOX CARD */}
      <div className="card-gold-accent p-6 mb-8 max-w-2xl mx-auto bg-white/90 shadow-md space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bronze mb-1.5">
              🔍 Search Mobile Number / Email / Booking Reference ID:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 9876543210, ramesh@example.com, or SKD-84920"
                className="input-luxe text-sm flex-1 py-2.5"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="luxe-button luxe-button-solid px-6 text-xs font-bold uppercase tracking-wider"
              >
                {loading ? 'SEARCHING...' : 'FIND RECEIPTS →'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="p-3 rounded bg-red-100 border border-red-300 text-red-800 text-xs font-bold text-center">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* BOOKINGS RESULTS LIST */}
      {loading ? (
        <div className="py-16 text-center text-ink-soft font-medium">
          ⏳ Searching database for your confirmed bookings...
        </div>
      ) : searched && bookings.length === 0 ? (
        <div className="card-gold-accent p-8 text-center space-y-4 max-w-xl mx-auto">
          <div className="text-4xl">🎟️</div>
          <h3 className="font-serif-display text-xl font-bold text-maroon">
            No Confirmed Bookings Found
          </h3>
          <p className="text-sm text-ink-soft">
            No confirmed paid bookings were found for <code className="bg-sandal px-1.5 py-0.5 rounded font-mono">{searchQuery}</code>.
          </p>
          <div className="pt-2">
            <Link href="/booking/login" className="luxe-button luxe-button-solid inline-block">
              BOOK TICKETS NOW &rarr;
            </Link>
          </div>
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gold/30">
            <h3 className="font-serif-display text-2xl font-bold text-maroon">
              Confirmed Booking Receipts ({bookings.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((b) => (
              <div key={b.id} className="card-gold-accent overflow-hidden border border-gold flex flex-col justify-between shadow-md hover:shadow-xl transition-all bg-[#FDFBF7]">
                {/* Receipt Card Header */}
                <div className="p-4 bg-cream border-b border-gold/40 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-bronze block">BOOKING REFERENCE</span>
                    <h4 className="font-mono text-lg font-extrabold text-maroon">{b.bookingId}</h4>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-sandal text-maroon border border-gold/60 rounded uppercase tracking-wider">
                    ✓ VERIFIED {b.paymentStatus}
                  </span>
                </div>

                {/* Receipt Body Info */}
                <div className="p-5 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 border-b border-gold/20 pb-3">
                    <div>
                      <span className="text-ink-soft block uppercase text-[10px]">BUYER NAME</span>
                      <strong className="text-ink text-sm block">{b.customerName}</strong>
                      <span className="text-[10px] text-bronze font-semibold">
                        {b.buyerType === 'MSN' ? 'MSN Student / Parent' : 'External Attendee'}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-soft block uppercase text-[10px]">TICKETS & AMOUNT</span>
                      <strong className="text-maroon font-num text-sm block">
                        {b.ticketQty} {b.ticketQty === 1 ? 'Ticket' : 'Tickets'}
                      </strong>
                      <span className="font-num text-ink-soft font-bold">₹{b.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-ink-soft block uppercase text-[10px]">EVENT DATE</span>
                      <span className="text-maroon font-semibold">Sept 26, 2026</span>
                    </div>
                    <div>
                      <span className="text-ink-soft block uppercase text-[10px]">BOOKED ON</span>
                      <span className="text-ink font-mono">{new Date(b.bookingDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Receipt CTA */}
                <div className="p-4 bg-sandal/30 border-t border-gold/30 text-center">
                  <Link
                    href={`/ticket/${b.bookingId}`}
                    className="w-full luxe-button luxe-button-solid py-2.5 text-xs inline-flex items-center justify-center gap-2"
                  >
                    <span>📄 VIEW & DOWNLOAD RECEIPT PDF</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Back to Home CTA */}
      <div className="mt-10 text-center">
        <Link href="/" className="luxe-button luxe-button-outline">
          &larr; BACK TO EVENT HOME PAGE
        </Link>
      </div>
    </div>
  );
}
