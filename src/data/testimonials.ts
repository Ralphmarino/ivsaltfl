/**
 * Homepage testimonials.
 *
 * ⚠️ The `quote` values below are PLACEHOLDERS. Replace each with the client's
 * real words before publishing — do not present invented quotes as genuine
 * reviews. Keep names as first name + last initial (e.g., "Chris S.").
 */
export interface Testimonial {
  name: string;
  quote: string;
  /** Optional context shown under the name, e.g. a therapy or town. */
  detail?: string;
  rating?: number;
}

export const testimonials: Testimonial[] = [
  {
    name: 'Chris S.',
    rating: 5,
    quote: 'REPLACE THIS with Chris’s real testimonial.',
  },
  {
    name: 'Wesley B.',
    rating: 5,
    quote: 'REPLACE THIS with Wesley’s real testimonial.',
  },
  {
    name: 'Estela L.',
    rating: 5,
    quote: 'REPLACE THIS with Estela’s real testimonial.',
  },
  {
    name: 'Rich D.',
    rating: 5,
    quote: 'REPLACE THIS with Rich’s real testimonial.',
  },
];
