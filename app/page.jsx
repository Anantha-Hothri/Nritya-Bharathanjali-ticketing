'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EventLandingPage() {
  const [capacityInfo, setCapacityInfo] = useState({
    totalCapacity: 600,
    remainingTickets: 600,
    isSoldOut: false,
  });

  const galleryImages = [
    { src: '/Images/026df52f-e772-4e0e-94d7-147de145daf9.jpeg', title: 'Bharatanatyam Expression' },
    { src: '/Images/6be26a49-8b06-4a0a-909e-8bf547be69cc.jpeg', title: 'Classical Abhinaya' },
    { src: '/Images/833d2d08-9b8a-47b0-bd60-1a0f95863492.jpeg', title: 'Group Performance' },
    { src: '/Images/9df12c16-2446-41fe-bc87-e36919973d8a.jpeg', title: 'Divine Postures' },
    { src: '/Images/a10a5e59-ae07-42c9-bea5-8b4cb1dc7806.jpeg', title: 'Stage Choreography' },
    { src: '/Images/ccf6b6cd-a947-4d79-a8cf-f115d4162898.jpeg', title: 'Temple Traditions' },
  ];

  useEffect(() => {
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
      console.error('Error fetching capacity:', e);
    }
  };

  const { isSoldOut, remainingTickets } = capacityInfo;

  return (
    <div className="relative overflow-hidden" style={{ background: 'var(--ivory)' }}>
      {/* Background Rotating Rangoli Mandala */}
      <img
        src="/assets/rangoli.png"
        alt=""
        aria-hidden="true"
        className="rangoli-bg spin-slow absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-15 pointer-events-none"
      />

      {/* SOLD OUT / CAPACITY ANNOUNCEMENT BANNER */}
      {isSoldOut ? (
        <div className="bg-red-800 text-white py-3 px-4 text-center font-bold text-sm tracking-wider uppercase shadow-md relative z-20">
          🔒 BOOKINGS CLOSED — SOLD OUT! Maximum event capacity has been reached.
        </div>
      ) : remainingTickets < 50 ? (
        <div className="bg-amber-800 text-gold-pale py-2.5 px-4 text-center font-bold text-xs tracking-wider uppercase shadow-md relative z-20">
          ⚠️ LIMITED SEATS REMAINING! Seats are filling fast.
        </div>
      ) : null}

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-6 sm:px-10 text-center max-w-[1440px] mx-auto z-10">
        <div className="flex justify-center mb-4">
          <img src="/Images/msn_logo_circle_R.png" alt="M.S. Natyakshetra Emblem" className="h-20 w-20 object-contain drop-shadow-md" />
        </div>

        <p className="eyebrow mb-2">M.S. NATYAKSHETRA PRESENTS</p>

        <h1 className="font-serif-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-4" style={{ color: 'var(--maroon)' }}>
          Nritya Bharathanjali 2026
        </h1>

        <div className="inline-block px-8 py-2 rounded-full border border-gold bg-cream mb-6 shadow-sm">
          <span className="font-marcellus text-lg sm:text-xl md:text-2xl font-semibold tracking-widest text-maroon">
            ✨ SKANDA PRODUCTION ✨
          </span>
        </div>

        {/* Kolam Divider */}
        <div className="flex items-center justify-center gap-4 my-6">
          <span className="h-px w-20 sm:w-40" style={{ background: 'linear-gradient(90deg, transparent, var(--gold))' }} />
          <svg width="60" height="16" viewBox="0 0 86 22" fill="none">
            <g stroke="var(--gold)" strokeWidth="1.5">
              <path d="M2 11 Q 14 -2 26 11 Q 38 24 50 11 Q 62 -2 74 11" />
              <circle cx="39" cy="13" r="4" fill="var(--gold)" />
            </g>
          </svg>
          <span className="h-px w-20 sm:w-40" style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
        </div>

        {/* Key Event Details Badge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto my-10">
          <div className="p-5 rounded-lg card-gold-accent text-center">
            <p className="text-xs uppercase tracking-widest text-bronze mb-1">DATE & TIME</p>
            <p className="font-num text-2xl font-semibold text-maroon">
              Sept 26, 2026
            </p>
            <p className="text-xs text-ink-soft mt-1">Saturday • 5:30 PM Onwards</p>
          </div>

          <div className="p-5 rounded-lg card-gold-accent text-center flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-bronze mb-1">VENUE</p>
              <p className="font-marcellus text-lg font-semibold text-maroon">
                Dhwani Auditorium
              </p>
              <p className="text-xs text-ink-soft mt-1">CMRIT College</p>
            </div>
            <div className="mt-2 pt-2 border-t border-gold/30">
              <a
                href="https://maps.app.goo.gl/9yV1MvuTc6HzmTqX8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-maroon hover:text-bronze underline transition-colors"
              >
                📍 Navigate &rarr;
              </a>
            </div>
          </div>

          <div className="p-5 rounded-lg card-gold-accent text-center">
            <p className="text-xs uppercase tracking-widest text-bronze mb-1">PRODUCED BY</p>
            <p className="font-marcellus text-lg font-semibold text-maroon">
              M.S. Natyakshetra
            </p>
            <p className="text-xs text-ink-soft mt-1">Artistic Dir. Guru Kousalya Nivas</p>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-5 justify-center items-center">
          {isSoldOut ? (
            <button
              disabled
              className="px-10 py-4 text-base font-bold uppercase rounded bg-red-900 text-white shadow-lg cursor-not-allowed opacity-90"
            >
              🔒 BOOKINGS CLOSED - SOLD OUT
            </button>
          ) : (
            <Link href="/booking/login" className="luxe-button luxe-button-solid text-lg px-10 py-4 shadow-xl">
              BOOK TICKETS NOW &rarr;
            </Link>
          )}

          <Link href="/booking/my-bookings" className="luxe-button luxe-button-outline text-lg px-8 py-4">
            📁 MY BOOKINGS & RECEIPTS &rarr;
          </Link>
          <a href="#event-details" className="text-sm font-bold text-maroon hover:underline px-4 py-2">
            EXPLORE PRODUCTION &rarr;
          </a>
        </div>
      </section>

      {/* Poster & Production Overview Section */}
      <section id="event-details" className="py-16 px-6 sm:px-10 bg-cream relative">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

          {/* Poster Display */}
          <div className="md:col-span-5 relative">
            <div className="rounded-xl border-4 border-gold overflow-hidden shadow-2xl bg-ivory">
              <img
                src="/Images/poster.jpeg"
                alt="Nritya Bharathanjali Skanda Event Poster"
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Diya Accent Row */}
            <div className="flex justify-center gap-3 mt-4">
              <img src="/assets/final.png" className="w-6 h-6 flame object-contain" alt="" />
              <img src="/assets/final.png" className="w-6 h-6 flame flame-b object-contain" alt="" />
              <img src="/assets/final.png" className="w-6 h-6 flame flame-c object-contain" alt="" />
            </div>
          </div>

          {/* Description & Narrative Details */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <p className="eyebrow mb-2">AN IMMERSIVE DANCE DRAMA</p>
              <h2 className="font-serif-display text-4xl sm:text-5xl font-semibold text-maroon">
                About "Skanda" Production 2026
              </h2>
            </div>

            <p className="text-xl leading-relaxed text-ink-soft">
              Celebrate the divine splendor of Lord Murugan through an enchanting evening of classical Bharatanatyam.
              Featuring over 100 accomplished dancers from M.S. Natyakshetra, <strong>Nritya Bharathanjali 2026</strong> combines
              soul-stirring live Carnatic orchestration, exquisite traditional costuming, and grand stage choreography.
            </p>

            <div className="p-6 rounded-lg border border-gold/40 bg-white-warm space-y-3 shadow-sm">
              <h3 className="font-marcellus text-xl font-semibold text-maroon flex items-center gap-2">
                <span>🏵️</span> Event Entry & Ticket Guidelines
              </h3>
              <ul className="space-y-2.5 text-base text-ink-soft list-disc list-inside">
                <li><strong>Limited Venue Capacity:</strong> Book early to secure your seats for the event.</li>
                <li><strong>General Admission:</strong> Open entry for all attendees with a valid booking e-ticket.</li>
                <li><strong>Instant Digital E-Ticket:</strong> Verified digital booking receipt with entry QR code issued upon payment.</li>
                <li><strong>Multiple Tickets:</strong> Easily book single or multiple tickets in a single checkout.</li>
              </ul>
            </div>

            <div className="pt-4">
              {isSoldOut ? (
                <button disabled className="px-8 py-4 font-bold bg-red-900 text-white rounded cursor-not-allowed opacity-90">
                  🔒 BOOKINGS CLOSED - SOLD OUT
                </button>
              ) : (
                <Link href="/booking/login" className="luxe-button luxe-button-solid px-10 py-4 text-base">
                  PROCEED TO TICKET BOOKING &rarr;
                </Link>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Performance Photo Gallery Section */}
      <section className="py-20 px-6 sm:px-10 max-w-[1440px] mx-auto">
        <div className="text-center mb-12">
          <p className="eyebrow mb-2">CULTURAL HERITAGE IN MOTION</p>
          <h2 className="font-serif-display text-4xl sm:text-5xl font-semibold text-maroon">
            Glimpses of Skanda Production 2026
          </h2>
          <div className="flex justify-center gap-2 mt-4">
            <img src="/assets/final.png" className="w-6 h-6 flame object-contain" alt="" />
            <img src="/assets/final.png" className="w-6 h-6 flame flame-b object-contain" alt="" />
            <img src="/assets/final.png" className="w-6 h-6 flame flame-c object-contain" alt="" />
          </div>
        </div>

        <div className="overflow-hidden w-full relative py-4">
          <div className="flex gap-6 w-max animate-marquee hover:[animation-play-state:paused]">
            {[...galleryImages, ...galleryImages].map((img, idx) => (
              <div key={idx} className="shrink-0 w-72 sm:w-80 md:w-96 card-gold-accent overflow-hidden group shadow-md hover:shadow-2xl transition-all">
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img
                    src={img.src}
                    alt={img.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
