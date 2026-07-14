/**
 * Homepage testimonials.
 *
 * These are real client reviews supplied by the business. Keep names as
 * first name + last initial (e.g., "Chris S.").
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
    name: 'Estela L.',
    rating: 5,
    quote:
      'I had an amazing experience with Sara at IV Salt Rejuvenation. From the moment she arrived, she was professional, knowledgeable, and made me feel completely comfortable. I was feeling run down and dehydrated, and within an hour I felt like a completely new person. The convenience of having this service come to my home is unmatched. Highly recommend!',
  },
  {
    name: 'Chris S.',
    rating: 5,
    quote:
      'Sara is incredible at what she does. You can tell she truly cares about her clients and takes the time to explain everything before starting. I booked an IV for energy and recovery, and the results were almost immediate. I felt refreshed, focused, and ready to take on the day. This is now part of my regular routine.',
  },
  {
    name: 'Wesley B.',
    rating: 5,
    quote:
      'IV Salt Rejuvenation exceeded all my expectations. Sara is not only professional but also extremely personable, which made the whole experience relaxing and enjoyable. The setup was clean, efficient, and seamless. I noticed a huge difference in my hydration and overall wellness afterward. I won’t go anywhere else!',
  },
  {
    name: 'Rich D.',
    rating: 5,
    quote:
      'I booked with Sara after a long week of travel and was dealing with fatigue and dehydration. She came right to my door, was punctual, and created such a calming environment. The IV therapy worked wonders — I felt rehydrated, energized, and clear-headed within hours. If you’re on the fence, just book it, you won’t regret it.',
  },
];
