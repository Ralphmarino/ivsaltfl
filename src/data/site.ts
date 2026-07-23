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
  // Google Business Profile — opens the "leave a review" dialog.
  googleReview: 'https://g.page/r/CXOpH2aQaP6fEBM/review',

  // Announcement bar (top of every page)
  announcement: 'Now taking appointments',

  // Service area
  serviceArea: 'Serving Martin County — Port St. Lucie, Stuart & the Treasure Coast',
  serviceAreaShort: 'Port St. Lucie, Stuart & the Treasure Coast',
  counties: ['Martin County', 'St. Lucie County'],
  // No travel fee within these cities (per travel policy)
  noFeeCities: ['Port St. Lucie', 'Stuart', 'Palm City', 'Jensen Beach'],
  // We only serve Florida — used to block out-of-state booking requests
  serviceState: 'FL',

  // Booking / deposit
  depositAmount: 50,
  maxPartySize: 4,
  maxNadPerVisit: 2,
  consentFormUrl: 'https://form.jotform.com/261876510047155',

  // Availability — Monday–Friday only, 9 AM to 3 PM.
  bookingTimes: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'],
  bookingHoursLabel: 'Monday to Friday, 9 AM to 3 PM',
  // How many days ahead to offer in the date picker.
  bookingWindowDays: 45,
  // Days Sara is unavailable (holidays, time off). Format: 'YYYY-MM-DD'.
  // Add or remove dates here to block them from the booking calendar.
  blackoutDates: [
    // '2026-12-25', // example: Christmas
  ] as string[],

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
