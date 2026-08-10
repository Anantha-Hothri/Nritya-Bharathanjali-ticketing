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

  // Load existing session data if available
  useEffect(() => {
    const savedData = sessionStorage.getItem('skanda_customer_login');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {}
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    const finalWhatsapp =
      formData.isWhatsappSame === 'YES'
        ? formData.phone.trim()
        : formData.whatsapp.trim();

    if (formData.isWhatsappSame === 'NO' && (!finalWhatsapp || finalWhatsapp.length < 10)) {
      setError('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    const payload = {
      ...formData,
      whatsapp: finalWhatsapp,
    };

    // Store customer details in sessionStorage
    sessionStorage.setItem('skanda_customer_login', JSON.stringify(payload));

    // Proceed to Step 2: Buyer Type Selection
    router.push('/booking/select-type');
  };

  return (
    <div className="py-12 px-6 sm:px-10 max-w-3xl mx-auto" style={{ background: 'var(--ivory)' }}>
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gold/30 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        <div className="flex items-center gap-2 text-maroon font-bold">
          <span className="step-badge">1</span>
          <span>Contact Details</span>
        </div>
        <div className="opacity-40">2. Buyer Type</div>
        <div className="opacity-40">3. Ticket Selection</div>
        <div className="opacity-40">4. Payment</div>
      </div>

      {/* Main Card */}
      <div className="card-gold-accent p-6 sm:p-8">
        <div className="text-center mb-6">
          <p className="eyebrow mb-1">STEP 1 OF 4</p>
          <h2 className="font-serif-display text-3xl font-semibold" style={{ color: 'var(--maroon)' }}>
            Customer Account & Contact
          </h2>
          <p className="text-sm text-ink-soft mt-1">
            Please enter your details. E-tickets will be sent via WhatsApp and Email.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded bg-red-100 border border-red-300 text-red-800 text-sm">
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
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bronze mb-1.5">
              Mobile Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              className="input-luxe"
              required
            />
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
              placeholder="e.g. ramesh@example.com"
              className="input-luxe"
              required
            />
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
                  className="accent-maroon h-4 w-4"
                />
                No, I have a different WhatsApp number
              </label>
            </div>

            {formData.isWhatsappSame === 'NO' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-bronze mb-1">
                  Separate WhatsApp Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="e.g. 9123456789"
                  className="input-luxe bg-white"
                  required={formData.isWhatsappSame === 'NO'}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full luxe-button luxe-button-solid py-4 text-base shadow-md"
            >
              CONTINUE TO BUYER TYPE SELECTION &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
