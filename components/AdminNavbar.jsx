'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminNavbar() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    fetchAdminSession();
  }, []);

  const fetchAdminSession = async () => {
    try {
      const res = await fetch('/api/admin/me');
      const data = await res.json();
      if (data.success && data.authenticated) {
        setAdminUser(data.user);
      } else {
        setAdminUser(null);
      }
    } catch (e) {
      setAdminUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      console.error('Error logging out admin:', e);
    }
    sessionStorage.removeItem('skanda_admin_session');
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header className="glass-nav sticky top-0 z-50 transition-all border-b border-gold/40">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 py-3 flex items-center justify-between">
        {/* Brand Emblem & Admin Label */}
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <img
              src="/Images/msn_logo_flat_R (1).png"
              alt="M.S. Natyakshetra Logo"
              className="h-11 sm:h-12 w-auto object-contain"
            />
            <div>
              <span className="eyebrow text-bronze text-[10px] font-bold block">
                ORGANIZERS PORTAL
              </span>
              <span className="font-serif-display text-base sm:text-lg font-bold text-maroon">
                Admin Control Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Admin Session Info & Logout */}
        <div className="flex items-center gap-4">
          {adminUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold bg-cream text-maroon text-xs font-bold font-marcellus">
                <span className="w-5 h-5 rounded-full bg-maroon text-ivory flex items-center justify-center text-[10px]">
                  🔑
                </span>
                <span>{adminUser.username}</span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-sandal text-maroon rounded uppercase border border-gold/40">
                  {adminUser.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded bg-red-800 text-white hover:bg-red-900 transition-colors shadow-sm"
              >
                🔒 Logout
              </button>
            </div>
          ) : (
            <div className="text-xs text-bronze font-bold tracking-wider uppercase">
              Restricted Access
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
