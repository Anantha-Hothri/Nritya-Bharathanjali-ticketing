'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('msn_skanda_admin_2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem('skanda_admin_session', JSON.stringify(data.user));
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Network error logging in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 px-4 max-w-md mx-auto" style={{ background: 'var(--ivory)' }}>
      <div className="card-gold-accent p-8 space-y-6">
        <div className="text-center">
          <img src="/assets/logo_red.png" alt="Logo" className="h-16 mx-auto mb-2 object-contain" />
          <p className="eyebrow mb-1">RESTRICTED ACCESS</p>
          <h2 className="font-serif-display text-3xl font-bold" style={{ color: 'var(--maroon)' }}>
            Admin Panel Login
          </h2>
          <p className="text-xs text-ink-soft mt-1">
            Organizers & Inventory Management Portal
          </p>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-100 border border-red-300 text-red-800 text-sm">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bronze mb-1">
              Admin Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-luxe"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bronze mb-1">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-luxe"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full luxe-button luxe-button-solid py-3 text-sm shadow-md"
            >
              {loading ? 'AUTHENTICATING...' : 'ACCESS ADMIN DASHBOARD \u2192'}
            </button>
          </div>

          <div className="p-3 rounded bg-sandal/40 border border-gold/30 text-[11px] text-ink-soft space-y-1">
            <span className="font-bold text-maroon block">🔑 Pre-Configured Admin Credentials:</span>
            <p>Username: <code className="bg-white px-1 rounded font-bold">admin</code></p>
            <p>Password: <code className="bg-white px-1 rounded font-bold">msn_skanda_admin_2026</code></p>
          </div>
        </form>
      </div>
    </div>
  );
}
