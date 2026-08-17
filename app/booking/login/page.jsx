'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerLoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    isWhatsappSame: 'YES',
    whatsapp: '',
  });

  const [error, setError] = useState('');
  const [capacityInfo, setCapacityInfo] = useState({
    totalCapacity: 600,
    remainingTickets: 600,
    isSoldOut: false,
  });

  // Load existing session data if available
  useEffect(() => {
    const savedData = sessionStorage.getItem('skanda_customer_login');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {}
    }

    fetchCapacity();
  }, []);

  const fetchCapacity = async () => {
    try {
      const res = await fetch('/api/booking/capacity');
      const data = await res.json();
      if (data.success) {
        setCapacityInfo(data);
      }
    } catch (e) {
      console.error('Error loading capacity:', e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateMobile = (phoneStr) => {
    const digitsOnly = phoneStr.replace(/\D/g, '');
    // Allow 10 digits starting with 6-9 (Indian mobile numbers) or 10-12 digits with country code 91
    if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      const nationalNumber = digitsOnly.slice(2);
      return /^[6-9]\d{9}$/.test(nationalNumber) ? nationalNumber : null;
    }
    if (digitsOnly.length === 10) {
      return /^[6-9]\d{9}$/.test(digitsOnly) ? digitsOnly : null;
    }
    return null;
  };

  const validateEmail = (emailStr) => {
    const trimmed = emailStr.trim().toLowerCase();

    // Standard RFC 5322 pattern check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, message: 'Please enter a valid email address (e.g. name@gmail.com).' };
    }

    // Common domain typo checks
    const domain = trimmed.split('@')[1];
    const invalidTypos = ['gmal.com', 'gmial.com', 'gmaill.com', 'yaho.com', 'hotmal.com', 'outlok.com'];
    if (invalidTypos.includes(domain)) {
      return { valid: false, message: `Typo detected in domain "@${domain}". Did you mean "@gmail.com"?` };
    }

    return { valid: true, cleanEmail: trimmed };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (capacityInfo.isSoldOut || capacityInfo.remainingTickets <= 0) {
      setError('Bookings are closed. All event tickets are sold out!');
      return;
    }

    if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    // Validate Phone Number
    const validPhone = validateMobile(formData.phone);
    if (!validPhone) {
      setError('Please enter a valid 10-digit mobile number (e.g. 9876543210).');
      return;
    }

    // Validate Email Address
    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.valid) {
      setError(emailCheck.message);
      return;
    }

    // Validate WhatsApp Number
    let finalWhatsapp = validPhone;
    if (formData.isWhatsappSame === 'NO') {
      const validWa = validateMobile(formData.whatsapp);
      if (!validWa) {
        setError('Please enter a valid 10-digit WhatsApp number.');
        return;
      }
      finalWhatsapp = validWa;
    }

    const payload = {
      customerName: formData.customerName.trim(),
      phone: validPhone,
      email: emailCheck.cleanEmail,
      isWhatsappSame: formData.isWhatsappSame,
      whatsapp: finalWhatsapp,
    };

    // Store customer details in localStorage & sessionStorage
    localStorage.setItem('skanda_customer_login', JSON.stringify(payload));
    sessionStorage.setItem('skanda_customer_login', JSON.stringify(payload));

    // Proceed to Attendee Category Selection
    router.push('/booking/select-type');
  };

  const { isSoldOut, remainingTickets } = capacityInfo;

  return (
    <div className="py-12 px-6 sm:px-10 max-w-3xl mx-auto" style={{ background: 'var(--ivory)' }}>
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gold/30 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        <div className="flex items-center gap-2 text-maroon font-bold">
          <span className="step-badge">1</span>
          <span>Contact Details</span>
        </div>
        <div className="opacity-40">2. Ticket Selection & Payment</div>
      </div>

      {/* Main Card */}
      <div className="card-gold-accent p-6 sm:p-8">
        <div className="text-center mb-6">
          <p className="eyebrow mb-1">STEP 1 OF 3</p>
          <h2 className="font-serif-display text-3xl font-semibold" style={{ color: 'var(--maroon)' }}>
            Customer Contact Details
          </h2>
          <p className="text-sm text-ink-soft mt-1">
            Please enter your valid 10-digit mobile number and email address. E-tickets will be sent via WhatsApp and Email.
          </p>
          <div className="mt-2">
            <a href="/booking/my-bookings" className="text-xs font-bold text-maroon hover:underline">
              Already booked? View My Receipts & Invitation Pass &rarr;
            </a>
          </div>
        </div>

        {/* SOLD OUT ALERT */}
        {isSoldOut ? (
          <div className="p-4 mb-6 rounded bg-red-900 text-white text-center font-bold text-sm space-y-1 shadow-md">
            <span>🔒 BOOKINGS CLOSED — SOLD OUT!</span>
            <p className="text-xs font-normal opacity-90">
              Maximum event booking capacity has been reached. No further bookings can be accepted.
            </p>
          </div>
        ) : remainingTickets < 50 ? (
          <div className="p-3 mb-4 rounded bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold text-center">
            ⚠️ Limited Availability: Seats are filling fast!
          </div>
        ) : null}

        {error && (
          <div className="p-3 mb-4 rounded bg-red-100 border border-red-300 text-red-800 text-sm font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bronze mb-1.5">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="e.g. Ramesh Kumar"
              className="input-luxe"
              disabled={isSoldOut}
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bronze mb-1.5">
              10-Digit Mobile Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              maxLength={10}
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData((prev) => ({ ...prev, phone: val }));
              }}
              placeholder="e.g. 9876543210"
              className="input-luxe font-mono"
              disabled={isSoldOut}
              required
            />
            <span className="text-[11px] text-ink-soft block mt-1">
              Must be a valid 10-digit mobile number starting with 6, 7, 8, or 9.
            </span>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bronze mb-1.5">
              Email Address <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. ramesh@gmail.com"
              className="input-luxe"
              disabled={isSoldOut}
              required
            />
            <span className="text-[11px] text-ink-soft block mt-1">
              Must be a valid active email address (e.g. yourname@gmail.com).
            </span>
          </div>

          {/* WhatsApp Toggle Question */}
          <div className="p-4 rounded border border-gold/40 bg-sandal/30 space-y-3">
            <label className="block text-sm font-semibold text-maroon">
              💬 Is this phone number also your active WhatsApp number?
            </label>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                <input
                  type="radio"
                  name="isWhatsappSame"
                  value="YES"
                  checked={formData.isWhatsappSame === 'YES'}
                  onChange={handleChange}
                  disabled={isSoldOut}
                  className="accent-maroon h-4 w-4"
                />
                Yes, use same number
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                <input
                  type="radio"
                  name="isWhatsappSame"
                  value="NO"
                  checked={formData.isWhatsappSame === 'NO'}
                  onChange={handleChange}
                  disabled={isSoldOut}
                  className="accent-maroon h-4 w-4"
                />
                No, I have a different WhatsApp number
              </label>
            </div>

            {formData.isWhatsappSame === 'NO' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-bronze mb-1">
                  Separate 10-Digit WhatsApp Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  maxLength={10}
                  value={formData.whatsapp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData((prev) => ({ ...prev, whatsapp: val }));
                  }}
                  placeholder="e.g. 9123456789"
                  className="input-luxe bg-white font-mono"
                  disabled={isSoldOut}
                  required={formData.isWhatsappSame === 'NO'}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSoldOut}
              className="w-full luxe-button luxe-button-solid py-4 text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSoldOut ? '🔒 BOOKINGS CLOSED - SOLD OUT' : 'CONTINUE TO TICKET SELECTION & PAYMENT →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
