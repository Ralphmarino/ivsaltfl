import { useEffect, useMemo, useRef, useState } from 'react';
import { services, addOns } from '../../data/services';
import { site } from '../../data/site';
import { Icon, Spinner } from './BookingIcons';

/* ------------------------------------------------------------------ *
 *  Types + helpers
 * ------------------------------------------------------------------ */
type Details = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  date: string;
  time: string;
  notes: string;
};

const emptyDetails: Details = {
  fullName: '', phone: '', email: '', address: '', address2: '',
  city: '', state: 'FL', zip: '', date: '', time: '', notes: '',
};

const STEPS = ['Therapy', 'Add-Ons', 'Date & Time', 'Your Details', 'Review'];

const TIME_SLOTS = [
  'Earliest available', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
];

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digits = (s: string) => s.replace(/\D/g, '');
const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
const money = (n: number) => `$${n.toLocaleString('en-US')}`;

/* ------------------------------------------------------------------ *
 *  Component
 * ------------------------------------------------------------------ */
export default function BookingWizard() {
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [boostChoices, setBoostChoices] = useState<string[]>([]);
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const topRef = useRef<HTMLDivElement>(null);

  // Preselect a therapy from ?service=… (deep links from the menu)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pre = params.get('service');
    if (pre && services.some((s) => s.id === pre)) {
      setServiceId(pre);
      setStep(1);
    }
  }, []);

  // Scroll the wizard into view on step change (not on first mount)
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else mounted.current = true;
  }, [step, status]);

  const service = useMemo(() => services.find((s) => s.id === serviceId) ?? null, [serviceId]);
  const chosenAddOns = useMemo(() => addOns.filter((a) => selectedAddOns.includes(a.id)), [selectedAddOns]);

  const estTotal = useMemo(() => {
    const base = service?.price ?? 0;
    const add = chosenAddOns.reduce((sum, a) => sum + a.price, 0);
    return base + add;
  }, [service, chosenAddOns]);

  /* ---------- validation ---------- */
  function validate(target: number): boolean {
    const e: Record<string, string> = {};
    if (target > 0 && !serviceId) e.service = 'Please choose an IV therapy to continue.';
    if (target > 1 && selectedAddOns.includes('extra-boost') && boostChoices.length === 0)
      e.boost = 'Pick at least one Extra Boost, or remove the add-on.';
    if (target > 2) {
      if (!details.date) e.date = 'Please choose a preferred date.';
      if (!details.time) e.time = 'Please choose a preferred time.';
    }
    if (target > 3) {
      if (!details.fullName.trim()) e.fullName = 'Your name is required.';
      if (digits(details.phone).length < 10) e.phone = 'Enter a valid phone number.';
      if (!emailRe.test(details.email)) e.email = 'Enter a valid email address.';
      if (!details.address.trim()) e.address = 'Street address is required.';
      if (!details.city.trim()) e.city = 'City is required.';
      if (digits(details.zip).length < 5) e.zip = 'Enter a valid ZIP code.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate(step + 1)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }
  function goTo(target: number) {
    // allow jumping back freely, forward only if valid so far
    if (target < step || validate(target)) setStep(target);
  }

  function toggleAddOn(id: string) {
    setSelectedAddOns((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
    if (id === 'extra-boost') setBoostChoices([]);
  }
  function toggleBoost(opt: string) {
    setBoostChoices((cur) => (cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]));
  }
  function setField<K extends keyof Details>(k: K, v: Details[K]) {
    setDetails((d) => ({ ...d, [k]: v }));
  }

  /* ---------- submit ---------- */
  async function submit() {
    if (!consent) {
      setErrors({ consent: 'Please acknowledge the consent form & deposit to continue.' });
      return;
    }
    if (!validate(4)) {
      setStep(3);
      return;
    }
    setStatus('sending');
    const payload = {
      service: service ? { id: service.id, name: service.name, price: service.price, priceFrom: !!service.priceFrom, duration: service.duration } : null,
      addOns: chosenAddOns.map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
        options: a.id === 'extra-boost' ? boostChoices : undefined,
      })),
      estimatedTotal: estTotal,
      deposit: site.depositAmount,
      customer: {
        fullName: details.fullName.trim(),
        phone: details.phone.trim(),
        email: details.email.trim(),
        address: [details.address.trim(), details.address2.trim()].filter(Boolean).join(', '),
        city: details.city.trim(),
        state: details.state.trim(),
        zip: details.zip.trim(),
      },
      preferred: { date: details.date, time: details.time },
      notes: details.notes.trim(),
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('success');
    } catch (err) {
      console.error('Booking submit failed:', err);
      setStatus('error');
    }
  }

  /* ---------------------------------------------------------------- *
   *  Success screen
   * ---------------------------------------------------------------- */
  if (status === 'success') {
    return (
      <div ref={topRef} className="mx-auto max-w-2xl">
        <div className="card overflow-hidden rounded-3xl p-8 text-center md:p-12">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-teal to-pink text-white">
            <Icon name="check" size={44} />
          </div>
          <h2 className="mt-6 font-display text-3xl text-cream md:text-4xl">Request received!</h2>
          <p className="mx-auto mt-3 max-w-md text-mist">
            Thanks, {details.fullName.split(' ')[0] || 'friend'}! We've got your booking request and sent a
            confirmation to <span className="text-cream">{details.email}</span>.
          </p>

          <div className="mt-8 rounded-2xl border border-gold/30 bg-gold/5 p-6 text-left">
            <p className="flex items-center gap-2 font-display text-lg text-gold-bright">
              <Icon name="check" size={20} /> One quick step to confirm
            </p>
            <p className="mt-2 text-sm leading-relaxed text-mist">
              Your appointment isn't confirmed until you complete the medical consent form and place your
              refundable <strong className="text-cream">{money(site.depositAmount)} deposit</strong> (applied
              toward your treatment). You can do both in one place:
            </p>
            <a href={site.consentFormUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-5 w-full">
              Complete Consent Form &amp; Pay Deposit <Icon name="arrow-right" size={18} />
            </a>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-mist sm:grid-cols-2">
            <a href={site.phoneHref} className="card card-hover flex items-center justify-center gap-2 p-3">
              <Icon name="phone" size={18} className="text-teal-bright" /> {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="card card-hover flex items-center justify-center gap-2 p-3">
              <Icon name="mail" size={18} className="text-pink-bright" /> {site.email}
            </a>
          </div>
          <a href="/" className="mt-8 inline-block text-sm text-mist-dim underline-offset-4 hover:text-cream hover:underline">
            ← Back to home
          </a>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- *
   *  Wizard
   * ---------------------------------------------------------------- */
  return (
    <div ref={topRef} className="mx-auto max-w-5xl scroll-mt-28">
      {/* Progress */}
      <ol className="mb-8 flex items-center justify-between gap-1" aria-label="Booking progress">
        {STEPS.map((label, i) => {
          const state = i < step ? 'done' : i === step ? 'current' : 'upcoming';
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                onClick={() => goTo(i)}
                disabled={i > step}
                aria-current={state === 'current' ? 'step' : undefined}
                className={`group flex shrink-0 items-center gap-2 rounded-full transition ${i > step ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full border text-sm font-bold transition ${
                    state === 'done'
                      ? 'border-transparent bg-gradient-to-br from-teal to-pink text-white'
                      : state === 'current'
                        ? 'border-teal-bright bg-teal/10 text-teal-bright'
                        : 'border-white/15 text-mist-dim'
                  }`}
                >
                  {state === 'done' ? <Icon name="check" size={18} /> : i + 1}
                </span>
                <span className={`hidden text-sm font-semibold sm:inline ${state === 'upcoming' ? 'text-mist-dim' : 'text-cream'}`}>
                  {label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span className={`mx-2 h-px flex-1 ${i < step ? 'bg-gradient-to-r from-teal to-pink' : 'bg-white/10'}`} />
              )}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Main panel */}
        <div className="card rounded-3xl p-6 md:p-8">
          {/* STEP 1 — Therapy */}
          {step === 0 && (
            <section aria-labelledby="step-therapy">
              <StepHead id="step-therapy" eyebrow="Step 1" title="Choose your IV therapy" hint="Select the infusion that fits your goals." />
              {errors.service && <ErrorNote>{errors.service}</ErrorNote>}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {services.map((s) => {
                  const active = serviceId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceId(s.id)}
                      aria-pressed={active}
                      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                        active ? 'border-teal-bright bg-teal/10 shadow-lg shadow-teal/10' : 'border-white/10 hover:border-white/25 hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${active ? 'bg-gradient-to-br from-teal to-pink text-white' : 'bg-white/5 text-teal-bright'}`}>
                        <Icon name={s.icon} size={22} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="font-display text-lg text-cream">{s.name}</span>
                          <span className="shrink-0 text-sm font-bold text-gold-bright">
                            {s.priceFrom ? 'from ' : ''}{money(s.price)}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-mist">{s.description}</span>
                        <span className="mt-1.5 flex items-center gap-1 text-xs text-mist-dim"><Icon name="clock" size={13} /> {s.duration}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP 2 — Add-ons */}
          {step === 1 && (
            <section aria-labelledby="step-addons">
              <StepHead id="step-addons" eyebrow="Step 2" title="Add a boost? (optional)" hint="Enhance your infusion. Skip if you'd rather not." />
              {errors.boost && <ErrorNote>{errors.boost}</ErrorNote>}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {addOns.map((a) => {
                  const active = selectedAddOns.includes(a.id);
                  return (
                    <div key={a.id} className={`rounded-2xl border p-4 transition ${active ? 'border-pink/50 bg-pink/[0.07]' : 'border-white/10'}`}>
                      <button type="button" onClick={() => toggleAddOn(a.id)} aria-pressed={active} className="flex w-full items-start gap-3 text-left">
                        <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border transition ${active ? 'border-transparent bg-gradient-to-br from-pink to-gold text-white' : 'border-white/25 text-transparent'}`}>
                          <Icon name="check" size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="font-display text-base text-cream">{a.name}</span>
                            <span className="shrink-0 text-sm font-bold text-gold-bright">+{money(a.price)}</span>
                          </span>
                          <span className="mt-0.5 block text-xs text-mist">{a.description}</span>
                        </span>
                      </button>
                      {a.options && active && (
                        <div className="mt-3 flex flex-wrap gap-2 pl-9">
                          {a.options.map((opt) => {
                            const on = boostChoices.includes(opt);
                            return (
                              <button key={opt} type="button" onClick={() => toggleBoost(opt)} aria-pressed={on}
                                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${on ? 'border-transparent bg-teal text-ink' : 'border-white/20 text-mist hover:border-white/40'}`}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP 3 — Date & time */}
          {step === 2 && (
            <section aria-labelledby="step-when">
              <StepHead id="step-when" eyebrow="Step 3" title="Pick a preferred time" hint="We'll confirm the exact time with you. Times are a preference, not a guarantee." />
              <div className="mt-6 grid gap-6">
                <Field label="Preferred date" error={errors.date} htmlFor="date">
                  <input id="date" type="date" min={todayISO()} value={details.date}
                    onChange={(e) => setField('date', e.target.value)} className="input" />
                </Field>
                <div>
                  <label className="label">Preferred time {errors.time && <span className="text-pink-bright">— {errors.time}</span>}</label>
                  <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Preferred time">
                    {TIME_SLOTS.map((t) => {
                      const on = details.time === t;
                      return (
                        <button key={t} type="button" role="radio" aria-checked={on} onClick={() => setField('time', t)}
                          className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${on ? 'border-transparent bg-gradient-to-r from-teal to-pink text-white' : 'border-white/15 text-mist hover:border-white/35'}`}>
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* STEP 4 — Details */}
          {step === 3 && (
            <section aria-labelledby="step-details">
              <StepHead id="step-details" eyebrow="Step 4" title="Where should we come?" hint="Tell us how to reach you and where to deliver your session." />
              <div className="mt-6 grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" error={errors.fullName} htmlFor="fullName">
                    <input id="fullName" autoComplete="name" value={details.fullName} onChange={(e) => setField('fullName', e.target.value)} className="input" placeholder="Jane Doe" />
                  </Field>
                  <Field label="Phone" error={errors.phone} htmlFor="phone">
                    <input id="phone" type="tel" autoComplete="tel" value={details.phone} onChange={(e) => setField('phone', e.target.value)} className="input" placeholder="(772) 222-7108" />
                  </Field>
                </div>
                <Field label="Email" error={errors.email} htmlFor="email">
                  <input id="email" type="email" autoComplete="email" value={details.email} onChange={(e) => setField('email', e.target.value)} className="input" placeholder="you@email.com" />
                </Field>
                <Field label="Street address" error={errors.address} htmlFor="address">
                  <input id="address" autoComplete="address-line1" value={details.address} onChange={(e) => setField('address', e.target.value)} className="input" placeholder="123 Ocean Dr" />
                </Field>
                <Field label="Apt, suite, unit (optional)" htmlFor="address2">
                  <input id="address2" autoComplete="address-line2" value={details.address2} onChange={(e) => setField('address2', e.target.value)} className="input" placeholder="Apt 4B" />
                </Field>
                <div className="grid gap-5 sm:grid-cols-[1fr_6rem_8rem]">
                  <Field label="City" error={errors.city} htmlFor="city">
                    <input id="city" autoComplete="address-level2" value={details.city} onChange={(e) => setField('city', e.target.value)} className="input" placeholder="Stuart" />
                  </Field>
                  <Field label="State" htmlFor="state">
                    <input id="state" autoComplete="address-level1" value={details.state} onChange={(e) => setField('state', e.target.value)} className="input" />
                  </Field>
                  <Field label="ZIP" error={errors.zip} htmlFor="zip">
                    <input id="zip" inputMode="numeric" autoComplete="postal-code" value={details.zip} onChange={(e) => setField('zip', e.target.value)} className="input" placeholder="34994" />
                  </Field>
                </div>
                <Field label="Anything we should know? (optional)" htmlFor="notes">
                  <textarea id="notes" rows={3} value={details.notes} onChange={(e) => setField('notes', e.target.value)} className="input resize-none" placeholder="Parking notes, health notes, questions…" />
                </Field>
              </div>
            </section>
          )}

          {/* STEP 5 — Review */}
          {step === 4 && (
            <section aria-labelledby="step-review">
              <StepHead id="step-review" eyebrow="Step 5" title="Review & request" hint="Double-check everything, then send your request." />
              <div className="mt-6 space-y-3">
                <ReviewRow label="Therapy" onEdit={() => setStep(0)}>
                  <span className="text-cream">{service?.name}</span>
                  <span className="text-gold-bright">{service?.priceFrom ? 'from ' : ''}{money(service?.price ?? 0)}</span>
                </ReviewRow>
                <ReviewRow label="Add-ons" onEdit={() => setStep(1)}>
                  {chosenAddOns.length === 0 ? (
                    <span className="text-mist-dim">None</span>
                  ) : (
                    <ul className="space-y-1">
                      {chosenAddOns.map((a) => (
                        <li key={a.id} className="flex justify-between gap-3">
                          <span className="text-cream">{a.name}{a.id === 'extra-boost' && boostChoices.length ? ` (${boostChoices.join(', ')})` : ''}</span>
                          <span className="text-gold-bright">+{money(a.price)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </ReviewRow>
                <ReviewRow label="Preferred" onEdit={() => setStep(2)}>
                  <span className="text-cream">{details.date || '—'} · {details.time || '—'}</span>
                </ReviewRow>
                <ReviewRow label="Contact" onEdit={() => setStep(3)}>
                  <div className="text-cream">
                    <div>{details.fullName}</div>
                    <div className="text-mist">{details.phone} · {details.email}</div>
                    <div className="text-mist">{[details.address, details.address2].filter(Boolean).join(', ')}, {details.city}, {details.state} {details.zip}</div>
                  </div>
                </ReviewRow>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-gold/25 bg-gold/5 px-5 py-4">
                <span className="text-sm text-mist">Estimated total<span className="block text-xs text-mist-dim">Final total confirmed by your nurse</span></span>
                <span className="font-display text-2xl text-gold-bright">{service?.priceFrom || chosenAddOns.length ? '~' : ''}{money(estTotal)}</span>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 p-4 text-sm text-mist">
                <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErrors((x) => ({ ...x, consent: '' })); }}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-pink" />
                <span>
                  I understand my appointment is <strong className="text-cream">not confirmed</strong> until I complete the
                  medical consent form and place a refundable {money(site.depositAmount)} deposit (applied to my treatment).
                  I agree to the{' '}
                  <a href="/terms" target="_blank" className="text-teal-bright underline">Terms</a>,{' '}
                  <a href="/privacy" target="_blank" className="text-teal-bright underline">Privacy Policy</a>, and{' '}
                  <a href="/hipaa" target="_blank" className="text-teal-bright underline">HIPAA Notice</a>.
                </span>
              </label>
              {errors.consent && <ErrorNote>{errors.consent}</ErrorNote>}

              {status === 'error' && (
                <div className="mt-4 rounded-2xl border border-pink/40 bg-pink/10 p-4 text-sm text-cream">
                  Something went wrong sending your request. Please try again, or contact us directly at{' '}
                  <a href={site.phoneHref} className="font-semibold underline">{site.phone}</a> /{' '}
                  <a href={`mailto:${site.email}`} className="font-semibold underline">{site.email}</a>.
                </div>
              )}
            </section>
          )}

          {/* Nav buttons */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/8 pt-6">
            {step > 0 ? (
              <button type="button" onClick={back} className="btn btn-ghost !px-5">
                <Icon name="arrow-left" size={18} /> Back
              </button>
            ) : <span />}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="btn btn-teal !px-7">
                Continue <Icon name="arrow-right" size={18} />
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={status === 'sending'} className="btn btn-primary !px-7 disabled:opacity-70">
                {status === 'sending' ? (<><Spinner /> Sending…</>) : (<>Send Request <Icon name="arrow-right" size={18} /></>)}
              </button>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card rounded-3xl p-6">
            <h2 className="font-display text-lg text-cream">Your session</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-mist">Therapy</span>
                <span className="text-right font-medium text-cream">{service?.name ?? <span className="text-mist-dim">Not selected</span>}</span>
              </div>
              {chosenAddOns.map((a) => (
                <div key={a.id} className="flex items-center justify-between">
                  <span className="text-mist">+ {a.name}</span>
                  <span className="text-gold-bright">{money(a.price)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-white/8 pt-3">
                <span className="font-semibold text-cream">Est. total</span>
                <span className="font-display text-xl text-gold-bright">{service ? `${service.priceFrom || chosenAddOns.length ? '~' : ''}${money(estTotal)}` : '—'}</span>
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-navy/60 p-3 text-xs leading-relaxed text-mist-dim">
              <Icon name="shield" size={14} className="mb-1 inline text-teal" /> A refundable {money(site.depositAmount)} deposit
              confirms your booking and applies to your treatment. RN administered · medical-director supervised.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Small presentational helpers
 * ------------------------------------------------------------------ */
function StepHead({ id, eyebrow, title, hint }: { id: string; eyebrow: string; title: string; hint: string }) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-3 font-display text-2xl text-cream md:text-3xl">{title}</h2>
      <p className="mt-1.5 text-sm text-mist">{hint}</p>
    </div>
  );
}

function Field({ label, error, htmlFor, children }: { label: string; error?: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label} {error && <span className="text-pink-bright">— {error}</span>}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return <p role="alert" className="mt-4 rounded-xl border border-pink/40 bg-pink/10 px-4 py-2.5 text-sm text-cream">{children}</p>;
}

function ReviewRow({ label, onEdit, children }: { label: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-navy/40 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-mist-dim">{label}</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">{children}</div>
      </div>
      <button type="button" onClick={onEdit} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-teal-bright hover:text-teal">
        <Icon name="edit" size={14} /> Edit
      </button>
    </div>
  );
}
