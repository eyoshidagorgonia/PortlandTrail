import type { LucideProps } from 'lucide-react';
import { Utensils, Shirt, Quote, BadgeCheck, DiscAlbum, Coffee, Bike } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconClass = 'inline-block h-5 w-5 text-secondary-foreground/80 group-hover:text-accent-foreground';

export const HungerIcon = (props: LucideProps) => (
  <Utensils {...props} className={cn(iconClass, props.className)} />
);
export const StyleIcon = (props: LucideProps) => (
  <Shirt {...props} className={cn(iconClass, props.className)} />
);
export const IronyIcon = (props: LucideProps) => (
  <Quote {...props} className={cn(iconClass, props.className)} />
);
export const AuthenticityIcon = (props: LucideProps) => (
  <BadgeCheck {...props} className={cn(iconClass, props.className)} />
);
export const VinylIcon = (props: LucideProps) => (
  <DiscAlbum {...props} className={cn(iconClass, props.className)} />
);
export const CoffeeIcon = (props: LucideProps) => (
  <Coffee {...props} className={cn(iconClass, props.className)} />
);
export const BikeIcon = (props: LucideProps) => (
  <Bike {...props} className={cn(iconClass, props.className)} />
);
