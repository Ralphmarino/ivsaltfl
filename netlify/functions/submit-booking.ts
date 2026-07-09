/**
 * POST /api/book  →  /.netlify/functions/submit-booking
 *
 * Orchestrates a booking request:
 *   1. Validate the payload
 *   2. Email the business owner (ivsaltfl@gmail.com)
 *   3. Email the customer their confirmation + consent-form/deposit CTA
 *   4. Create a Google Calendar event (marked unconfirmed)
 *   5. (optional) Text Sara + the customer via Twilio when configured
 *
 * Every channel fails soft: a missing integration is "skipped", not fatal, so
 * bookings keep flowing while you finish setup. The full request is always
 * logged to the function logs as a last-resort record.
 */
import type { Context } from '@netlify/functions';
import { validateBooking, money, formatAddress } from './lib/types';
import { ownerEmail, customerEmail } from './lib/emails';
import { sendEmail, sendSms } from './lib/notify';
import { createCalendarEvent } from './lib/google-calendar';
import { buildIcs, icsBase64, durationToMinutes } from './lib/ics';

const SITE_URL = process.env.SITE_URL || 'https://ivsaltfl.com';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'ivsaltfl@gmail.com';
const CONSENT_URL = process.env.CONSENT_FORM_URL || 'https://form.jotform.com/261876510047155';
// Sara's mobile for SMS alerts (E.164, e.g. +17722227108). Optional.
const SARA_PHONE = process.env.SARA_PHONE || '';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default async (req: Request, _context: Context): Promise<Response> => {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON' });
  }

  const { ok, errors, data, spam, outOfArea } = validateBooking(body);
  // Honeypot hit: pretend success so bots don't learn, but send nothing.
  if (spam) {
    console.warn('🚫 Spam booking dropped (honeypot).');
    return json(200, { ok: true });
  }
  // Non-Florida request: reject (we only serve FL).
  if (outOfArea) {
    console.warn('🚫 Out-of-area booking rejected (non-FL).');
    return json(422, { ok: false, error: 'We currently serve Florida (the Treasure Coast) only.' });
  }
  if (!ok || !data) return json(422, { ok: false, error: 'Validation failed', details: errors });

  // Always log the booking so it is never lost, even mid-setup.
  console.log('📅 BOOKING REQUEST', JSON.stringify({
    name: data.customer.fullName,
    phone: data.customer.phone,
    email: data.customer.email,
    address: formatAddress(data.customer),
    service: data.service?.name,
    addOns: data.addOns.map((a) => a.name),
    partySize: data.partySize ?? 1,
    total: data.estimatedTotal,
    deposit: data.deposit,
    preferred: data.preferred,
  }));

  const owner = ownerEmail(data, SITE_URL);
  const customer = customerEmail(data, SITE_URL, CONSENT_URL);

  // Calendar invite (.ics) attached to both emails so each side can add it.
  const durMin = durationToMinutes(data.service?.duration ?? '90 min');
  const uidBase = `${data.preferred.date}-${(data.preferred.time || '').replace(/\s/g, '')}-${data.customer.email}`.replace(/[^a-zA-Z0-9@.\-]/g, '');
  const custIcs = buildIcs({
    uid: `cust-${uidBase}@ivsaltfl.com`,
    title: `IV Salt Rejuvenation — ${data.service?.name ?? 'IV Therapy'} (requested)`,
    description: `Your requested mobile IV session. NOT confirmed until you complete the consent form and deposit: ${CONSENT_URL}\\n\\nQuestions? Call or text 772-222-7108.`,
    location: formatAddress(data.customer),
    dateISO: data.preferred.date,
    time: data.preferred.time,
    durationMinutes: durMin,
    status: 'TENTATIVE',
  });
  const ownerIcs = buildIcs({
    uid: `owner-${uidBase}@ivsaltfl.com`,
    title: `[REQUEST] ${data.customer.fullName} — ${data.service?.name ?? 'IV Therapy'}`,
    description: `Unconfirmed booking request.\\nClient: ${data.customer.fullName}\\nPhone: ${data.customer.phone}\\nEmail: ${data.customer.email}\\nGuests: ${data.partySize ?? 1}\\nEst. total: ${money(data.estimatedTotal)} · Deposit: ${money(data.deposit)}`,
    location: formatAddress(data.customer),
    dateISO: data.preferred.date,
    time: data.preferred.time,
    durationMinutes: durMin,
    status: 'TENTATIVE',
  });
  const custAttach = [{ filename: 'appointment.ics', content: icsBase64(custIcs), contentType: 'text/calendar' }];
  const ownerAttach = [{ filename: 'booking-request.ics', content: icsBase64(ownerIcs), contentType: 'text/calendar' }];

  const partyNote = (data.partySize ?? 1) > 1 ? ` [${data.partySize} guests]` : '';
  const smsOwnerBody =
    `New IV booking request (UNCONFIRMED): ${data.customer.fullName}${partyNote}, ${data.service?.name} ` +
    `${money(data.estimatedTotal)}, ${data.preferred.date} ${data.preferred.time}. ` +
    `${data.customer.phone}. ${formatAddress(data.customer)}`;
  const smsCustomerBody =
    `IV Salt Rejuvenation: we got your booking request! To confirm, please complete the consent form ` +
    `and $${data.deposit} deposit: ${CONSENT_URL} — Questions? Call/text 772-222-7108.`;

  // Fire all channels in parallel; none can block another.
  const [ownerMail, custMail, calendar, ownerSms, custSms] = await Promise.all([
    sendEmail({ to: OWNER_EMAIL, subject: owner.subject, html: owner.html, text: owner.text, replyTo: data.customer.email, attachments: ownerAttach }),
    sendEmail({ to: data.customer.email, subject: customer.subject, html: customer.html, text: customer.text, replyTo: OWNER_EMAIL, attachments: custAttach }),
    createCalendarEvent(data),
    sendSms({ to: SARA_PHONE, body: smsOwnerBody }),
    sendSms({ to: data.customer.phone, body: smsCustomerBody }),
  ]);

  const channels = { ownerMail, custMail, calendar, ownerSms, custSms };
  // Log any hard failures (skipped = intentionally-unconfigured, not an error).
  for (const [name, r] of Object.entries(channels)) {
    if (!r.ok && !r.skipped) console.error(`Channel "${name}" failed:`, r.error);
  }

  // The request itself is valid and recorded → success for the customer.
  return json(200, { ok: true, channels });
};
