/** Blog author profile (single author for now). */
export const author = {
  name: 'Sara A. Carroll, BSN, RN',
  role: 'Founder & Registered Nurse',
  image: '/assets/sara-ivsalt-bio.png',
  bio: 'Sara A. Carroll is a licensed Registered Nurse (BSN, RN) and the founder of IV Salt Rejuvenation. She brings safe, professional, concierge mobile IV therapy directly to clients across the Treasure Coast.',
};

/** Rough reading time from raw markdown (about 200 words per minute). */
export function readingTime(markdown: string): string {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
