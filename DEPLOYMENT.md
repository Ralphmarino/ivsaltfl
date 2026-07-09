# Deployment & Setup Guide

This walks you through getting the site live on **Netlify** and turning on the
booking notifications (email, Google Calendar, and optional text messages).

Follow it top to bottom. You can launch the site first (Step 1–2) and add the
booking integrations afterward — the site works before they're configured.

---

## Step 1 — Deploy to Netlify

1. Push this repository to GitHub (it already is, on your branch).
2. In [Netlify](https://app.netlify.com) → **Add new site → Import an existing project**.
3. Choose GitHub and pick this repository.
4. Netlify auto-detects the settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. Click **Deploy**. In ~1 minute you'll have a live `*.netlify.app` URL.

## Step 2 — Connect your domain (ivsaltfl.com)

1. Netlify → your site → **Domain management → Add a domain** → enter `ivsaltfl.com`.
2. Point your domain's DNS to Netlify (Netlify shows the exact records). Easiest is to
   use Netlify DNS, or add the provided A/CNAME records at your current registrar.
3. Netlify provisions HTTPS automatically.
4. Once DNS propagates, your old WordPress site is fully replaced.

> Because your other sites are already on Netlify, this keeps everything in one place.

---

## Step 3 — Email notifications (Resend) — **do this first, it's the key one**

This is what sends the booking email to **ivsaltfl@gmail.com** and the confirmation
(with the consent-form + deposit button) to the customer.

1. Create a free account at [resend.com](https://resend.com).
2. **Verify your domain**: Resend → **Domains → Add Domain** → `ivsaltfl.com`, then add
   the DNS records it gives you (same place you set up the domain). This lets email come
   from `bookings@ivsaltfl.com` and land in inboxes, not spam.
3. Resend → **API Keys → Create API Key**. Copy it.
4. In Netlify → your site → **Site configuration → Environment variables**, add:
   - `RESEND_API_KEY` = the key you copied
   - `FROM_EMAIL` = `IV Salt Rejuvenation <bookings@ivsaltfl.com>`
   - `OWNER_EMAIL` = `ivsaltfl@gmail.com`
5. **Redeploy** (Netlify → Deploys → Trigger deploy). Done — bookings now email you and the customer.

> Testing before domain verification? You can temporarily leave `FROM_EMAIL` unset; it
> falls back to Resend's `onboarding@resend.dev` sender, which only delivers to your own
> Resend account email. Verify the domain for real customer delivery.

---

## Step 4 — Google Calendar sync (optional but recommended)

Creates an event on a Google Calendar for every booking, so Sara sees it on her phone
(and the Google Calendar app can notify her).

1. Go to [Google Cloud Console](https://console.cloud.google.com) → create a project
   (e.g. "IV Salt Booking").
2. **APIs & Services → Enable APIs** → enable **Google Calendar API**.
3. **APIs & Services → Credentials → Create credentials → Service account**. Name it,
   create it, then open it → **Keys → Add key → JSON**. A `.json` file downloads.
4. Open that JSON. You need two values:
   - `client_email` → this is `GOOGLE_CLIENT_EMAIL`
   - `private_key` → this is `GOOGLE_PRIVATE_KEY` (keep the `\n` sequences as-is)
5. **Share the calendar with the service account:** open [Google Calendar](https://calendar.google.com)
   → the calendar you want bookings on (e.g. Sara's) → **Settings → Share with specific people**
   → add the `client_email` from step 4 with **"Make changes to events"**.
6. Get the **Calendar ID**: same settings page → *Integrate calendar → Calendar ID*
   (often just the Google account email, e.g. `ivsaltfl@gmail.com`).
7. In Netlify environment variables, add:
   - `GOOGLE_CLIENT_EMAIL` = the service account email
   - `GOOGLE_PRIVATE_KEY` = the private key (paste the whole thing, in quotes, keeping `\n`)
   - `GOOGLE_CALENDAR_ID` = the calendar ID
   - `CALENDAR_TIMEZONE` = `America/New_York`
8. Redeploy. New bookings now appear on the calendar marked **[REQUEST]** (unconfirmed).

---

## Step 5 — Text messages to Sara + customers (optional — Twilio)

You chose email + calendar for now. When you're ready to also **text Sara's phone** on
every booking (and text the customer their confirmation), just add Twilio — **no code
changes needed**, it's already wired up.

1. Create an account at [twilio.com](https://twilio.com) and buy a phone number (~$1/mo).
2. From the Twilio console, copy your **Account SID** and **Auth Token**.
3. In Netlify environment variables, add:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM` = your Twilio number in E.164 format, e.g. `+17725551234`
   - `SARA_PHONE` = the phone that should receive booking alerts, e.g. `+17722227108`
4. Redeploy. Now every booking texts Sara, and the customer gets a text with the
   consent-form/deposit link too.

> Until Twilio is added, Sara is notified via the booking **email** and the **Google
> Calendar** event (and its app notification). Nothing is missed.

---

## Step 6 — Consent form & deposit (Jotform)

Already wired. After booking, the customer's email and success screen link to your
Jotform consent form (which collects the $50 deposit):

`https://form.jotform.com/261876510047155`

To change it later, set the `CONSENT_FORM_URL` environment variable in Netlify (or edit
`consentFormUrl` in `src/data/site.ts`).

---

## Environment variables — quick reference

See `.env.example` for the full annotated list. Add these in **Netlify → Site
configuration → Environment variables** (not committed to git):

| Variable | Required? | Purpose |
|---|---|---|
| `RESEND_API_KEY` | ✅ for email | Send booking + confirmation emails |
| `FROM_EMAIL` | ✅ for email | Verified sender address |
| `OWNER_EMAIL` | recommended | Where booking alerts go (default ivsaltfl@gmail.com) |
| `GOOGLE_CLIENT_EMAIL` / `GOOGLE_PRIVATE_KEY` / `GOOGLE_CALENDAR_ID` | optional | Calendar sync |
| `CALENDAR_TIMEZONE` | optional | Defaults to America/New_York |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM` / `SARA_PHONE` | optional | SMS alerts |
| `SITE_URL` | optional | Defaults to https://ivsaltfl.com |
| `CONSENT_FORM_URL` | optional | Overrides the Jotform link |

## Verifying a booking end-to-end
1. Open your live site → **Book** → complete a test booking.
2. You should see the success screen with the consent-form button.
3. Check `ivsaltfl@gmail.com` for the notification email, and the test customer inbox for the confirmation.
4. If a channel is misconfigured, Netlify → **Functions → submit-booking → Logs** shows exactly what happened
   (each booking is always logged there as a safety net).

## Safety net
Even before any integration is configured, every booking is written to the Netlify
function logs, so no request is ever lost while you finish setup.
