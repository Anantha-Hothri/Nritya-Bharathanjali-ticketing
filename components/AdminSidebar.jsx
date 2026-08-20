'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminSidebar({ onClose }) {
  const pathname = usePathname();
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
      console.error('Logout error:', e);
    }
    sessionStorage.removeItem('skanda_admin_session');
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: '📊',
      desc: 'Live Bookings Ledger',
    },
    {
      label: 'Seat Allocation',
      href: '/admin/seat-allocation',
      icon: '🪑',
      desc: 'Auditorium Seating System',
    },
    {
      label: 'Manual Payments',
      href: '/admin/payments-verification',
      icon: '💵',
      desc: 'Verify UPI Transaction & Confirm',
    },
    {
      label: 'Analytics & Insights',
      href: '/admin/analytics',
      icon: '📈',
      desc: 'Revenue & Occupancy Stats',
    },
    {
      label: 'Broadcast Messages',
      href: '/admin/broadcast',
      icon: '📢',
      desc: 'Bulk WhatsApp & Email Outreach',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#6B1A2B] text-[#FAF6EF] flex flex-col justify-between border-r-2 border-[#D4AF37]/40 md:sticky md:top-0 md:h-screen shrink-0 shadow-2xl z-40 relative animate-fadeIn overflow-y-auto">
      <div>
        {/* Top Header Branding: Logo & Close Toggle Button */}
        <div className="p-4 border-b border-[#D4AF37]/30 flex items-center justify-between bg-[#501220]">
          <Link href="/admin/dashboard" className="inline-block group">
            <img
              src="/Images/msn_logo_flat_R (1).png"
              alt="M.S. Naatyakshetra Logo"
              className="h-12 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Close Sidebar Icon Button (✕) */}
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded bg-[#6B1A2B] hover:bg-[#8B2338] text-[#D4AF37] hover:text-white border border-[#D4AF37]/40 text-sm font-bold flex items-center justify-center transition-all shadow-sm"
              title="Close Sidebar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Links List */}
        <nav className="p-4 space-y-2 mt-2">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] flex justify-between items-center">
            <span>MAIN MENU</span>
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#501220] text-[#FAF6EF] border-l-4 border-[#D4AF37] shadow-lg font-bold'
                    : 'text-[#FAF6EF]/90 hover:bg-[#8B2338] hover:text-[#D4AF37]'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="leading-tight flex items-center gap-1.5">
                    <span>{item.label}</span>
                    {isActive && <span className="text-[#D4AF37] text-xs font-bold">●</span>}
                  </div>
                  <div className="text-[10px] text-[#FAF6EF]/70 font-normal mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Info & Logout Button */}
      <div className="p-4 border-t border-[#D4AF37]/30 bg-[#501220] space-y-3">
        {adminUser && (
          <div className="px-3 py-2 rounded bg-[#6B1A2B] border border-[#D4AF37]/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-sm">🔑</span>
              <div className="truncate">
                <span className="font-bold text-[#FAF6EF] block truncate">
                  {adminUser.username}
                </span>
                <span className="text-[9px] text-[#D4AF37] font-semibold uppercase block">
                  {adminUser.role}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-4 rounded bg-red-900 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-red-700/50 shadow-sm"
        >
          <span>🔒</span>
          <span>LOGOUT</span>
        </button>
      </div>
    </aside>
  );
}
