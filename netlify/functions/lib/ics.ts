/**
 * Build an .ics calendar file for a booking. Attached to both the customer
 * and owner emails so each can add the appointment to their calendar.
 * Uses floating local time (no timezone), which calendar apps interpret as
 * the viewer's local time — fine for a single-market local business.
 */

function parseTime(t: string): { h: number; m: number } {
  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(t);
  if (!match) return { h: 9, m: 0 };
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const pm = /pm/i.test(match[3]);
  if (pm && h !== 12) h += 12;
  if (!pm && h === 12) h = 0;
  return { h, m };
}

/** Minutes from a duration label like "90 min" or "2-4 hours" (uses the max). */
export function durationToMinutes(duration: string): number {
  const hourNums = [...duration.matchAll(/(\d+)\s*hour/gi)].map((x) => parseInt(x[1], 10));
  if (hourNums.length) return Math.max(...hourNums) * 60;
  const mins = /(\d+)\s*min/i.exec(duration);
  if (mins) return parseInt(mins[1], 10);
  return 90;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Local floating stamp: 20260720T140000 */
function localStamp(dateISO: string, h: number, m: number): string {
  const [y, mo, d] = dateISO.split('-').map(Number);
  return `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(m)}00`;
}

/** UTC stamp for DTSTAMP: 20260709T130000Z */
function utcStamp(now: Date): string {
  return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
}

function esc(s: string): string {
  return (s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

export interface IcsOptions {
  uid: string;
  title: string;
  description: string;
  location: string;
  dateISO: string;
  time: string;
  durationMinutes: number;
  status?: 'TENTATIVE' | 'CONFIRMED';
}

export function buildIcs(o: IcsOptions): string {
  const start = parseTime(o.time);
  const totalStart = start.h * 60 + start.m;
  const totalEnd = totalStart + o.durationMinutes;
  const endH = Math.floor(totalEnd / 60) % 24;
  const endM = totalEnd % 60;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IV Salt Rejuvenation//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${o.uid}`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${localStamp(o.dateISO, start.h, start.m)}`,
    `DTEND:${localStamp(o.dateISO, endH, endM)}`,
    `SUMMARY:${esc(o.title)}`,
    `DESCRIPTION:${esc(o.description)}`,
    `LOCATION:${esc(o.location)}`,
    `STATUS:${o.status ?? 'TENTATIVE'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  // Fold lines defensively (calendars want <=75 octets/line, CRLF).
  return lines.join('\r\n');
}

/** Base64-encode ICS content for an email attachment. */
export function icsBase64(ics: string): string {
  return Buffer.from(ics, 'utf-8').toString('base64');
}
