# IV Salt Rejuvenation

Marketing site + custom booking flow for **IV Salt Rejuvenation** — mobile IV
hydration & wellness serving Port St. Lucie, Stuart & the Treasure Coast.

Modern, fast, mobile-first, and accessible. Dark-luxe design that matches the
brand. Built to replace the old WordPress site.

## Tech stack
- **[Astro](https://astro.build)** — fast static site, near-zero JS by default (great for SEO + speed).
- **React island** — the multi-step booking wizard (`client:load`).
- **Tailwind CSS v4** — styling, with brand tokens in `src/styles/global.css`.
- **Netlify** — hosting + serverless function for booking notifications.
- Self-hosted fonts (Fraunces, Manrope, Pinyon Script) — no third-party font calls.

## Local development
```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production build → dist/
npm run preview    # preview the production build
```

## Project structure
```
public/
  assets/            → logo, photos (see assets/BRAND_ASSETS.md for what to drop here)
  favicon.svg, robots.txt
src/
  data/
    site.ts          → business info, contact, links, deposit, disclaimer  ← EDIT COPY HERE
    services.ts      → the 6 IV therapies + add-ons + "why IV" content      ← EDIT MENU HERE
  styles/global.css  → brand design system (colors, fonts, animations)
  components/
    Icon.astro, Header.astro, Footer.astro, SEO.astro
    sections/        → homepage sections (Hero, ServiceMenu, AddOns, WhyIV, HowItWorks, About, Contact)
    booking/         → BookingWizard.tsx (the React booking island) + icons
  layouts/           → Base.astro, Legal.astro
  pages/
    index.astro      → homepage
    book.astro       → booking wizard page
    hipaa / privacy / cookies / terms / accessibility  → legal pages
    404.astro
netlify/
  functions/
    submit-booking.ts      → booking backend (email + Google Calendar + optional SMS)
    lib/                    → emails, google-calendar, notify (Resend/Twilio), types
netlify.toml         → build config, /api/book redirect, security headers
.env.example         → all environment variables (copy to .env for local dev)
```

## Editing common things
- **Prices / menu / descriptions:** `src/data/services.ts`
- **Phone, email, address, social, deposit amount, disclaimer:** `src/data/site.ts`
- **Consent form link:** `CONSENT_FORM_URL` env var (falls back to the Jotform URL in `site.ts`)
- **Colors / fonts / animations:** `src/styles/global.css`
- **Logo / photos:** drop files in `public/assets/` — see `public/assets/BRAND_ASSETS.md`

## Booking flow (how it works)
1. Visitor picks 1 of 6 IV therapies → optional add-ons → preferred date/time → name, phone, email, address → review.
2. On submit, the site POSTs to `/api/book` (the Netlify function).
3. The function: emails **ivsaltfl@gmail.com**, emails the **customer** a confirmation with the
   consent-form + $50-deposit call-to-action, and creates a **Google Calendar** event (marked unconfirmed).
   Twilio SMS to Sara + the customer turns on automatically once Twilio env vars are added.
4. The customer sees a success screen with the consent-form/deposit button.

**Deploying & connecting the integrations is documented in [`DEPLOYMENT.md`](./DEPLOYMENT.md).**

## Accessibility
Targets WCAG 2.1 AA: semantic HTML, keyboard support, visible focus, skip link,
reduced-motion support, labeled forms, and readable contrast. See `/accessibility`.

## Legal
Template HIPAA Notice, Privacy Policy, Cookie Policy, Terms & Conditions, and an
Accessibility statement are included under `src/pages/`. **Have them reviewed by a
qualified attorney before relying on them** — each page notes this.
