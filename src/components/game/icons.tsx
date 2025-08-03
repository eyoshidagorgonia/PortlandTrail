import type { LucideProps } from 'lucide-react';

// Gritty, woodcut-style icons for Diablo II feel

export const HealthIcon = (props: LucideProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z" />
      <path d="M12 12l2.5-2.5M12 12l-2.5 2.5M12 12l2.5 2.5M12 12l-2.5-2.5" />
    </svg>
);

export const VibeIcon = (props: LucideProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10c0-2.2-.7-4.2-2-5.7" />
      <path d="M12 6V2" />
      <path d="M12 12l4 4m0-4l-4 4" />
    </svg>
);


export const HungerIcon = (props: LucideProps) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4L20 20M4 20L20 4"/>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" strokeDasharray="4 4"/>
  </svg>
);

export const StyleIcon = (props: LucideProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 5.5A.5.5 0 0 1 6 6v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V6a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V6a.5.5 0 0 1 .5-.5"/>
      <path d="M5 2h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
      <path d="M8 12h8"/>
      <path d="M8 16h8"/>
    </svg>
);

export const IronyIcon = (props: LucideProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10c0-2.2-.7-4.2-2-5.7"/>
      <path d="M12 6V2"/>
      <path d="M12 12l4 4m0-4l-4 4"/>
    </svg>
);

export const AuthenticityIcon = (props: LucideProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z" />
        <path d="M12 12l-2-2 4-4-4 4 2 2" />
        <path d="M10 12l-2 2" />
    </svg>
);

export const VinylIcon = (props: LucideProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a9 9 0 1 0 9 9" />
        <path d="M12 3A9 9 0 0 1 3 12" />
        <circle cx="12" cy="12" r="2"/>
        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
        <path d="M12 12L19 5"/>
    </svg>
);

export const CoffeeIcon = (props: LucideProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 14v4a2 2 0 0 0 2 2h.5a2.5 2.5 0 0 1 0-5H10z"/>
        <path d="M12 3l1 4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L7 3"/>
        <path d="M18 10h-5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2z"/>
    </svg>
);

export const BikeIcon = (props: LucideProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M15 6l-4 4-4-4" />
        <path d="M15 6v-.5a2.5 2.5 0 0 0-5 0V6" />
        <path d="M9 9L6 14" />
        <path d="M15 9l3 5" />
    </svg>
);

// Actions
export const ForageIcon = (props: LucideProps) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 10l-6 6"/>
    <path d="M10 4v16"/>
    <path d="M16 4.5c-2.5 0-5 2.5-5 5s2.5 5 5 5 5-2.5 5-5-2.5-5-5-5z"/>
    <path d="M19 12l2-2 2 2-2 2-2-2z"/>
  </svg>
);
export const TuneUpIcon = (props: LucideProps) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
export const ThriftIcon = (props: LucideProps) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8L10 19l-7-7 4-4"/>
    <path d="M18 11L7 22"/>
    <path d="M22 12l-6 6"/>
    <path d="M15 5l-4-4"/>
    <path d="M6 14l-4 4"/>
  </svg>
);
export const StreetPerformIcon = (props: LucideProps) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
);


// Help Page Icons
export const GoalIcon = (props: LucideProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
);

export const VitalsIcon = (props: LucideProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);

export const SocialStatsIcon = (props: LucideProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

export const MapIcon = (props: LucideProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
);

export const CardsIcon = (props: LucideProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
        <path d="M17.5 2a2.5 2.5 0 0 1 0 5M6.5 2a2.5 2.5 0 0 0 0 5"/>
    </svg>
);

export const LeftArrowIcon = (props: LucideProps) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

interface PennyFarthingIconProps extends LucideProps {
  isloading?: string;
}
export const PennyFarthingIcon = ({ isloading, ...props }: PennyFarthingIconProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9.5" cy="11.5" r="7.5" className={isloading === 'true' ? 'animate-spin-wheel' : ''} style={{ transformOrigin: '9.5px 11.5px' }}/>
      <circle cx="20" cy="17" r="2" className={isloading === 'true' ? 'animate-spin-wheel' : ''} style={{ transformOrigin: '20px 17px' }}/>
      <path d="M9.5 4V2.5" />
      <path d="M14 8.5 L18.5 16" />
      <path d="M9.5 19 L11.5 8.5 L7 8.5" />
      <path d="M7 8.5L2 8.5" />
    </svg>
);
