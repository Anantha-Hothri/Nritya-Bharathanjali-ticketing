'use client';

import React from 'react';
import { DISPLAY_ROWS, getSectionForSeat, getSeatZoneAndStatus } from '../lib/seatingConfig';

export default function MiniSeatingChart({ allocatedSeatsString }) {
  if (!allocatedSeatsString) return null;

  const allocatedList = allocatedSeatsString.split(',').map((s) => s.trim()).filter(Boolean);
  if (allocatedList.length === 0) return null;

  return (
    <div className="card-gold-accent p-4 sm:p-6 bg-[#0F0F1B] text-white rounded-xl shadow-lg space-y-4 border border-gold/40">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gold/30 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block">
            AUDITORIUM SEATING MAP
          </span>
          <h4 className="font-serif-display text-base font-bold text-white">
            Your Highlighted Seat Location(s)
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded bg-purple-600 text-white font-mono text-xs font-bold shadow">
            Your Seats: {allocatedSeatsString}
          </span>
        </div>
      </div>

      {/* Mini Seating Chart Canvas */}
      <div className="overflow-x-auto p-2 scrollbar-thin">
        <div className="min-w-max space-y-2 mx-auto">
          {/* Section Headers */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider pb-1">
            <span>C-Side (Left)</span>
            <span>M-Side (Middle)</span>
            <span>R-Side (Right)</span>
          </div>

          {/* Rows: TOP (Row R) to BOTTOM (Row A) */}
          {DISPLAY_ROWS.map((rowObj) => {
            const rowLetter = rowObj.row;

            const renderMiniPill = (seatId, num) => {
              const { zone } = getSeatZoneAndStatus(rowLetter, num);
              const isUserSeat = allocatedList.includes(seatId);

              return (
                <div
                  key={seatId}
                  title={`Seat ${seatId} (${getSectionForSeat(rowLetter, num)})`}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded text-[7px] sm:text-[8px] font-mono font-bold flex items-center justify-center shrink-0 transition-transform ${
                    isUserSeat
                      ? 'bg-purple-600 text-white ring-2 ring-yellow-400 scale-125 z-10 font-black shadow-lg shadow-purple-500/50'
                      : 'bg-gray-800 text-gray-500 opacity-40'
                  }`}
                >
                  {num}
                </div>
              );
            };

            const cSide = [];
            for (let n = rowObj.cSide[0]; n <= rowObj.cSide[1]; n++) {
              cSide.push(renderMiniPill(`${rowLetter}${n}`, n));
            }

            const mSide = [];
            for (let n = rowObj.mSide[0]; n <= rowObj.mSide[1]; n++) {
              mSide.push(renderMiniPill(`${rowLetter}${n}`, n));
            }

            const rSide = [];
            for (let n = rowObj.rSide[0]; n <= rowObj.rSide[1]; n++) {
              rSide.push(renderMiniPill(`${rowLetter}${n}`, n));
            }

            return (
              <div key={rowLetter} className="flex flex-nowrap items-center justify-center gap-1 text-[9px] min-w-max">
                <span className="w-4 font-mono font-bold text-[#D4AF37] text-center shrink-0">{rowLetter}</span>
                <div className="flex flex-nowrap gap-0.5 items-center">{cSide}</div>
                <div className="w-2 sm:w-4 shrink-0 text-[8px] text-[#D4AF37]/40 text-center font-mono">│</div>
                <div className="flex flex-nowrap gap-0.5 items-center bg-black/40 px-1 py-0.5 rounded">{mSide}</div>
                <div className="w-2 sm:w-4 shrink-0 text-[8px] text-[#D4AF37]/40 text-center font-mono">│</div>
                <div className="flex flex-nowrap gap-0.5 items-center">{rSide}</div>
                <span className="w-4 font-mono font-bold text-[#D4AF37] text-center shrink-0">{rowLetter}</span>
              </div>
            );
          })}

          {/* Mini Stage Indicator */}
          <div className="mt-4 pt-2 text-center border-t border-gold/30">
            <div className="py-1.5 rounded bg-gradient-to-r from-[#6B1A2B] via-[#D4AF37] to-[#6B1A2B] text-white text-[10px] font-bold uppercase tracking-widest">
              🎭 STAGE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
