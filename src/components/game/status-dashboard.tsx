
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PlayerState, LootItem, EquipmentSlot } from '@/lib/types';
import {
  StyleIcon,
  IronyIcon,
  AuthenticityIcon,
  VinylIcon,
  CoffeeIcon,
  ConjuringIcon,
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
import { Orb } from '@/components/ui/orb';
import { Progress } from '../ui/progress';
import TrailMap from './trail-map';
import { TRAIL_WAYPOINTS } from '@/lib/constants';
import { ThematicSeparator } from './thematic-separator';
import { InventorySheet } from './inventory-sheet';

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
        <div className="group space-y-1 font-body text-lg">
          <div className="flex items-center justify-between text-foreground/80">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </div>
            <span className="font-mono font-bold text-foreground">{value}</span>
          </div>
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
            <div className="flex items-center gap-3 bg-card p-2 rounded-sm group hover:bg-muted/40 transition-colors duration-300">
                <Icon className="h-8 w-8 text-foreground/70"/>
                <div className="text-left">
                    <div className="font-headline text-2xl text-foreground">{value}</div>
                    <div className="text-sm text-muted-foreground font-body -mt-1">{label}</div>
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
    onEquip: (item: LootItem) => void;
    onUnequip: (slot: EquipmentSlot) => void;
}


export default function StatusDashboard({ playerState, avatarImage, isImageLoading, onEquip, onUnequip }: StatusDashboardProps) {
  const { stats, resources, name, job, mood, progress, location, events } = playerState;

  const ironicStatus = getIronicHealthStatus(stats.health);


  return (
    <Card className="bg-card/90 backdrop-blur-sm">
      <CardHeader className="text-center items-center pb-4">
        <Avatar className="h-32 w-32 border-2 border-border/50 text-4xl font-headline rounded-full">
            {isImageLoading || !avatarImage ? (
                <div className="h-full w-full rounded-full bg-muted/50 flex flex-col items-center justify-center gap-2 text-foreground">
                    <ConjuringIcon className="h-10 w-10" />
                </div>
            ) : (
                <AvatarImage src={avatarImage} alt={name} className="rounded-full" data-ai-hint="avatar portrait" />
            )}
            <AvatarFallback className="rounded-full">{name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="space-y-1 pt-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <CardTitle className="font-headline text-4xl font-bold cursor-help">{name}</CardTitle>
                    </TooltipTrigger>
                    {mood && (
                        <TooltipContent>
                            <p className="max-w-xs">{mood}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
            <CardDescription className="font-body text-lg text-muted-foreground">{job}</CardDescription>
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant={ironicStatus.variant} className="cursor-help whitespace-nowrap">
                          {ironicStatus.text}
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Your overall vibe, based on your current health.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex justify-center gap-4 px-2">
            <Orb label="Health" value={stats.health} tooltip="Gotta eat to keep up the non-conformity. Don't starve." color="hsl(var(--destructive))"/>
            <Orb label="Vibes" value={stats.vibes} tooltip="Your creative and spiritual energy. Needed for... things." color="hsl(260, 80%, 70%)"/>
        </div>

        <div className="px-4 space-y-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger className="w-full">
                        <div className="flex items-center justify-between text-muted-foreground mb-1">
                            <label className="font-headline text-lg tracking-wider">Fixie Bike</label>
                            <span className="font-mono font-bold text-foreground">{resources.stamina}%</span>
                        </div>
                        <Progress value={resources.stamina} className="h-3" />
                    </TooltipTrigger>
                     <TooltipContent>
                        <p>Your fixed-gear's condition. A breakdown is social suicide.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        
        <ThematicSeparator />

        <div className="space-y-4 px-2">
            <StatItem icon={StyleIcon} label="Style" value={stats.style} tooltip="Your flair. Essential for navigating coffee shops."/>
            <StatItem icon={IronyIcon} label="Irony" value={stats.irony} tooltip="Your ability to appreciate things in a detached, humorous way."/>
            <StatItem icon={AuthenticityIcon} label="Authenticity" value={stats.authenticity} tooltip="How 'real' you are. A delicate balance."/>
        </div>
        
        <ThematicSeparator />

         <div className="grid grid-cols-2 gap-4 px-2">
            <ResourceItem icon={VinylIcon} label="Vinyls" value={resources.vinyls} tooltip="Rare records increase your standing." />
            <ResourceItem icon={CoffeeIcon} label="Coffee Beans" value={resources.coffee} tooltip="Fair-trade, single-origin coffee beans. The currency of the trail."/>
        </div>
        
        <ThematicSeparator />
        
        <div className="px-2">
            <InventorySheet 
                equipment={resources.equipment}
                inventory={resources.inventory}
                onEquip={onEquip}
                onUnequip={onUnequip}
            />
        </div>

        {resources.badges.length > 0 && (
          <div className="space-y-3 pt-2">
             <ThematicSeparator />
            <h3 className="text-sm font-headline uppercase text-muted-foreground tracking-widest pt-1 text-center">Badges of Dishonor</h3>
            <TooltipProvider>
              <div className="flex flex-wrap gap-2 justify-center">
                {resources.badges.map((badge, index) => (
                  <AlertDialog key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger>
                          <div className={cn(
                            "h-14 w-14 border-2 border-secondary/50 p-0.5 flex items-center justify-center bg-muted text-3xl transition-all duration-300 cursor-pointer overflow-hidden rounded-full hover:border-accent",
                            badge.isUber && 'uber-badge-animation'
                          )}>
                           {badge.image ? (
                                <Image src={badge.image} alt={badge.description} width={56} height={56} className="rounded-full" unoptimized data-ai-hint="badge icon" />
                            ) : (
                                <span className='mt-1'>{badge.emoji}</span>
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
                            "h-24 w-24 border-4 border-secondary/50 p-0.5 flex items-center justify-center bg-muted text-5xl transition-all duration-300 cursor-pointer overflow-hidden rounded-full",
                            badge.isUber && 'uber-badge-animation'
                          )}>
                           {badge.image ? (
                                <Image src={badge.image} alt={badge.description} width={96} height={96} className="rounded-full" unoptimized />
                            ) : (
                                <span className='mt-2'>{badge.emoji}</span>
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
        
        <ThematicSeparator />
        <div className="px-2">
            <TrailMap 
                progress={progress}
                waypoints={TRAIL_WAYPOINTS}
                currentLocation={location}
                events={events}
            />
        </div>
      </CardContent>
    </Card>
  );
}
