'use client';

import React from 'react';

export default function PrintTicketButton() {
  return (
    <button
      onClick={() => window.print()}
      className="luxe-button luxe-button-solid text-center shadow-md hover:scale-105 transition-transform no-print cursor-pointer"
      type="button"
    >
      📥 DOWNLOAD / PRINT E-TICKET (PDF)
    </button>
  );
}
