/** Shared types + validation for the booking backend. */

export interface BookingPayload {
  service: { id: string; name: string; price: number; priceFrom?: boolean; duration: string } | null;
  addOns: Array<{ id: string; name: string; price: number; options?: string[] }>;
  partySize?: number;
  estimatedTotal: number;
  deposit: number;
  customer: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  preferred: { date: string; time: string };
  notes: string;
  _hp?: string;
  submittedAt: string;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** We only serve Florida. */
const SERVICE_STATE = 'FL';

/**
 * Validate a booking. `spam` is true when the honeypot was filled (silently
 * drop). `outOfArea` is true for non-Florida requests (reject).
 */
export function validateBooking(body: unknown): {
  ok: boolean;
  errors: string[];
  spam?: boolean;
  outOfArea?: boolean;
  data?: BookingPayload;
} {
  const errors: string[] = [];
  const b = body as Partial<BookingPayload> | null;

  if (!b || typeof b !== 'object') return { ok: false, errors: ['Invalid request body.'] };

  // Honeypot: real users never fill this.
  if (typeof b._hp === 'string' && b._hp.trim() !== '') {
    return { ok: false, spam: true, errors: ['Spam detected.'] };
  }

  if (!b.service || !b.service.id || !b.service.name) errors.push('Missing service selection.');
  const c = b.customer;
  if (!c) {
    errors.push('Missing customer details.');
  } else {
    if (!c.fullName?.trim()) errors.push('Missing name.');
    if (!c.phone || c.phone.replace(/\D/g, '').length < 10) errors.push('Invalid phone.');
    if (!c.email || !emailRe.test(c.email)) errors.push('Invalid email.');
    if (!c.address?.trim()) errors.push('Missing address.');
    if (!c.city?.trim()) errors.push('Missing city.');
    if (!c.zip || c.zip.replace(/\D/g, '').length < 5) errors.push('Invalid ZIP.');
    // Out-of-state guard (anti-spam + we only serve FL)
    if ((c.state || '').trim().toUpperCase() !== SERVICE_STATE) {
      return { ok: false, outOfArea: true, errors: ['Outside service area (Florida only).'] };
    }
  }
  if (!b.preferred?.date) errors.push('Missing preferred date.');

  if (errors.length) return { ok: false, errors };
  return { ok: true, errors: [], data: b as BookingPayload };
}

export const money = (n: number) => `$${Number(n || 0).toLocaleString('en-US')}`;

/** Full one-line address for display + maps link. */
export function formatAddress(c: BookingPayload['customer']): string {
  return `${c.address}, ${c.city}, ${c.state} ${c.zip}`;
}

export function mapsLink(c: BookingPayload['customer']): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(c))}`;
}
