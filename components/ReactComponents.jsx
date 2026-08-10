import React from "react";

/* ==========================================================================
   GURU KOUSALYA NIVAS - REUSABLE REACT COMPONENTS
   Contains exact image assets and SVG ornaments from the website.
   ========================================================================== */

export const THEME_ASSET_PATHS = {
  rangoli: "assets/rangoli.png",
  dia: "assets/dia.png",
  lamp: "assets/lamp.png",
  hangingLampGif: "assets/picmix.com_1995560.gif",
  diyaFlame: "assets/final.png",
  logo: "assets/logo.png",
  logoGold: "assets/logo_gold.png",
  logoRed: "assets/logo_red.png",
  hero: "assets/hero.png",
  natMotif: "assets/nat.png",
  natWebp: "assets/nat.webp",
  image: "assets/image.png",
  webEditor: "assets/Web_Photo_Editor.jpg"
};

/* ====== 1. Rotating Rangoli Background ====== */
export const RangoliBg = ({ className = "", opacity = 0.16, spin = true, src = THEME_ASSET_PATHS.rangoli }) => (
  <img
    src={src}
    alt=""
    aria-hidden="true"
    loading="lazy"
    className={`rangoli-bg pointer-events-none select-none ${spin ? "spin-slow" : ""} ${className}`}
    style={{ opacity }}
  />
);

/* ====== 2. Mandala Ornament ====== */
export const Mandala = ({ className = "", color = "var(--gold)", src = THEME_ASSET_PATHS.rangoli }) => (
  <img
    src={src}
    alt=""
    aria-hidden="true"
    loading="lazy"
    className={`mandala pointer-events-none select-none ${className}`}
    style={{ color }}
  />
);

/* ====== 3. Kolam / Rhythm Divider ====== */
export const KolamDivider = ({ className = "", color = "var(--gold)" }) => (
  <div
    className={`flex items-center justify-center gap-2 sm:gap-4 ${className}`}
    aria-hidden="true"
  >
    <span
      className="h-px w-8 sm:w-16 md:w-28 flex-shrink"
      style={{ background: `linear-gradient(90deg, transparent, ${color})` }}
    />

    <svg
      width="86"
      height="22"
      viewBox="0 0 86 22"
      fill="none"
      className="flex-shrink-0"
    >
      <g stroke={color} strokeWidth="1.2">
        <path d="M2 11 Q 14 -2 26 11 Q 38 24 50 11 Q 62 -2 74 11" />
        <circle cx="39" cy="13" r="4" fill={color} stroke="none" />
        <circle cx="3" cy="11" r="2.2" fill={color} stroke="none" />
        <circle cx="75" cy="11" r="2.2" fill={color} stroke="none" />
      </g>
    </svg>

    <span
      className="h-px w-8 sm:w-16 md:w-28 flex-shrink"
      style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
    />
  </div>
);

/* ====== 4. Standing Temple Oil Lamp (Dia) ====== */
export const TempleLamp = ({ className = "", color = "var(--gold)", src = THEME_ASSET_PATHS.dia }) => (
  <img src={src} alt="" aria-hidden="true" loading="lazy" className={className} style={{ color }} />
);
export const StandingLamp = TempleLamp;

/* ====== 5. Hanging Oil Lamp ====== */
export const HangingLamp = ({ className = "", color = "var(--gold)", src = THEME_ASSET_PATHS.hangingLampGif }) => (
  <img src={src} alt="" aria-hidden="true" loading="lazy" className={className} style={{ color }} />
);

/* ====== 6. Diya Row ====== */
export const DiyaRow = ({ className = "", count = 5, color = "var(--gold)", src = THEME_ASSET_PATHS.diyaFlame }) => (
  <div
    className={`flex items-center justify-center ${className}`}
    aria-hidden="true"
    style={{ gap: "8px", color }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <img
        key={i}
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 object-contain"
      />
    ))}
  </div>
);

/* ====== 7. Lotus Ornament ====== */
export const Lotus = ({ className = "", color = "var(--maroon)" }) => (
  <svg viewBox="0 0 80 50" className={className} fill="none" aria-hidden="true">
    <g stroke={color} strokeWidth="1.2" fill="none">
      <path
        d="M40 46 C 40 30 40 14 40 6 C 46 16 48 32 40 46 Z"
        fill={color}
        opacity="0.12"
      />
      <path d="M40 46 C 40 30 40 14 40 6 C 34 16 32 32 40 46 Z" />
      <path d="M40 46 C 30 34 22 24 16 18 C 28 20 38 30 40 46 Z" />
      <path d="M40 46 C 50 34 58 24 64 18 C 52 20 42 30 40 46 Z" />
      <path d="M40 46 C 26 40 14 38 4 38 C 18 30 34 36 40 46 Z" />
      <path d="M40 46 C 54 40 66 38 76 38 C 62 30 46 36 40 46 Z" />
    </g>
  </svg>
);

/* ====== 8. Temple Arch Frame ====== */
export const TempleArchFrame = ({ children, className = "", borderColor = "var(--gold)" }) => (
  <div className={`relative ${className}`}>
    <div className="relative overflow-hidden temple-arch" style={{ border: `3px solid ${borderColor}`, boxShadow: "0 30px 60px -30px rgba(110,20,35,0.45)" }}>
      {children}
    </div>
    <div className="pointer-events-none absolute inset-[3px] temple-arch" style={{ border: `1.5px solid ${borderColor}`, opacity: 0.6 }} aria-hidden="true" />
    <svg viewBox="0 0 24 24" className="absolute left-1/2 -top-4 h-8 w-8 -translate-x-1/2" aria-hidden="true">
      <circle cx="12" cy="14" r="5" fill={borderColor} />
      <path d="M12 0 L14 8 L10 8 Z" fill={borderColor} />
    </svg>
  </div>
);

/* ====== 9. Corner Flourish ====== */
export const CornerFlourish = ({ className = "", color = "var(--gold)", flip = false }) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    style={{ transform: flip ? "scaleX(-1)" : "none" }}
    fill="none"
    aria-hidden="true"
  >
    <g stroke={color} strokeWidth="1" opacity="0.7">
      <path d="M4 4 C 40 8 60 28 64 64" />
      <path d="M4 18 C 30 22 46 38 50 64" />
      <circle cx="64" cy="64" r="3" fill={color} stroke="none" />
      <path d="M4 4 C 8 40 28 60 64 64" />
    </g>
  </svg>
);

/* ====== 10. Luxe Button ====== */
export const LuxeButton = ({ children, href, onClick, variant = "solid", className = "" }) => {
  const baseClass = "luxe-button " + (variant === "solid" ? "luxe-button-solid" : "luxe-button-outline");
  const cls = `${baseClass} ${className}`;

  if (href) return <a href={href} className={cls}>{children} &rarr;</a>;
  return <button onClick={onClick} className={cls}>{children} &rarr;</button>;
};

/* ====== 11. Section Title ====== */
export const SectionTitle = ({ eyebrow, title, light = false, center = true }) => (
  <div className={`${center ? "text-center mx-auto" : ""} max-w-3xl mb-8`}>
    {eyebrow && (
      <p
        className="eyebrow mb-3"
        style={{ color: light ? "var(--gold-light)" : "var(--bronze)" }}
      >
        {eyebrow}
      </p>
    )}
    <h2
      className="font-serif-display font-semibold leading-tight text-4xl md:text-5xl"
      style={{ color: light ? "var(--ivory)" : "var(--maroon)" }}
    >
      {title}
    </h2>
    {center && <DiyaRow className="mx-auto mt-4" />}
  </div>
);
