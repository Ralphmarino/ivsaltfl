---
name: ivsalt-brand
description: IV Salt Rejuvenation brand + design system. Use whenever building, editing, or restyling any page, component, or email for this site so everything stays on-brand — the dark-luxe palette, typography, motion rules, and accessibility standards. Triggers on any visual/UI/CSS/component work in this repo.
---

# IV Salt Rejuvenation — Design System

Mobile IV hydration & wellness on the Treasure Coast. The site should read as
**expensive, modern, calm, and clinical-but-warm**. Dark & luxe.

## Palette (tokens live in `src/styles/global.css` `@theme`)
- Canvas: `--color-navy` #0a0e1c (page), `--color-ink` #05070f (deepest), panels `--color-navy-800/700`.
- Accents: `--color-pink` #ff3d9a (primary/CTA), `--color-teal` #29c4d6 (secondary), `--color-gold` #e9b96a (prices, tertiary).
- Text: `--color-cream` #f6f8fc (headings/body), `--color-mist` #aeb8cf (muted), `--color-mist-dim` #7c8299 (captions).
- Never introduce colors outside these tokens. Prices are always gold. Primary CTAs are pink.

## Typography
- Display/headings: **Fraunces** (serif) via `.font-display` / `font-family: var(--font-display)`.
- Body/UI: **Manrope** (`var(--font-body)`).
- Script accent (taglines only, e.g. "Your wellness. Our priority."): **Pinyon Script** via `.text-script`.
- Gradient headline word: wrap in `.text-gradient` or `.grad-underline`.
- Fonts are self-hosted via `@fontsource` (privacy + performance for a health site). Do not add Google Fonts `<link>`s.

## Components (reuse these classes — don't reinvent)
- `.container-x` — page width wrapper. `.card` / `.card-hover` — glass panels. `.ring-brand` — featured card glow.
- Buttons: `.btn` + `.btn-primary` (pink), `.btn-teal`, `.btn-ghost`. Pills, not rectangles.
- `.eyebrow` (+ `.eyebrow-center`) — small uppercase section labels. `.input` / `.label` — form controls.
- Icons: `src/components/Icon.astro` (Astro) and `src/components/booking/BookingIcons.tsx` (React). Add new icons to BOTH if needed.

## Motion
- Scroll reveal: add `data-reveal` (+ `data-reveal-delay="1..5"`). It is gated behind a `.js` class so no-JS users still see everything — never remove that gate.
- Ambient: `.aurora`, `.animate-drift`, `.animate-float`, `.animate-pulse-glow`. Keep it subtle and slow.
- ALWAYS respect `prefers-reduced-motion` (already handled globally). Don't add motion that ignores it.

## Accessibility (non-negotiable — this is a healthcare site)
- WCAG 2.1 AA target. Keyboard-operable everything; visible focus (`:focus-visible` ring is global).
- Semantic HTML + landmarks + a skip link. Real `alt` text. Label every form field.
- Contrast: body text uses `--color-mist` or lighter on dark panels. Don't put `--color-mist-dim` on small body copy.

## Content & compliance
- Business data + copy live in `src/data/site.ts` and `src/data/services.ts`. Edit there, not inline.
- The medical disclaimer must remain visible in the footer and on booking. Bookings are "requests" until the
  consent form + $50 deposit are completed. Never imply IV therapy diagnoses/treats/cures disease.

## Booking flow
- Wizard: `src/components/booking/BookingWizard.tsx`. Backend: `netlify/functions/submit-booking.ts` (+ `lib/`).
- Flow is: pick 1 of 6 IVs → optional add-ons → date/time → contact+address → review → POST `/api/book`.
- All integrations fail soft on missing env. Keep that property when editing the backend.
