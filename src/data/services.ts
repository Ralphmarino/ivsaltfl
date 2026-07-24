/**
 * IV therapy menu + add-ons.
 * `id` values are stable keys used by the booking wizard and backend — do not
 * change them once bookings exist. Prices are in whole US dollars.
 */

export type IconName =
  | 'drop'
  | 'palm'
  | 'shield'
  | 'sparkle'
  | 'runner'
  | 'cell'
  | 'bolt'
  | 'syringe'
  | 'heart'
  | 'molecule';

export interface Service {
  id: string;
  name: string;
  /** optional clarifier under the name, e.g. "Myers Cocktail" */
  subtitle?: string;
  price: number;
  /** true when price is a "starting at" figure */
  priceFrom?: boolean;
  duration: string;
  description: string;
  icon: IconName;
  /** optional custom SVG icon in /public/assets; falls back to `icon` if missing */
  iconSrc?: string;
  /** signature / most-popular flag for a highlight badge */
  featured?: boolean;
  /** what's in the drip — shown in a collapsible menu dropdown */
  ingredients?: string[];
  /** dose options (NAD+), shown in a collapsible dropdown instead of ingredients */
  doses?: string[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: IconName;
  /** optional sub-choices, e.g. Glutathione / Vitamin C / Zinc */
  options?: string[];
}

export const services: Service[] = [
  {
    id: 'hydration-haven',
    name: 'Hydration Haven',
    price: 200,
    duration: '90 min',
    icon: 'drop',
    iconSrc: '/assets/icon-hydration.svg',
    description:
      'Replenish and revive with a classic electrolyte hydration infusion for ultimate freshness and energy.',
    ingredients: ['Preserved Ascorbic Acid (Vitamin C)', 'Vita Complex', 'Mineral Complex'],
  },
  {
    id: 'salt-sand-infusion',
    name: 'Salt & Sand Infusion',
    subtitle: 'Our Myers Cocktail',
    price: 220,
    duration: '90 min',
    icon: 'palm',
    iconSrc: '/assets/icon-salt-sand.svg',
    featured: true,
    description:
      'Our signature rejuvenation blend to refresh, energize, and boost overall wellness.',
    ingredients: [
      'Vita Complex',
      'Preserved Ascorbic Acid (Vitamin C)',
      'Magnesium',
      'Hydroxocobalamin (Vitamin B12)',
      'Calcium Chloride',
      'Anti-nausea support (Ondansetron, as indicated)',
    ],
  },
  {
    id: 'immunity-wave',
    name: 'Immunity Wave',
    price: 230,
    duration: '90 min',
    icon: 'shield',
    iconSrc: '/assets/icon-immunity.svg',
    description:
      'Strengthen your immune system and shield against illness with a potent immunity infusion.',
    ingredients: ['Preserved Ascorbic Acid (Vitamin C)', 'Glutathione', 'Zinc'],
  },
  {
    id: 'beauty-elixir',
    name: 'Beauty Elixir',
    price: 260,
    duration: '90 min',
    icon: 'sparkle',
    iconSrc: '/assets/icon-beauty-elixir.svg',
    description:
      'Enhance your natural beauty with a radiant blend of vitamins for glowing skin, hair, and nails.',
    ingredients: ['Preserved Ascorbic Acid (Vitamin C)', 'Biotin', 'Vita Complex', 'Glutathione'],
  },
  {
    id: 'recovery-therapy',
    name: 'Recovery Therapy',
    price: 240,
    duration: '90 min',
    icon: 'runner',
    iconSrc: '/assets/icon-recovery.svg',
    description:
      'Reduce inflammation, ease muscle soreness & speed up recovery with targeted hydration & nutrients.',
    ingredients: ['Preserved Ascorbic Acid (Vitamin C)', 'Vita Complex (B-Complex)', 'Amino Blend', 'Mineral Blend'],
  },
  {
    id: 'nad-therapy',
    name: 'NAD+ Therapy',
    price: 300,
    priceFrom: true,
    duration: '2-4 hours',
    icon: 'cell',
    iconSrc: '/assets/icon-nad.svg',
    description:
      'Support cellular health, energy production & healthy aging at the cellular level.',
    doses: ['250 mg', '500 mg', '750 mg', '1000 mg'],
  },
];

export const addOns: AddOn[] = [
  {
    id: 'b12',
    name: 'B-12 Injection',
    price: 40,
    icon: 'heart',
    description: 'Supports energy production & metabolism.',
  },
  {
    id: 'zofran',
    name: 'Zofran',
    price: 40,
    icon: 'shield',
    description: 'Anti-nausea support.',
  },
  {
    id: 'toradol',
    name: 'Toradol',
    price: 40,
    icon: 'bolt',
    description: 'Pain & inflammation relief.',
  },
  {
    id: 'weight-loss-shot',
    name: 'Weight Loss Support Shot',
    price: 50,
    icon: 'syringe',
    description: 'Supports metabolism & weight loss goals.',
  },
  {
    id: 'nad-shot',
    name: 'NAD+ Shot',
    price: 75,
    icon: 'cell',
    description: 'Supports cellular energy & healthy aging.',
  },
  {
    id: 'extra-boost',
    name: 'Extra Boost',
    price: 60,
    icon: 'molecule',
    description: 'Add an extra boost of Glutathione, Vitamin C, or Zinc.',
    options: ['Glutathione', 'Vitamin C', 'Zinc'],
  },
];

export const whyIvTherapy = [
  {
    icon: 'drop' as IconName,
    title: '100% Direct Absorption',
    text: 'Nutrients go straight into your bloodstream — no digestive loss.',
  },
  {
    icon: 'bolt' as IconName,
    title: 'Fast Results',
    text: 'Feel replenished quickly with rapid, efficient delivery.',
  },
  {
    icon: 'shield' as IconName,
    title: 'Supports Immunity',
    text: 'Targeted vitamins and antioxidants help fortify your defenses.',
  },
  {
    icon: 'heart' as IconName,
    title: 'Improves Well-Being',
    text: 'Rehydrate, recharge, and feel like your best self.',
  },
];

export const promises = [
  { title: 'We Come To You', text: 'In-home, in-office, or wherever you feel most comfortable.', icon: 'heart' as IconName },
  { title: 'Convenient & Comfortable', text: 'Relax while a licensed RN takes care of everything.', icon: 'drop' as IconName },
  { title: 'Professional & Caring', text: 'Registered-nurse administered, medical-director supervised.', icon: 'shield' as IconName },
];

/** Helpers used by the booking wizard + backend. */
export const serviceById = (id: string) => services.find((s) => s.id === id);
export const addOnById = (id: string) => addOns.find((a) => a.id === id);
