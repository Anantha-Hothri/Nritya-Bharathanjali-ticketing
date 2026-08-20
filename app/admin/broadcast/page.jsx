'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminBroadcastPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  // Recipient Filters State
  const [studentType, setStudentType] = useState('BOTH'); // 'MSN' | 'EXTERNAL' | 'BOTH'
  const [paymentStatus, setPaymentStatus] = useState('BOTH'); // 'PAID' | 'UNPAID' | 'BOTH'
  const [seatAllocation, setSeatAllocation] = useState('BOTH'); // 'ALLOCATED' | 'NOT_ALLOCATED' | 'BOTH'

  // Composer State
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);

  // Action State
  const [sendingChannel, setSendingChannel] = useState(null); // 'EMAIL' | null
  const [alertFeedback, setAlertFeedback] = useState(null); // { type: 'success'|'warning'|'error', text: '' }

  // Recipient Details Table Search
  const [recipientSearch, setRecipientSearch] = useState('');

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    loadBookingsData();
  }, []);

  const loadBookingsData = async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error('Error fetching bookings for broadcast filters:', e);
    } finally {
      setLoading(false);
    }
  };

  const cleanName = (name) => {
    if (!name) return '';
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  };

  // Filter Bookings Live based on the 3 AND Conditions
  const matchedRecipients = bookings.filter((b) => {
    // 1. Student Type Filter
    if (studentType === 'MSN' && b.buyerType !== 'MSN') return false;
    if (studentType === 'EXTERNAL' && b.buyerType === 'MSN') return false;

    // 2. Payment Status Filter
    if (paymentStatus === 'PAID' && b.paymentStatus !== 'PAID') return false;
    if (paymentStatus === 'UNPAID' && b.paymentStatus === 'PAID') return false;

    // 3. Seat Allocation Filter
    const isAllocated = b.allocationStatus === 'ALLOCATED' && b.allocatedSeats;
    if (seatAllocation === 'ALLOCATED' && !isAllocated) return false;
    if (seatAllocation === 'NOT_ALLOCATED' && isAllocated) return false;

    return true;
  });

  const matchedCount = matchedRecipients.length;

  // Filter matched recipients by search input query
  const filteredMatchedRecipients = matchedRecipients.filter((b) => {
    if (!recipientSearch || !recipientSearch.trim()) return true;
    const query = recipientSearch.toLowerCase().trim();
    return (
      (b.bookingId && b.bookingId.toLowerCase().includes(query)) ||
      (b.customerName && b.customerName.toLowerCase().includes(query)) ||
      (b.studentName && b.studentName.toLowerCase().includes(query)) ||
      (b.phone && b.phone.includes(query)) ||
      (b.whatsapp && b.whatsapp.includes(query)) ||
      (b.email && b.email.toLowerCase().includes(query))
    );
  });

  // File Upload Handlers
  const handleFileUpload = (e, isImageOnly = false) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        const newAttachment = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          isImage: isImageOnly || file.type.startsWith('image/'),
          data: base64Data,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    // Reset inputs
    if (e.target) e.target.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Send Broadcast Action
  const handleSendBroadcast = async (channel) => {
    if (!message || !message.trim()) {
      setAlertFeedback({
        type: 'error',
        text: 'Please type a message before sending.',
      });
      return;
    }

    if (matchedCount === 0) {
      setAlertFeedback({
        type: 'error',
        text: 'No recipients matched the current filters.',
      });
      return;
    }

    setSendingChannel(channel);
    setAlertFeedback(null);

    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          studentType,
          paymentStatus,
          seatAllocation,
          message,
          attachments,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.failedCount === 0) {
          setAlertFeedback({
            type: 'success',
            text: `✅ Emails sent to ${data.sentCount} recipients successfully.`,
          });
        } else {
          setAlertFeedback({
            type: 'warning',
            text: `⚠️ ${data.sentCount} sent successfully. ${data.failedCount} failed — invalid numbers/emails.`,
          });
        }
      } else {
        setAlertFeedback({
          type: 'error',
          text: data.error || 'Failed to send broadcast.',
        });
      }
    } catch (e) {
      setAlertFeedback({
        type: 'error',
        text: 'Network error sending broadcast messages.',
      });
    } finally {
      setSendingChannel(null);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-8 max-w-[1400px] mx-auto min-h-screen space-y-6">
      {/* Top Banner Alert Feedback */}
      {alertFeedback && (
        <div
          className={`p-4 rounded-lg font-bold text-xs shadow-md border flex justify-between items-center animate-fadeIn ${
            alertFeedback.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-400'
              : alertFeedback.type === 'warning'
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-red-900 text-white border-red-500'
          }`}
        >
          <span>{alertFeedback.text}</span>
          <button
            onClick={() => setAlertFeedback(null)}
            className="ml-4 font-black hover:opacity-75"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-ink-soft font-semibold text-sm">
          ⏳ Loading live bookings database & recipient stats...
        </div>
      ) : (
        <div className="space-y-6">
          {/* ================= SECTION 1 — RECIPIENT FILTERS ================= */}
          <div className="card-gold-accent p-6 bg-white/90 shadow-md space-y-5 border-2 border-[#D4AF37]">
            <div className="border-b border-[#D4AF37]/30 pb-3 flex justify-between items-start flex-wrap gap-2">
              <div>
                <h2 className="font-serif-display text-lg sm:text-xl font-bold text-[#6B1A2B] uppercase tracking-wide">
                  FILTERS — Who should receive this message?
                </h2>
                <p className="text-xs text-ink-soft mt-0.5">
                  Select target criteria below. All three filters apply simultaneously to match recipients.
                </p>
              </div>

              {/* Matched Recipients Counter Badge */}
              <div className="px-4 py-2 rounded-lg bg-[#6B1A2B] text-white border border-[#D4AF37] shadow-sm flex items-center gap-2 font-mono">
                <span className="text-base">👥</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FAF6EF]">
                  Recipients matched: <strong className="text-[#D4AF37] text-sm font-black">{matchedCount}</strong> people
                </span>
              </div>
            </div>

            {/* Filter Toggle Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              {/* Filter 1: Student Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B1A2B]">
                  1. Student Type
                </label>
                <div className="flex rounded-lg border border-[#D4AF37] bg-[#FAF6EF] overflow-hidden p-1 gap-1">
                  <button
                    onClick={() => setStudentType('MSN')}
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded transition-colors ${
                      studentType === 'MSN'
                        ? 'bg-[#6B1A2B] text-white shadow-sm'
                        : 'text-[#6B1A2B] hover:bg-sandal'
                    }`}
                  >
                    MSN Student
                  </button>
                  <button
                    onClick={() => setStudentType('EXTERNAL')}
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded transition-colors ${
                      studentType === 'EXTERNAL'
                        ? 'bg-[#6B1A2B] text-white shadow-sm'
                        : 'text-[#6B1A2B] hover:bg-sandal'
                    }`}
                  >
                    External
                  </button>
                  <button
                    onClick={() => setStudentType('BOTH')}
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded transition-colors ${
                      studentType === 'BOTH'
                        ? 'bg-[#6B1A2B] text-white shadow-sm'
                        : 'text-[#6B1A2B] hover:bg-sandal'
                    }`}
                  >
                    Both
                  </button>
                </div>
              </div>

              {/* Filter 2: Payment Status */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B1A2B]">
                  2. Payment Status
                </label>
                <div className="flex rounded-lg border border-[#D4AF37] bg-[#FAF6EF] overflow-hidden p-1 gap-1">
                  <button
                    onClick={() => setPaymentStatus('PAID')}
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded transition-colors ${
                      paymentStatus === 'PAID'
                        ? 'bg-[#6B1A2B] text-white shadow-sm'
                        : 'text-[#6B1A2B] hover:bg-sandal'
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    onClick={() => setPaymentStatus('UNPAID')}
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded transition-colors ${
                      paymentStatus === 'UNPAID'
                        ? 'bg-[#6B1A2B] text-white shadow-sm'
                        : 'text-[#6B1A2B] hover:bg-sandal'
                    }`}
                  >
                    Unpaid
                  </button>
                  <button
                    onClick={() => setPaymentStatus('BOTH')}
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded transition-colors ${
                      paymentStatus === 'BOTH'
                        ? 'bg-[#6B1A2B] text-white shadow-sm'
                        : 'text-[#6B1A2B] hover:bg-sandal'
                    }`}
                  >
                    Both
                  </button>
                </div>
              </div>

              {/* Filter 3: Seat Allocation */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B1A2B]">
                  3. Seat Allocation
                </label>
                <div className="flex rounded-lg border border-[#D4AF37] bg-[#FAF6EF] overflow-hidden p-1 gap-1">
                  <button
                    onClick={() => setSeatAllocation('ALLOCATED')}
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded transition-colors ${
                      seatAllocation === 'ALLOCATED'
                        ? 'bg-[#6B1A2B] text-white shadow-sm'
                        : 'text-[#6B1A2B] hover:bg-sandal'
                    }`}
                  >
                    Seats Allocated
                  </button>
                  <button
                    onClick={() => setSeatAllocation('NOT_ALLOCATED')}
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded transition-colors ${
                      seatAllocation === 'NOT_ALLOCATED'
                        ? 'bg-[#6B1A2B] text-white shadow-sm'
                        : 'text-[#6B1A2B] hover:bg-sandal'
                    }`}
                  >
                    Not Allocated
                  </button>
                  <button
                    onClick={() => setSeatAllocation('BOTH')}
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded transition-colors ${
                      seatAllocation === 'BOTH'
                        ? 'bg-[#6B1A2B] text-white shadow-sm'
                        : 'text-[#6B1A2B] hover:bg-sandal'
                    }`}
                  >
                    Both
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 2 — MESSAGE COMPOSER ================= */}
          <div className="card-gold-accent p-6 bg-white/90 shadow-md space-y-4 border-2 border-[#D4AF37]">
            <div className="border-b border-[#D4AF37]/30 pb-2">
              <h2 className="font-serif-display text-lg sm:text-xl font-bold text-[#6B1A2B] uppercase tracking-wide">
                MESSAGE COMPOSER
              </h2>
            </div>

            {/* Textarea Input */}
            <div>
              <textarea
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your broadcast message text here... (e.g. Important updates regarding venue timing, entry pass guidelines, and auditorium seating rules)"
                className="w-full p-4 rounded-lg border-2 border-[#D4AF37]/60 bg-[#FAF6EF] text-[#2C1810] text-sm focus:outline-none focus:border-[#6B1A2B] focus:ring-1 focus:ring-[#6B1A2B] font-sans placeholder-gray-400 shadow-inner"
              />
            </div>

            {/* Hidden File & Image Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e, false)}
              multiple
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
            />
            <input
              type="file"
              ref={imageInputRef}
              onChange={(e) => handleFileUpload(e, true)}
              multiple
              accept="image/*"
              className="hidden"
            />

            {/* Attachment Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="px-4 py-2 rounded-lg bg-[#FAF6EF] text-[#6B1A2B] border border-[#D4AF37] hover:bg-[#F5E6CA] text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>📎</span>
                <span>Attach File</span>
              </button>

              <button
                type="button"
                onClick={() => imageInputRef.current && imageInputRef.current.click()}
                className="px-4 py-2 rounded-lg bg-[#FAF6EF] text-[#6B1A2B] border border-[#D4AF37] hover:bg-[#F5E6CA] text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>🖼️</span>
                <span>Attach Image</span>
              </button>
            </div>

            {/* Dismissible Attachment Tags List */}
            {attachments.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="px-3 py-1.5 rounded-full bg-[#6B1A2B] text-white border border-[#D4AF37] text-xs font-semibold flex items-center gap-2 shadow-sm animate-fadeIn"
                  >
                    <span>{file.isImage ? '🖼️' : '📎'}</span>
                    <span>{file.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">({formatFileSize(file.size)})</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file.id)}
                      className="ml-1 text-white hover:text-amber-300 font-bold"
                      title="Remove attachment"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= SECTION 3 — SEND BUTTONS ================= */}
          <div className="card-gold-accent p-6 bg-white/90 shadow-md border-2 border-[#D4AF37] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-ink-soft">
              Messages will be dispatched to the <strong className="text-[#6B1A2B]">{matchedCount}</strong> currently matched recipients live.
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              {/* Email Broadcast Send Button */}
              <button
                onClick={() => handleSendBroadcast('EMAIL')}
                disabled={sendingChannel !== null || !message.trim() || matchedCount === 0}
                className={`flex-1 sm:flex-initial px-6 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 border-2 ${
                  sendingChannel !== null || !message.trim() || matchedCount === 0
                    ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                    : 'bg-[#6B1A2B] hover:bg-[#8B2338] text-white border-[#D4AF37] cursor-pointer hover:scale-[1.02]'
                }`}
              >
                <span className="text-base">📧</span>
                <span>
                  {sendingChannel === 'EMAIL'
                    ? 'Sending Emails...'
                    : `Send Email to ${matchedCount} people`}
                </span>
              </button>
            </div>
          </div>

          {/* ================= SECTION 4 — MATCHED RECIPIENTS DETAILS ================= */}
          <div className="card-gold-accent p-6 bg-white/90 shadow-md space-y-4 border-2 border-[#D4AF37]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/30 pb-3">
              <div>
                <h2 className="font-serif-display text-lg sm:text-xl font-bold text-[#6B1A2B] uppercase tracking-wide flex items-center gap-2">
                  <span>👥</span>
                  <span>Matched Recipients Details ({matchedCount} People)</span>
                </h2>
                <p className="text-xs text-ink-soft mt-0.5">
                  Live details of individuals matching the selected filters above.
                </p>
              </div>

              {/* Local Search input for matched recipients */}
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  placeholder="Search name, phone, email, booking ID..."
                  className="w-full px-3 py-1.5 rounded border border-[#D4AF37] bg-[#FAF6EF] text-xs text-[#2C1810] focus:outline-none focus:border-[#6B1A2B]"
                />
              </div>
            </div>

            {/* Active Filter Badges Summary */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#6B1A2B]">
              <span className="text-ink-soft">Active Filters:</span>
              <span className="px-2.5 py-0.5 rounded bg-amber-100 border border-amber-300">
                Type: <strong>{studentType === 'BOTH' ? 'MSN & External' : studentType}</strong>
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-950">
                Payment: <strong>{paymentStatus}</strong>
              </span>
              <span className="px-2.5 py-0.5 rounded bg-blue-100 border border-blue-300 text-blue-950">
                Seats: <strong>{seatAllocation === 'BOTH' ? 'Allocated & Not Allocated' : seatAllocation === 'ALLOCATED' ? 'Allocated Only' : 'Not Allocated Only'}</strong>
              </span>
            </div>

            {/* Recipient Details Table */}
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-[#D4AF37]/40 rounded-lg shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-[#6B1A2B] text-[#FAF6EF] font-serif-display uppercase tracking-wider shadow-sm">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Booking ID</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Customer & Student Name</th>
                    <th className="p-3">Phone / WhatsApp</th>
                    <th className="p-3">Email</th>
                    <th className="p-3 text-center">Payment</th>
                    <th className="p-3 text-center">Seats</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/30 bg-white">
                  {filteredMatchedRecipients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-ink-soft font-medium">
                        {matchedCount === 0
                          ? 'No recipients match the selected filters.'
                          : 'No recipients match your search query.'}
                      </td>
                    </tr>
                  ) : (
                    filteredMatchedRecipients.map((b, index) => {
                      const isAllocated = b.allocationStatus === 'ALLOCATED' && b.allocatedSeats;
                      return (
                        <tr key={b.id || b.bookingId || index} className="hover:bg-amber-50/70 transition-colors">
                          <td className="p-3 text-center font-mono text-gray-500 font-bold">{index + 1}</td>
                          <td className="p-3 font-mono font-bold text-[#6B1A2B]">{b.bookingId}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                b.buyerType === 'MSN'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-blue-100 text-blue-900 border border-blue-300'
                              }`}
                            >
                              {b.buyerType === 'MSN' ? 'MSN Student' : 'External'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-ink">{cleanName(b.customerName)}</div>
                            {b.buyerType === 'MSN' && b.studentName && (
                              <div className="text-[11px] text-bronze font-bold mt-0.5">
                                Student: {b.studentName}
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-mono text-[#2C1810]">{b.whatsapp || b.phone || 'N/A'}</td>
                          <td className="p-3 text-ink-soft">{b.email || 'N/A'}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                b.paymentStatus === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-red-100 text-red-900 border border-red-300'
                              }`}
                            >
                              {b.paymentStatus}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {isAllocated ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-300 font-mono font-bold text-[11px] inline-block shadow-sm">
                                {b.allocatedSeats}
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-800 italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
