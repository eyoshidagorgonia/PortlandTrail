'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlayerAction } from '@/lib/types';
import { ForageIcon, TuneUpIcon, ThriftIcon, StreetPerformIcon } from './icons';

interface ActionsCardProps {
  onAction: (action: PlayerAction) => void;
  isLoading: boolean;
}

const actions: PlayerAction[] = [
  {
    text: 'Forage for Food',
    description: 'Scour for snacks. [+10 Hunger, -2 Style, -1 Progress]',
    icon: ForageIcon,
    consequences: { hunger: 10, style: -2, irony: 0, authenticity: 0, coffee: 0, vinyls: 0, progress: -1, bikeHealth: 0 },
  },
  {
    text: 'Tune-up Bike',
    description: 'Maintain your fixie. [-5 Coffee, +15 Bike Health, -1 Progress]',
    icon: TuneUpIcon,
    consequences: { hunger: 0, style: 0, irony: 0, authenticity: 0, coffee: -5, vinyls: 0, progress: -1, bikeHealth: 15 },
  },
  {
    text: 'Go Thrifting',
    description: 'Hunt for vintage threads. [-5 Coffee, +10 Style, -5 Authenticity, -1 Progress]',
    icon: ThriftIcon,
    consequences: { hunger: 0, style: 10, irony: 0, authenticity: -5, coffee: -5, vinyls: 0, progress: -1, bikeHealth: 0 },
  },
  {
    text: 'Street Perform',
    description: 'Share your "art". [+10 Coffee, +5 Irony, -5 Authenticity, -1 Progress]',
    icon: StreetPerformIcon,
    consequences: { hunger: 0, style: 0, irony: 5, authenticity: -5, coffee: 10, vinyls: 0, progress: -1, bikeHealth: 0 },
  },
];


export default function ActionsCard({ onAction, isLoading }: ActionsCardProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline text-3xl font-bold tracking-wider text-center">Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
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
      </CardContent>
    </Card>
  );
}

    