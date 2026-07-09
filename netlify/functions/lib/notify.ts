/**
 * Email (Resend) + SMS (Twilio) senders.
 * Both no-op gracefully (skipped:true) when their env vars aren't set, so the
 * site keeps working before every integration is configured.
 */

interface ChannelResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  id?: string;
}

/** Send an email via the Resend REST API. */
export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: string; contentType?: string }>;
}): Promise<ChannelResult> {
  const apiKey = process.env.RESEND_API_KEY;
  // FROM_EMAIL must be an address on a domain verified in Resend,
  // e.g. "IV Salt Rejuvenation <bookings@ivsaltfl.com>".
  const from = process.env.FROM_EMAIL || 'IV Salt Rejuvenation <onboarding@resend.dev>';
  if (!apiKey) return { ok: false, skipped: true, error: 'RESEND_API_KEY not set' };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
        ...(opts.attachments ? { attachments: opts.attachments } : {}),
      }),
    });
    if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${await res.text()}` };
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Send an SMS via Twilio. Pre-wired but OPTIONAL — the moment you add
 * TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM (+ a recipient),
 * texts start sending with no code changes.
 */
export async function sendSms(opts: { to: string; body: string }): Promise<ChannelResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) return { ok: false, skipped: true, error: 'Twilio not configured' };
  if (!opts.to) return { ok: false, skipped: true, error: 'No SMS recipient' };

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: opts.to, From: from, Body: opts.body }),
    });
    if (!res.ok) return { ok: false, error: `Twilio ${res.status}: ${await res.text()}` };
    const data = (await res.json()) as { sid?: string };
    return { ok: true, id: data.sid };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
