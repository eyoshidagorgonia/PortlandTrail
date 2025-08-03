import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

// Diablo-esque Icons

export const HungerIcon = (props: LucideProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.21.93 2.05 6.09a3 3 0 0 0 0 4.24l5.16 5.16a3 3 0 0 0 4.24 0l5.16-5.16a3 3 0 0 0 0-4.24L11.45.93a3 3 0 0 0-4.24 0Z"/>
    <path d="m20.71 16.04-5.16-5.16a3 3 0 0 0-4.24 0l-5.16 5.16a3 3 0 0 0 0 4.24l5.16 5.16a3 3 0 0 0 4.24 0l5.16-5.16a3 3 0 0 0 0-4.24Z"/>
  </svg>
);

export const StyleIcon = (props: LucideProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7l-4 1 2 5 2 1h10l2-1 2-5-4-1-2.5-3z"/>
    <path d="M12 13V7"/>
    <path d="M10 13v-2h4v2"/>
    <path d="M8 17h8v4H8z"/>
  </svg>
);

export const IronyIcon = (props: LucideProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.13 10.33c-.32.28-.53.71-.53 1.17s.21.89.53 1.17C10.45 12.95 11 13 12 13h2"/>
    <path d="M12 21c-4.24 0-4.63-5.8-4.63-5.8s.4-5.8 4.63-5.8c4.24 0 4.63 5.8 4.63 5.8S16.24 21 12 21Z"/>
    <path d="M12 9.4c-2.43 0-2.82-3.83-2.82-3.83S9.57 2 12 2c2.43 0 2.82 3.57 2.82 3.57S14.43 9.4 12 9.4Z"/>
  </svg>
);

export const AuthenticityIcon = (props: LucideProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 2-3 3 3 3 3-3-3-3Z"/>
    <path d="m8 2-3 3 3 3 3-3-3-3Z"/>
    <path d="m16 16-3 3 3 3 3-3-3-3Z"/>
    <path d="m8 16-3 3 3 3 3-3-3-3Z"/>
    <path d="M13 3h-2"/>
    <path d="M21 11v2"/>
    <path d="M13 21h-2"/>
    <path d="M3 11v2"/>
  </svg>
);

export const VinylIcon = (props: LucideProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10H12V2Z"/>
    <path d="M12 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"/>
  </svg>
);

export const CoffeeIcon = (props: LucideProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a2.83 2.83 0 0 0-2 5 2.83 2.83 0 0 0 2 5 2.83 2.83 0 0 0 2-5 2.83 2.83 0 0 0-2-5Z"/>
    <path d="M12 12v5a2.83 2.83 0 0 1-2-5 2.83 2.83 0 0 1-2-5 2.83 2.83 0 0 1 2-5"/>
    <path d="M12 12v5a2.83 2.83 0 0 0 2-5 2.83 2.83 0 0 0 2-5 2.83 2.83 0 0 0-2-5"/>
  </svg>
);

export const BikeIcon = (props: LucideProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>
    <path d="M18.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>
    <path d="M12 14a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
    <path d="m14.5 11.5-1.5-1.5"/>
    <path d="M8.33 11.17 6.4 9.24"/>
    <path d="M15.17 11.67l2.83-2.83"/>
  </svg>
);

// Actions
export const ForageIcon = (props: LucideProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 4 13V7a3 3 0 0 1 6 0v2"/>
    <path d="M14 10a3 3 0 0 0-6 0v2"/>
    <path d="M12 18a7 7 0 0 0 7-7V7a3 3 0 1 0-6 0"/>
  </svg>
);
export const TuneUpIcon = (props: LucideProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);
export const ThriftIcon = (props: LucideProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20"/>
    <path d="M17 3.34a10 10 0 1 1-10 0"/>
  </svg>
);
export const StreetPerformIcon = (props: LucideProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12c-1.657 0-3-2.686-3-6s1.343-6 3-6 3 2.686 3 6-1.343 6-3 6Z"/>
    <path d="M15 12c1.657 0 3-2.686 3-6s-1.343-6-3-6-3 2.686-3 6 1.343 6 3 6Z"/>
    <path d="M2 22s1-4 4-4 4 4 4 4-4 4-4 4-4-4-4-4Z"/>
    <path d="M14 22s1-4 4-4 4 4 4 4-4 4-4 4-4-4-4-4Z"/>
  </svg>
);


// Help Page Icons
export const GoalIcon = (props: LucideProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 16 4-4-4-4"/>
        <path d="M8 12h8"/>
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
    </svg>
);

export const VitalsIcon = (props: LucideProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21a9 9 0 0 0-9-9c0-4.97 4.03-9 9-9s9 4.03 9 9a9 9 0 0 0-9 9Z"/>
        <path d="M12 21a9 9 0 0 1-9-9c0-4.97 4.03-9 9-9s9 4.03 9 9a9 9 0 0 1-9 9Z"/>
        <path d="M12 3v18"/>
        <path d="M3 12h18"/>
    </svg>
);

export const SocialStatsIcon = (props: LucideProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
    </svg>
);

export const MapIcon = (props: LucideProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 14.5 18 22l-5-1-1-4-4 1-3-5 7-2 6 6-3 3Z"/>
        <path d="m9.6 12.6-6-2.4.9-5.7 5.7-.9 2.4 6Z"/>
    </svg>
);

export const CardsIcon = (props: LucideProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m20.61 10.16-5.74-.9-2.4-6-2.4 6-5.73.9 4.15 4.05-1 5.78 5.13-2.7 5.13 2.7-1-5.78 4.15-4.05Z"/>
        <path d="M12 2v20"/>
    </svg>
);

export const LeftArrowIcon = (props: LucideProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);
