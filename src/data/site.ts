/**
 * Central business configuration.
 * Edit these values to update contact info, links, and copy across the site.
 */
export const site = {
  name: 'IV Salt Rejuvenation',
  shortName: 'IV Salt',
  tagline: 'Hydrate. Rejuvenate. Restore.',
  subTagline: 'Mobile IV Hydration & Wellness',
  motto: 'Your wellness. Our priority.',
  description:
    'Mobile IV hydration & wellness serving Port St. Lucie, Stuart & the Treasure Coast. Registered-nurse administered IV therapy delivered to your door. Book online in minutes.',
  url: 'https://ivsaltfl.com',

  // Contact
  email: 'ivsaltfl@gmail.com',
  phone: '772-222-7108',
  phoneHref: 'tel:+17722227108',
  smsHref: 'sms:+17722227108',

  // Social
  facebook: 'https://www.facebook.com/profile.php?id=61591585116803',

  // Service area
  serviceArea: 'Serving Martin County — Port St. Lucie, Stuart & the Treasure Coast',
  serviceAreaShort: 'Port St. Lucie, Stuart & the Treasure Coast',
  counties: ['Martin County', 'St. Lucie County'],

  // Booking / deposit
  depositAmount: 50,
  consentFormUrl: 'https://form.jotform.com/261876510047155',

  // Compliance copy shown across the site
  medicalDisclaimer:
    'All IV therapies are administered by a licensed Registered Nurse under the supervision of a medical director. Clients must complete a medical screening and consent form prior to treatment. IV therapy services are not intended to diagnose, treat, cure, or prevent any disease. Individual results may vary.',
  supervisedNote: 'Medical Director Supervised',
} as const;

export const businessHours = {
  // Displayed on the site + used for JSON-LD. Adjust to real hours.
  days: 'Monday – Sunday',
  hours: 'By appointment',
};
