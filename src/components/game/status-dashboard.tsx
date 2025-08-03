'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PlayerState } from '@/lib/types';
import {
  HungerIcon,
  StyleIcon,
  IronyIcon,
  AuthenticityIcon,
  VinylIcon,
  CoffeeIcon,
  BikeIcon,
} from './icons';
import type { LucideProps } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getIronicHealthStatus } from '@/lib/constants';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Skeleton } from '../ui/skeleton';

interface StatItemProps {
  icon: React.ElementType<LucideProps>;
  label: string;
  value: number;
  tooltip: string;
}

const StatItem = ({ icon: Icon, label, value, tooltip }: StatItemProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className="w-full text-left">
        <div className="group space-y-1 font-body">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-foreground/70" />
              <span>{label}</span>
            </div>
            <span className="font-mono text-foreground">{value}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const VitalItem = ({ icon: Icon, label, value, maxValue = 100, tooltip }: StatItemProps & { maxValue?: number }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="w-full text-left">
          <div className="grid gap-2">
            <div className="flex items-center justify-between font-body text-sm text-muted-foreground">
                 <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                 </div>
                <span className="font-mono text-foreground">{value}%</span>
            </div>
            <Progress value={value} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );


interface ResourceItemProps {
  icon: React.ElementType<LucideProps>;
  label: string;
  value: number;
  tooltip: string;
}

const ResourceItem = ({ icon: Icon, label, value, tooltip }: ResourceItemProps) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="w-full text-left">
            <div className="flex items-center gap-3 bg-muted/40 p-2 rounded-md group hover:bg-muted transition-colors duration-300">
                <Icon className="h-7 w-7 text-foreground/70"/>
                <div className="text-left">
                    <div className="font-headline text-lg text-foreground">{value}</div>
                    <div className="text-xs text-muted-foreground font-body">{label}</div>
                </div>
            </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

interface StatusDashboardProps {
    playerState: PlayerState;
    avatarImage: string | null;
    isImageLoading: boolean;
}

export default function StatusDashboard({ playerState, avatarImage, isImageLoading }: StatusDashboardProps) {
  const { stats, resources, name, job, bio } = playerState;

  const normalizedHealth =
    ((stats.hunger / 100) +
      (resources.bikeHealth / 100) +
      (stats.style / 200) +
      (stats.irony / 200) +
      (stats.authenticity / 200)) /
    5 * 100;

  const ironicStatus = getIronicHealthStatus(normalizedHealth);


  return (
    <Card>
      <CardHeader className="text-center items-center">
        <Avatar className="h-24 w-24 border-2 border-secondary">
            {isImageLoading || !avatarImage ? (
                <Skeleton className="h-full w-full rounded-full" />
            ) : (
                <AvatarImage src={avatarImage} alt={name} data-ai-hint="avatar portrait" />
            )}
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="space-y-1 pt-2">
            <CardTitle className="font-headline text-3xl">{name}</CardTitle>
            <CardDescription className="font-body text-base text-muted-foreground">{job}</CardDescription>
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant={ironicStatus.variant} className="cursor-help whitespace-nowrap">{ironicStatus.text}</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Your overall vibe, based on an average of your vitals and social stats.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        {bio && (
            <CardDescription className="pt-3 text-sm italic font-body text-foreground/80 border-t border-border/50 mt-4 text-center">
                {bio}
            </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-4">
            <h3 className="text-sm font-headline uppercase text-muted-foreground tracking-widest">Vitals</h3>
             <VitalItem icon={HungerIcon} label="Hunger" value={stats.hunger} tooltip="Gotta eat to keep up the non-conformity. Don't starve."/>
            <VitalItem icon={BikeIcon} label="Bike Health" value={resources.bikeHealth} tooltip="Your fixed-gear's condition. A breakdown is social suicide."/>
        </div>

        <div className="space-y-4">
            <h3 className="text-sm font-headline uppercase text-muted-foreground tracking-widest">Social Stats</h3>
            <StatItem icon={StyleIcon} label="Style" value={stats.style} tooltip="Your flair. Essential for navigating coffee shops."/>
            <StatItem icon={IronyIcon} label="Irony" value={stats.irony} tooltip="Your ability to appreciate things in a detached, humorous way."/>
            <StatItem icon={AuthenticityIcon} label="Authenticity" value={stats.authenticity} tooltip="How 'real' you are. A delicate balance."/>
        </div>
         <div className="space-y-4">
            <h3 className="text-sm font-headline uppercase text-muted-foreground tracking-widest">Inventory</h3>
            <div className="grid grid-cols-2 gap-4">
                <ResourceItem icon={VinylIcon} label="Vinyls" value={resources.vinyls} tooltip="Rare records increase your standing." />
                <ResourceItem icon={CoffeeIcon} label="Coffee Beans" value={resources.coffee} tooltip="Fair-trade, single-origin coffee beans. The currency of the trail."/>
            </div>
        </div>
        {resources.badges.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-headline uppercase text-muted-foreground tracking-widest">Badges</h3>
            <TooltipProvider>
              <div className="flex flex-wrap gap-2">
                {resources.badges.map((badge, index) => (
                  <AlertDialog key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger>
                          <div className={cn(
                            "h-12 w-12 rounded-lg border-2 border-secondary/50 p-0.5 flex items-center justify-center bg-muted text-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:border-accent",
                            badge.isUber && 'uber-badge-animation'
                          )}>
                           {badge.image ? (
                                <Image src={badge.image} alt={badge.description} width={48} height={48} className="rounded-md" unoptimized data-ai-hint="badge icon" />
                            ) : (
                                badge.emoji
                            )}
                          </div>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{badge.description}</p>
                      </TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                      <AlertDialogHeader className='items-center'>
                         <div className={cn(
                            "h-24 w-24 rounded-lg border-4 border-secondary/50 p-0.5 flex items-center justify-center bg-muted text-5xl transition-all duration-300 cursor-pointer overflow-hidden",
                            badge.isUber && 'uber-badge-animation'
                          )}>
                           {badge.image ? (
                                <Image src={badge.image} alt={badge.description} width={96} height={96} className="rounded-md" unoptimized />
                            ) : (
                                badge.emoji
                            )}
                          </div>
                        <AlertDialogTitle className="font-headline text-2xl pt-4">
                           Badge Earned: {badge.description}
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction>Nice</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ))}
              </div>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
