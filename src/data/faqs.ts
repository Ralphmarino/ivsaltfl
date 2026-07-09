/** Homepage FAQ content. Also emitted as FAQPage JSON-LD for SEO. */
export interface FAQ {
  q: string;
  a: string;
}

export const homeFaqs: FAQ[] = [
  {
    q: 'What areas do you serve?',
    a: 'We are a mobile service on the Treasure Coast. There is no travel fee within Port St. Lucie, Stuart, Palm City, and Jensen Beach. Extended areas in Martin County and St. Lucie County may include a small travel fee, disclosed before your appointment is confirmed.',
  },
  {
    q: 'How does booking work?',
    a: 'Choose your IV therapy, add any boosts, pick a preferred time, and share where we should come. We follow up to confirm. Your appointment is reserved once you complete a quick medical consent form and place a refundable $50 deposit, which is applied to your treatment.',
  },
  {
    q: 'Who administers the IV?',
    a: 'Every IV is administered by a licensed Registered Nurse under the supervision of a medical director. You are in professional, caring hands from start to finish.',
  },
  {
    q: 'How long does a session take?',
    a: 'Most infusions take about 45 to 60 minutes. NAD+ therapy takes longer, up to about 4 hours, because it is infused slowly for comfort.',
  },
  {
    q: 'Can you come to my home, office, or hotel?',
    a: 'Yes. We bring everything needed for a safe, relaxing session wherever you are most comfortable, whether that is your home, office, or hotel.',
  },
  {
    q: 'Can I book for more than one person?',
    a: 'Absolutely. We can treat up to 4 people during a single visit (up to 2 NAD+ infusions at a time). Each guest completes their own consent form and places their own $50 deposit. You can note the number of guests during booking.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'Appointments canceled with at least 24 hours notice can be rescheduled without penalty. Cancellations with less than 24 hours notice, same-day cancellations, and no-shows may incur a fee. See our Cancellation Policy for full details.',
  },
  {
    q: 'Is IV therapy safe?',
    a: 'IV therapy is generally well tolerated when administered by a licensed professional. You will complete a medical screening and consent form first so we can make sure it is appropriate for you. IV therapy is not intended to diagnose, treat, cure, or prevent any disease.',
  },
];
