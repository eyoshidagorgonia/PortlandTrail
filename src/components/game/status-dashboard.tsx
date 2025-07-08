'use client';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

interface StatItemProps {
  icon: React.ElementType<LucideProps>;
  label: string;
  value: number;
  maxValue?: number;
  tooltip: string;
}

const StatItem = ({ icon: Icon, label, value, maxValue = 100, tooltip }: StatItemProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className="w-full text-left">
        <div className="group space-y-1">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-foreground/70" />
              <span>{label}</span>
            </div>
            <span className="font-mono text-foreground">{value}{maxValue !== 100 ? '' : '%'}</span>
          </div>
          <Progress value={value} max={maxValue} className="h-2" />
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
            <div className="flex items-center gap-3 bg-muted/40 p-2 rounded-md group">
                <Icon className="h-6 w-6 text-foreground/70"/>
                <div>
                    <div className="font-mono text-lg text-foreground">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                </div>
            </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

export default function StatusDashboard({ playerState }: { playerState: PlayerState }) {
  const { stats, resources, name, job, avatar } = playerState;

  return (
    <Card className="shadow-lg border">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/50">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name?.charAt(0) || 'H'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-2xl">{name}</CardTitle>
            <CardDescription>{job}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Vitals</h3>
            <StatItem icon={HungerIcon} label="Hunger" value={stats.hunger} tooltip="Gotta eat to keep up the non-conformity. Don't starve." />
            <StatItem icon={BikeIcon} label="Bike Health" value={resources.bikeHealth} tooltip="Your fixed-gear's condition. A breakdown is social suicide."/>
        </div>
        <div className="space-y-4 mb-6">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Social Stats</h3>
            <StatItem icon={StyleIcon} label="Style" value={stats.style} tooltip="Your flair. Essential for navigating coffee shops." maxValue={200}/>
            <StatItem icon={IronyIcon} label="Irony" value={stats.irony} tooltip="Your ability to appreciate things in a detached, humorous way." maxValue={200}/>
            <StatItem icon={AuthenticityIcon} label="Authenticity" value={stats.authenticity} tooltip="How 'real' you are. A delicate balance." maxValue={200}/>
        </div>
         <div className="space-y-4 mb-6">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Inventory</h3>
            <div className="grid grid-cols-2 gap-4">
                <ResourceItem icon={VinylIcon} label="Vinyls" value={resources.vinyls} tooltip="Rare records increase your standing." />
                <ResourceItem icon={CoffeeIcon} label="Coffee Beans" value={resources.coffee} tooltip="Fair-trade, single-origin coffee beans. The currency of the trail."/>
            </div>
        </div>
        {resources.badges.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Badges</h3>
            <TooltipProvider>
              <div className="flex flex-wrap gap-2">
                {resources.badges.map((badge, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger>
                       <div className="h-12 w-12 rounded-full border-2 border-secondary/50 p-0.5 overflow-hidden bg-muted">
                        <Image
                            src={badge.imageDataUri}
                            alt={badge.description}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                        />
                       </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{badge.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
