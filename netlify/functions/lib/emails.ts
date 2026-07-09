/** Branded HTML email builders (inline styles for max client support). */
import { BookingPayload, formatAddress, mapsLink, money } from './types';

const BRAND = {
  navy: '#0a0e1c',
  ink: '#05070f',
  pink: '#ff3d9a',
  teal: '#29c4d6',
  gold: '#c99a3f',
  text: '#1f2430',
  muted: '#6b7280',
  border: '#e6e8ee',
};

function addOnLine(a: BookingPayload['addOns'][number]): string {
  const opt = a.options && a.options.length ? ` (${a.options.join(', ')})` : '';
  return `${a.name}${opt}`;
}

function shell(title: string, inner: string, siteUrl: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.ink};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${BRAND.text};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.ink};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
  <tr><td style="background:linear-gradient(115deg,${BRAND.teal},${BRAND.pink});padding:22px 28px;">
    <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:.3px;">IV Salt Rejuvenation</span>
    <div style="color:rgba(255,255,255,.9);font-size:12px;margin-top:2px;">Mobile IV Hydration &amp; Wellness</div>
  </td></tr>
  <tr><td style="padding:28px;">
    <h1 style="margin:0 0 6px;font-size:20px;color:${BRAND.navy};">${title}</h1>
    ${inner}
  </td></tr>
  <tr><td style="padding:18px 28px;background:${BRAND.navy};color:#aeb8cf;font-size:12px;line-height:1.6;">
    IV Salt Rejuvenation &middot; Serving Port St. Lucie, Stuart &amp; the Treasure Coast<br>
    <a href="tel:+17722227108" style="color:${BRAND.teal};text-decoration:none;">772-222-7108</a> &middot;
    <a href="mailto:ivsaltfl@gmail.com" style="color:${BRAND.teal};text-decoration:none;">ivsaltfl@gmail.com</a> &middot;
    <a href="${siteUrl}" style="color:${BRAND.teal};text-decoration:none;">ivsaltfl.com</a>
  </td></tr>
</table>
<div style="max-width:600px;color:#7c8299;font-size:11px;line-height:1.6;padding:16px 8px;text-align:center;">
  All IV therapies are administered by a licensed Registered Nurse under the supervision of a medical director.
  IV therapy is not intended to diagnose, treat, cure, or prevent any disease. Individual results may vary.
</div>
</td></tr></table></body></html>`;
}

function summaryTable(b: BookingPayload): string {
  const rows: string[] = [];
  if (b.service)
    rows.push(
      `<tr><td style="padding:8px 0;color:${BRAND.muted};">Therapy</td><td style="padding:8px 0;text-align:right;font-weight:700;color:${BRAND.navy};">${b.service.name} <span style="color:${BRAND.gold};">${b.service.priceFrom ? 'from ' : ''}${money(b.service.price)}</span></td></tr>`
    );
  if (b.addOns.length)
    rows.push(
      `<tr><td style="padding:8px 0;color:${BRAND.muted};vertical-align:top;">Add-ons</td><td style="padding:8px 0;text-align:right;color:${BRAND.navy};">${b.addOns
        .map((a) => `${addOnLine(a)} <span style="color:${BRAND.gold};">+${money(a.price)}</span>`)
        .join('<br>')}</td></tr>`
    );
  rows.push(
    `<tr><td style="padding:8px 0;color:${BRAND.muted};">Preferred</td><td style="padding:8px 0;text-align:right;color:${BRAND.navy};">${b.preferred.date} &middot; ${b.preferred.time}</td></tr>`
  );
  rows.push(
    `<tr><td style="padding:10px 0 0;color:${BRAND.muted};border-top:1px solid ${BRAND.border};">Estimated total</td><td style="padding:10px 0 0;text-align:right;font-weight:800;color:${BRAND.navy};border-top:1px solid ${BRAND.border};">${b.service?.priceFrom || b.addOns.length ? '~' : ''}${money(b.estimatedTotal)}</td></tr>`
  );
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">${rows.join('')}</table>`;
}

/** Email to the business owner (Sara / ivsaltfl@gmail.com). */
export function ownerEmail(b: BookingPayload, siteUrl: string) {
  const c = b.customer;
  const inner = `
  <p style="margin:0 0 18px;color:${BRAND.muted};font-size:14px;">A new booking request just came in. It is <strong style="color:${BRAND.pink};">unconfirmed</strong> until the client completes the consent form and $${b.deposit} deposit.</p>
  <div style="background:#f7f8fb;border:1px solid ${BRAND.border};border-radius:12px;padding:16px 18px;margin-bottom:18px;">
    ${summaryTable(b)}
  </div>
  <div style="background:#f7f8fb;border:1px solid ${BRAND.border};border-radius:12px;padding:16px 18px;">
    <h2 style="margin:0 0 10px;font-size:15px;color:${BRAND.navy};">Client</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:${BRAND.navy};line-height:1.7;">
      <tr><td style="color:${BRAND.muted};width:90px;">Name</td><td style="font-weight:700;">${c.fullName}</td></tr>
      <tr><td style="color:${BRAND.muted};">Phone</td><td><a href="tel:${c.phone.replace(/\D/g, '')}" style="color:${BRAND.teal};text-decoration:none;">${c.phone}</a></td></tr>
      <tr><td style="color:${BRAND.muted};">Email</td><td><a href="mailto:${c.email}" style="color:${BRAND.teal};text-decoration:none;">${c.email}</a></td></tr>
      <tr><td style="color:${BRAND.muted};vertical-align:top;">Address</td><td><a href="${mapsLink(c)}" style="color:${BRAND.teal};text-decoration:none;">${formatAddress(c)}</a></td></tr>
      ${b.notes ? `<tr><td style="color:${BRAND.muted};vertical-align:top;">Notes</td><td>${escapeHtml(b.notes)}</td></tr>` : ''}
    </table>
  </div>`;
  const text = `New booking request (UNCONFIRMED until consent form + $${b.deposit} deposit)
Therapy: ${b.service?.name} ${b.service?.price ? money(b.service.price) : ''}
Add-ons: ${b.addOns.map(addOnLine).join(', ') || 'None'}
Estimated total: ${money(b.estimatedTotal)}
Preferred: ${b.preferred.date} ${b.preferred.time}
Name: ${c.fullName}
Phone: ${c.phone}
Email: ${c.email}
Address: ${formatAddress(c)}
Map: ${mapsLink(c)}
Notes: ${b.notes || '—'}`;
  return {
    subject: `New booking request — ${c.fullName} (${b.service?.name ?? 'IV'})`,
    html: shell('New booking request 🎉', inner, siteUrl),
    text,
  };
}

/** Confirmation email to the customer. */
export function customerEmail(b: BookingPayload, siteUrl: string, consentUrl: string) {
  const first = b.customer.fullName.split(' ')[0] || 'there';
  const inner = `
  <p style="margin:0 0 16px;font-size:15px;color:${BRAND.text};">Hi ${escapeHtml(first)}, thanks for booking with IV Salt Rejuvenation! We've received your request for a mobile IV session.</p>
  <div style="background:#fff8ee;border:1px solid #f0d8a8;border-radius:12px;padding:18px;margin-bottom:20px;">
    <p style="margin:0 0 6px;font-weight:800;color:#8a5a00;font-size:15px;">⚠️ One step to confirm your appointment</p>
    <p style="margin:0 0 14px;font-size:14px;color:#6b5326;line-height:1.6;">Your appointment isn't confirmed until you complete the medical consent form and place a refundable <strong>$${b.deposit} deposit</strong> (applied toward your treatment). You can do both in one place:</p>
    <a href="${consentUrl}" style="display:inline-block;background:linear-gradient(100deg,${BRAND.pink},#d61e78);color:#fff;text-decoration:none;font-weight:800;padding:13px 24px;border-radius:999px;font-size:15px;">Complete Consent Form &amp; Pay Deposit →</a>
  </div>
  <h2 style="margin:0 0 8px;font-size:15px;color:${BRAND.navy};">Your request</h2>
  <div style="background:#f7f8fb;border:1px solid ${BRAND.border};border-radius:12px;padding:16px 18px;margin-bottom:18px;">${summaryTable(b)}</div>
  <p style="font-size:14px;color:${BRAND.muted};line-height:1.7;">We'll reach out to confirm your exact time. Questions? Call or text <a href="tel:+17722227108" style="color:${BRAND.teal};text-decoration:none;">772-222-7108</a>.</p>
  <p style="font-size:16px;color:${BRAND.pink};font-style:italic;margin-top:20px;">Your wellness. Our priority.</p>`;
  const text = `Hi ${first}, thanks for booking with IV Salt Rejuvenation!

ACTION REQUIRED: Your appointment isn't confirmed until you complete the consent form and place a refundable $${b.deposit} deposit (applied to your treatment):
${consentUrl}

Your request:
Therapy: ${b.service?.name}
Add-ons: ${b.addOns.map(addOnLine).join(', ') || 'None'}
Estimated total: ${money(b.estimatedTotal)}
Preferred: ${b.preferred.date} ${b.preferred.time}

Questions? Call or text 772-222-7108.
Your wellness. Our priority.`;
  return {
    subject: `We got your request — one step to confirm 💧`,
    html: shell('Thanks for your booking request! 💧', inner, siteUrl),
    text,
  };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
}
