'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MiniSeatingChart from '../../../components/MiniSeatingChart';

export default function MyBookingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

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
    <div className="py-12 px-6 sm:px-10 max-w-6xl mx-auto" style={{ background: 'var(--ivory)' }}>
      {/* Page Header */}
      <div className="text-center mb-8">
        <p className="eyebrow mb-1">RECEIPT & SEAT RETRIEVAL PORTAL</p>
        <h1 className="font-serif-display text-4xl font-bold" style={{ color: 'var(--maroon)' }}>
          My Bookings & Seat Allocation Receipts
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Enter your registered Mobile Number, Email, or Booking Reference ID (SKD-XXXXX) to view allocated seats and download official receipts.
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
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-gold/30">
            <h3 className="font-serif-display text-2xl font-bold text-maroon">
              Confirmed Booking Receipts ({bookings.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((b) => {
              const isAllocated = b.allocationStatus === 'ALLOCATED' && b.allocatedSeats;
              return (
                <div key={b.id} className="card-gold-accent overflow-hidden border-2 border-gold shadow-lg bg-[#FDFBF7] space-y-4 p-5 flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gold/30 pb-3 mb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-bronze block">BOOKING REFERENCE</span>
                        <h4 className="font-mono text-xl font-extrabold text-maroon">{b.bookingId}</h4>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider ${
                        isAllocated
                          ? 'bg-emerald-800 text-white shadow-sm'
                          : b.paymentStatus === 'PAID'
                          ? 'bg-sandal text-maroon border border-gold/60 shadow-sm'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {isAllocated
                          ? '✓ Seats Allocated!'
                          : b.paymentStatus === 'PAID'
                          ? '✓ Payment Verified'
                          : 'Pending...'}
                      </span>
                    </div>

                    {/* Seat Allocation Badge */}
                    <div className={`p-3.5 rounded-lg border mb-4 ${
                      isAllocated
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}>
                      <div className="text-[10px] uppercase font-bold text-bronze block">SEAT ALLOCATION STATUS</div>
                      {isAllocated ? (
                        <div className="mt-1">
                          <strong className="font-mono text-lg text-emerald-900 block">
                            Your Seats: {b.allocatedSeats}
                          </strong>
                          <span className="text-[11px] text-emerald-700 block mt-0.5">
                            Assigned & Confirmed by Organizers
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1 text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                          <span>⏳</span>
                          <span>Seat allocation pending. You will be notified shortly via WhatsApp and Email.</span>
                        </div>
                      )}
                    </div>

                    {/* Booking Info */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-white/70 p-3.5 rounded border border-gold/30">
                      <div>
                        <span className="text-ink-soft block uppercase text-[10px]">CUSTOMER NAME</span>
                        <strong className="text-ink text-xs font-semibold truncate block">{b.customerName}</strong>
                      </div>

                      <div>
                        <span className="text-ink-soft block uppercase text-[10px]">TICKETS</span>
                        <strong className="text-maroon font-num text-xs font-semibold block">
                          {b.ticketQty} {b.ticketQty === 1 ? 'Ticket' : 'Tickets'}
                        </strong>
                      </div>

                      <div>
                        <span className="text-ink-soft block uppercase text-[10px]">TOTAL AMOUNT</span>
                        <strong className="text-maroon font-num text-xs font-semibold block">₹{b.totalAmount}</strong>
                      </div>

                      <div>
                        <span className="text-ink-soft block uppercase text-[10px]">EVENT DATE</span>
                        <strong className="text-maroon text-xs block">Sept 26, 2026</strong>
                      </div>
                    </div>
                  </div>

                  {/* Receipt CTA */}
                  <div className="pt-2 mt-auto">
                    <Link
                      href={`/ticket/${b.bookingId}`}
                      className="w-full luxe-button luxe-button-solid py-2.5 text-xs inline-flex items-center justify-center gap-2"
                    >
                      <span>📄 VIEW & DOWNLOAD RECEIPT PDF</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              );
            })}
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
