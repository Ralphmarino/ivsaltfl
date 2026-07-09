/**
 * Create a Google Calendar event using a service account.
 * We sign the OAuth2 JWT ourselves with node:crypto so no heavy SDK is needed.
 *
 * Required env:
 *   GOOGLE_CLIENT_EMAIL    – service account email
 *   GOOGLE_PRIVATE_KEY     – service account private key (PEM; \n escaped is fine)
 *   GOOGLE_CALENDAR_ID     – the calendar to add events to (share it with the SA + Sara)
 * Optional:
 *   CALENDAR_TIMEZONE      – IANA tz, defaults to America/New_York
 */
import { createSign } from 'node:crypto';
import { BookingPayload, formatAddress, mapsLink, money } from './types';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/calendar';

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = { iss: clientEmail, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;

  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = b64url(signer.sign(privateKey.replace(/\\n/g, '\n')));
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`Google token error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('No access_token returned from Google.');
  return data.access_token;
}

/** Parse "2:00 PM" → {h,m}. Returns null for "Earliest available"/unparseable. */
function parseTime(t: string): { h: number; m: number } | null {
  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(t);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const pm = /pm/i.test(match[3]);
  if (pm && h !== 12) h += 12;
  if (!pm && h === 12) h = 0;
  return { h, m };
}

function durationMinutes(duration: string): number {
  const hours = /(\d+)\s*hour/i.exec(duration);
  if (hours) return parseInt(hours[1], 10) * 60;
  const mins = /(\d+)\s*min/i.exec(duration);
  if (mins) return parseInt(mins[1], 10);
  return 90;
}

/** Local datetime string "YYYY-MM-DDTHH:mm:00" for the Google API (paired with timeZone). */
function localDateTime(date: string, h: number, m: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date}T${pad(h)}:${pad(m)}:00`;
}

export async function createCalendarEvent(b: BookingPayload): Promise<{ ok: boolean; skipped?: boolean; htmlLink?: string; error?: string }> {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const tz = process.env.CALENDAR_TIMEZONE || 'America/New_York';

  if (!clientEmail || !privateKey || !calendarId) {
    return { ok: false, skipped: true, error: 'Google Calendar env not configured' };
  }

  try {
    const token = await getAccessToken(clientEmail, privateKey);

    const parsed = parseTime(b.preferred.time);
    const start = parsed ?? { h: 9, m: 0 }; // default 9:00 AM when "Earliest available"
    const mins = durationMinutes(b.service?.duration ?? '90 min');
    const endTotal = start.h * 60 + start.m + mins;
    const endH = Math.floor(endTotal / 60) % 24;
    const endM = endTotal % 60;

    const c = b.customer;
    const description = [
      '⚠️ UNCONFIRMED — pending consent form + deposit.',
      '',
      `Therapy: ${b.service?.name} (${b.service?.duration})`,
      `Add-ons: ${b.addOns.map((a) => a.name + (a.options?.length ? ` (${a.options.join(', ')})` : '')).join(', ') || 'None'}`,
      `Estimated total: ${money(b.estimatedTotal)}`,
      `Preferred time: ${b.preferred.time}`,
      '',
      `Client: ${c.fullName}`,
      `Phone: ${c.phone}`,
      `Email: ${c.email}`,
      `Address: ${formatAddress(c)}`,
      `Map: ${mapsLink(c)}`,
      b.notes ? `Notes: ${b.notes}` : '',
    ].filter(Boolean).join('\n');

    const event = {
      summary: `[REQUEST] ${c.fullName} — ${b.service?.name ?? 'IV Therapy'}`,
      description,
      location: formatAddress(c),
      start: { dateTime: localDateTime(b.preferred.date, start.h, start.m), timeZone: tz },
      end: { dateTime: localDateTime(b.preferred.date, endH, endM), timeZone: tz },
      // color 6 = tangerine → visually flags "needs attention / unconfirmed"
      colorId: '6',
      reminders: { useDefault: true },
    };

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=none`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }
    );
    if (!res.ok) throw new Error(`Calendar insert ${res.status}: ${await res.text()}`);
    const created = (await res.json()) as { htmlLink?: string };
    return { ok: true, htmlLink: created.htmlLink };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
