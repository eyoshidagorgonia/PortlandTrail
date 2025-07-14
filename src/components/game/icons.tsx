import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconClass = 'inline-block h-5 w-5 text-secondary-foreground/80 group-hover:text-accent-foreground';

// Custom SVG Icons

export const HungerIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    className={cn(iconClass, props.className)}
  >
    <path d="M16 2v10a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V2" />
    <path d="M10 2v10" />
    <path d="M16 12H8" />
  </svg>
);

export const StyleIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    className={cn(iconClass, props.className)}
  >
    <path d="M4 4l1.2 1.2M20 4l-1.2 1.2" />
    <path d="M12 20a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4Z" />
    <path d="M12 4v16" />
    <path d="M12 4c-2 0-4 2-4 4s2 4 4 4 4-2 4-4-2-4-4-4Z" />
  </svg>
);

export const IronyIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    className={cn(iconClass, props.className)}
  >
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2.018-2-2" />
    <path d="M14 21c3 0 7-1 7-8V5c0-1.25-.75-2.018-2-2" />
  </svg>
);

export const AuthenticityIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    className={cn(iconClass, props.className)}
  >
    <path d="m12 1.62-7.51 3.22a2 2 0 0 0-1.15 1.81v6.11a2 2 0 0 0 0 .42l1.32 4.1a2 2 0 0 0 1.93 1.41H17.4a2 2 0 0 0 1.93-1.41l1.32-4.1a2 2 0 0 0 0-.42V6.65a2 2 0 0 0-1.15-1.81L12 1.62Z" />
    <path d="m10 10 2 2 4-4" />
  </svg>
);

export const VinylIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    className={cn(iconClass, props.className)}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const CoffeeIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    className={cn(iconClass, props.className)}
  >
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <path d="M6 2v2" />
    <path d="M10 2v2" />
    <path d="M14 2v2" />
  </svg>
);

export const BikeIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    className={cn(iconClass, props.className)}
  >
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    <path d="M15 17.5h-5.5" />
    <path d="M15 17.5-3.5 4" />
    <path d="m13.5 4 5 4" />
    <path d="m8 14 3-3" />
  </svg>
);

// Icons for Help Page & Actions

export const GoalIcon = (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn(props.className)}
    >
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
        <path d="M12 7h.01" />
        <path d="M12 11v4" />
    </svg>
);

export const VitalsIcon = (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn(props.className)}
    >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
);

export const SocialStatsIcon = (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn(props.className)}
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

export const MapIcon = (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn(props.className)}
    >
        <path d="m21.28 4.72-8.29 8.29-2.2-2.2a1 1 0 0 0-1.42 0L3.72 16.45" />
        <path d="m16 2-4 4" />
        <path d="M17 21v-4" />
        <path d="M12 21v-4" />
        <path d="M7 21v-4" />
        <path d="M22 8v4" />
        <path d="M22 17v4" />
        <path d="M17 8v4" />
    </svg>
);

export const CardsIcon = (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn(props.className)}
    >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 15h6" />
        <path d="M9 12h6" />
    </svg>
);


export const WrenchIcon = (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn(props.className)}
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
);

export const ShoppingBagIcon = (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn(props.className)}
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);

export const GuitarIcon = (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn(props.className)}
    >
      <path d="M8.34 4.34 4 8.69l-1.69-1.69a2.82 2.82 0 0 1 0-4L4 1.31l1.69 1.69a2.82 2.82 0 0 1 2.65 1.34Z" />
      <path d="m14 18-5-5" />
      <path d="m14 10 3.5-3.5" />
      <path d="m20 16-5-5" />
      <path d="m18 8-4-4" />
      <path d="M21.31 21.31 12 12" />
      <path d="M9.13 14.36 4.32 19.18" />
      <path d="M4.32 4.32 9.14 9.13" />
    </svg>
);

export const LeftArrowIcon = (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn(props.className)}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
);