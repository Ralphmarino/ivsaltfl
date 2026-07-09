/** Minimal inline icon set for the React booking island. */
import type { JSX } from 'react';

const paths: Record<string, JSX.Element> = {
  drop: <><path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3Z" /><path d="M9 14a3 3 0 0 0 3 3" /></>,
  palm: <><path d="M12 22c0-5 0-9 0-11" /><path d="M12 11c-2-3-6-3-8-1 3-1 5 0 8 1Z" /><path d="M12 11c2-3 6-3 8-1-3-1-5 0-8 1Z" /><path d="M12 11c0-3-2-6-5-6 2 2 3 4 5 6Z" /><path d="M12 11c0-3 2-6 5-6-2 2-3 4-5 6Z" /><path d="M8 22h8" /></>,
  shield: <><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
  sparkle: <><path d="M12 3c.7 4 2 5.3 6 6-4 .7-5.3 2-6 6-.7-4-2-5.3-6-6 4-.7 5.3-2 6-6Z" /><path d="M19 14c.3 1.7.8 2.2 2.5 2.5-1.7.3-2.2.8-2.5 2.5-.3-1.7-.8-2.2-2.5-2.5 1.7-.3 2.2-.8 2.5-2.5Z" /></>,
  runner: <><circle cx="14" cy="5" r="1.6" /><path d="M6 20l3-4 3 1 1-4-3-1-2 2" /><path d="m13 9 3 2 3-1" /><path d="m12 12 2 4 4 1" /></>,
  cell: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3" /><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" /></>,
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  syringe: <><path d="m18 2 4 4M17 3l4 4M18.5 7.5 7 19l-4 1 1-4L15.5 4.5" /><path d="m9 11 4 4M12 8l4 4" /></>,
  heart: <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z" />,
  molecule: <><circle cx="6" cy="7" r="2" /><circle cx="18" cy="7" r="2" /><circle cx="12" cy="17" r="2" /><path d="M7.6 8.6 10.6 15M16.4 8.6 13.4 15M8 7h8" /></>,
  check: <path d="m5 12 5 5L20 6" />,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  'arrow-left': <path d="M19 12H5M11 6l-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></>,
  'map-pin': <><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
  phone: <path d="M4 5c0 9 6 15 15 15l1.5-3.5-4-1.5-1.5 2c-2-1-4-3-5-5l2-1.5-1.5-4L5 4C4.5 4 4 4.5 4 5Z" />,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /></>,
  edit: <><path d="M4 20h4L18 10l-4-4L4 16v4Z" /><path d="M13 7l4 4" /></>,
};

export function Icon({ name, size = 22, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {paths[name] ?? null}
    </svg>
  );
}

export function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`animate-spin ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
