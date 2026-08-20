'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

export default function AdminLayoutClient({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const getTabTitle = () => {
    if (pathname.includes('/admin/seat-allocation')) return 'Seat Allocation';
    if (pathname.includes('/admin/analytics')) return 'Analytics & Insights';
    if (pathname.includes('/admin/broadcast')) return 'Broadcast Messages';
    if (pathname.includes('/admin/dashboard')) return 'Dashboard';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF6EF] relative">
      {/* Sidebar Component */}
      {isSidebarOpen ? (
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      ) : null}

      {/* Main Content Region */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Sticky Header Bar */}
        <div className="bg-[#6B1A2B] text-[#FAF6EF] border-b-2 border-[#D4AF37] px-6 py-3 flex items-center justify-between shadow-md z-30 sticky top-0">
          {/* Left Region: Toggle Button & Logo (when collapsed) */}
          <div className="flex items-center gap-3 w-1/4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="w-9 h-9 rounded bg-[#501220] hover:bg-[#8B2338] text-[#D4AF37] border border-[#D4AF37]/50 text-lg font-bold flex items-center justify-center transition-all shadow-sm shrink-0"
                title="Open Navigation Menu"
              >
                ☰
              </button>
            )}
            {!isSidebarOpen && (
              <img
                src="/Images/msn_logo_flat_R (1).png"
                alt="M.S. Naatyakshetra Logo"
                className="h-8 w-auto object-contain hidden sm:block"
              />
            )}
          </div>

          {/* Center Region: Currently Opened Tab Name Centered */}
          <div className="w-2/4 text-center">
            <h1 className="font-serif-display text-lg sm:text-2xl font-bold tracking-wide text-[#FAF6EF] uppercase">
              {getTabTitle()}
            </h1>
          </div>

          {/* Right Region: Event Brand Label */}
          <div className="w-1/4 text-right">
            <span className="text-[11px] text-[#D4AF37] font-semibold uppercase tracking-wider hidden sm:inline">
              Nritya Bharathanjali 2026
            </span>
          </div>
        </div>

        <main className="flex-grow overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
