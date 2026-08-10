# Guru Kousalya Nivas - Base Theme Guide & Design System

Welcome to the **Guru Kousalya Nivas Base Theme Kit**. This repository provides a complete, reusable design system, color palette, typography guidelines, Rangoli visual assets, micro-animations, and component snippets. 

You can use this kit to quickly build new websites with the exact same cultural luxury aesthetic.

---

## 🎨 1. Color Palette Tokens

The color system is built around a warm cultural palette featuring deep maroon, metallic brass gold, sandal ivory, and parchment tones.

| Variable Name | Hex Code | HSL Equivalent | Description / Purpose |
|---|---|---|---|
| `--ivory` | `#FBF6EC` | `hsl(40, 65%, 95%)` | Main background color (warm ivory canvas) |
| `--cream` | `#F6EEDE` | `hsl(40, 55%, 92%)` | Secondary section background |
| `--sandal` | `#EFE3CC` | `hsl(40, 50%, 87%)` | Subtle accent background |
| `--parchment` | `#F3EAD7` | `hsl(40, 48%, 90%)` | Card / container background |
| `--maroon` | `#6E1423` | `hsl(350, 70%, 25%)` | Primary brand color (Headings, primary buttons) |
| `--maroon-deep` | `#571019` | `hsl(350, 69%, 20%)` | Dark hover state for maroon |
| `--gold` | `#B68A3E` | `hsl(38, 50%, 47%)` | Luxe border color & accents |
| `--gold-light` | `#C9A75A` | `hsl(41, 52%, 57%)` | Light metallic gold highlights |
| `--bronze` | `#9C6B36` | `hsl(32, 49%, 41%)` | Eyebrow text & subtle borders |
| `--saffron` | `#C97E3A` | `hsl(28, 56%, 51%)` | Diya flame glow & warm highlights |
| `--ink` | `#3A2A24` | `hsl(18, 25%, 19%)` | High-contrast body text |
| `--ink-soft` | `#6B574C` | `hsl(25, 17%, 36%)` | Secondary body text |

---

## 🔤 2. Typography & Font Pairing

The theme combines classical serif headings with modern clean body sans-serif.

1. **Display Headings (`.font-serif-display`)**: `'Cormorant Garamond', Georgia, serif`
   - Use for primary page titles, section titles, and hero headlines.
2. **Subheadings / Secondary Headings (`.font-marcellus`)**: `'Marcellus', serif`
   - Use for card titles, nav links, and stylized headings.
3. **Body Text (`.font-body`)**: `'Jost', sans-serif`
   - Primary readable font for paragraphs, descriptions, and lists.
4. **Numerals & Stat Figures (`.font-num`)**: `'Cinzel', serif`
   - Use for tabular numbers, dates, stats, and badges.

### Including Fonts in HTML:
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Jost:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Marcellus&display=swap">
```

---

## 🏵️ 3. Visual Assets Catalog

All theme visual assets are located in `assets/`:

- `rangoli.png`: Circular Rangoli mandala background graphic.
- `rangoli-vector.svg`: Clean SVG vector version of the Rangoli mandala for crisp high-resolution scaling.
- `dia.png`: Traditional brass Diya standing lamp.
- `lamp.png`: Temple oil hanging lamp.
- `final.png`: Decorative Diya flame element for rows.
- `kolam-divider.svg`: Vector Kolam section divider.
- `logo_gold.png` & `logo_red.png`: Emblem logos in gold and red.
- `hero.png`: Textured hero background image.
- `nat.png` & `nat.webp`: Classical dance motif illustration.

---

## ⚡ 4. Micro-Animations & Utilities

The theme includes smooth built-in CSS animations:

1. **`.spin-slow`**: 90-second smooth linear rotation for Rangoli background overlays (`mix-blend-mode: multiply`).
2. **`.flame`**: Natural organic flickering animation for Diya flames (`.flame-b`, `.flame-c` for delayed staggering).
3. **`.sway`**: Gentle pendulum sway for hanging lamps.
4. **`.temple-arch`**: Curved ogee arch top styling for featured images or frame containers (`border-top-left-radius: 50% 28%; border-top-right-radius: 50% 28%`).
5. **`.luxe-card`**: Elegant card with thin gold border, warm background, and lift-on-hover effect.

---

## 🚀 5. How to Create a New Website with This Theme

Follow these simple steps to start a new project with this base look:

### Step 1: Include Theme Assets & CSS
Ensure `assets/` and `css/gkn-theme.css` are in your website root:
```html
<link rel="stylesheet" href="css/gkn-theme.css">
```

### Step 2: Use React Components (If using React)
Import components from `components/ReactComponents.jsx`:
```javascript
import { 
  RangoliBg, 
  KolamDivider, 
  DiyaRow, 
  LuxeButton, 
  SectionTitle, 
  TempleArchFrame 
} from "./theme-kit/components/ReactComponents";

function MyNewApp() {
  return (
    <div style={{ background: "var(--ivory)", minHeight: "100vh" }}>
      <RangoliBg spin opacity={0.15} />
      <SectionTitle eyebrow="WELCOME" title="My New Website" />
      <KolamDivider />
      <DiyaRow count={5} />
    </div>
  );
}
```

---

## 🌐 Live Interactive Theme Showcase

To view and test all theme components, color codes, typography, and live animations inside the React app, visit:
`http://localhost:3000/theme-showcase`
