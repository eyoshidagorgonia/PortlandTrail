
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PlayerState, LootItem, EquipmentSlot, PlayerAction } from '@/lib/types';
import {
  StyleIcon,
  IronyIcon,
  AuthenticityIcon,
  VinylIcon,
  CoffeeIcon,
  ConjuringIcon,
  ForageIcon,
  TuneUpIcon,
  ThriftIcon,
  StreetPerformIcon,
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
import { Orb } from '@/components/ui/orb';
import { Progress } from '../ui/progress';
import TrailMap from './trail-map';
import { ThematicSeparator } from './thematic-separator';
import EquipmentDisplay from './equipment-display';
import InventoryGrid from './inventory-grid';
import { Button } from '../ui/button';

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

const actions: PlayerAction[] = [
  {
    text: 'Forage for Food',
    description: 'Scour for "wild" edibles. Risking it all for a handful of berries another creature probably spit out. [+10 Health, -2 Style, -1 Progress]',
    icon: ForageIcon,
    consequences: { health: 10, style: -2, irony: 0, authenticity: 0, vibes: 0, coffee: 0, vinyls: 0, progress: -1, stamina: 0 },
  },
  {
    text: 'Tune-up Fixie',
    description: 'Perform "maintenance" on your single-gear bicycle with a wrench you bought at a flea market. It probably does something. [-5 Coffee, +15 Stamina, -1 Progress]',
    icon: TuneUpIcon,
    consequences: { health: 0, style: 0, irony: 0, authenticity: 0, vibes: 0, coffee: -5, vinyls: 0, progress: -1, stamina: 15 },
  },
  {
    text: 'Go Thrifting',
    description: 'Acquire pre-loved artifacts from a dusty emporium. The more obscure the stain, the higher the style. [-5 Coffee, +10 Style, -5 Authenticity, -1 Progress]',
    icon: ThriftIcon,
    consequences: { health: 0, style: 10, irony: 0, authenticity: -5, vibes: 0, coffee: -5, vinyls: 0, progress: -1, stamina: 0 },
  },
  {
    text: 'Street Perform',
    description: 'Share your "art" with unwilling strangers. Their confused glances are a currency of their own. [+10 Coffee, +5 Irony, -5 Authenticity, -1 Progress]',
    icon: StreetPerformIcon,
    consequences: { health: 0, style: 0, irony: 5, authenticity: -5, vibes: 0, coffee: 10, vinyls: 0, progress: -1, stamina: 0 },
  },
];

interface StatusDashboardProps {
    playerState: PlayerState;
    avatarImage: string | null;
    onEquip: (item: LootItem) => void;
    onUnequip: (slot: EquipmentSlot) => void;
    onAction: (action: PlayerAction) => void;
    isLoading: boolean;
}


export default function StatusDashboard({ playerState, avatarImage, onEquip, onUnequip, onAction, isLoading }: StatusDashboardProps) {
  const { stats, resources, name, job, mood, progress, location, events, trail } = playerState;

  const ironicStatus = getIronicHealthStatus(stats.health);


  return (
    <Card className="bg-card/90 backdrop-blur-sm">
      <CardHeader className="text-center items-center pb-4">
        <Avatar className="h-32 w-32 border-2 border-border/50 text-4xl font-headline rounded-full">
            {!avatarImage ? (
                <div className="h-full w-full rounded-full bg-muted/50 flex flex-col items-center justify-center gap-2 text-foreground animate-pulse-text">
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
                        <p>A poetic summary of your current state of being.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex justify-center gap-4 px-2">
            <Orb label="Health" value={stats.health} tooltip="Your mortal coil's current status. Don't let it unravel." color="hsl(var(--destructive))"/>
            <Orb label="Vibes" value={stats.vibes} tooltip="Your creative essence. Required for most forms of self-expression." color="hsl(260, 80%, 70%)"/>
        </div>

        <div className="px-4 space-y-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger className="w-full">
                        <div className="flex items-center justify-between text-muted-foreground mb-1">
                            <label className="font-headline text-lg tracking-wider">FIXIE STAMINA</label>
                            <span className="font-mono font-bold text-foreground">{resources.stamina}%</span>
                        </div>
                        <Progress value={resources.stamina} className="h-3" />
                    </TooltipTrigger>
                     <TooltipContent>
                        <p>Your fixed-gear's integrity. A breakdown would be, like, super inconvenient.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        
        <ThematicSeparator />

        <div className="space-y-4 px-2">
            <StatItem icon={StyleIcon} label="Style" value={stats.style} tooltip="Your aesthetic currency. Looking this effortless takes effort."/>
            <StatItem icon={IronyIcon} label="Irony" value={stats.irony} tooltip="Your defense against the sincere. Use it wisely, or whatever."/>
            <StatItem icon={AuthenticityIcon} label="Authenticity" value={stats.authenticity} tooltip="How 'real' you are. A concept you find both fascinating and deeply suspect."/>
        </div>
        
        <ThematicSeparator />

         <div className="grid grid-cols-2 gap-4 px-2">
            <ResourceItem icon={VinylIcon} label="Vinyls" value={resources.vinyls} tooltip="A curated collection of vinyl. You haven't listened to them." />
            <ResourceItem icon={CoffeeIcon} label="Coffee Beans" value={resources.coffee} tooltip="Single-origin, fair-trade, artisanal currency. The lifeblood of the trail."/>
        </div>
        
        <ThematicSeparator />

        <div className="px-2 space-y-4">
            <div>
              <h3 className="text-sm font-headline uppercase text-muted-foreground tracking-widest text-center mb-2">Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <TooltipProvider>
                  {actions.map((action) => (
                    <Tooltip key={action.text}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          className="flex flex-col h-auto p-3 text-center gap-2"
                          onClick={() => onAction(action)}
                          disabled={isLoading}
                        >
                          <action.icon className="h-8 w-8" />
                          <span className="text-sm leading-tight font-body">{action.text}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{action.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
            
            <ThematicSeparator />

            <EquipmentDisplay equipment={resources.equipment} onUnequip={onUnequip} />
            <InventoryGrid inventory={resources.inventory} onEquip={onEquip} />
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
                           Badge of Dishonor Earned
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction>Acknowledged</AlertDialogAction>
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
                waypoints={trail}
                currentLocation={location}
                events={events}
            />
        </div>
      </CardContent>
    </Card>
  );
}
