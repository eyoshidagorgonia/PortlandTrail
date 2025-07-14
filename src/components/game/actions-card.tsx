
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlayerAction } from '@/lib/types';
import { Utensils, Wrench, ShoppingBag, Guitar } from 'lucide-react';

interface ActionsCardProps {
  onAction: (action: PlayerAction) => void;
  isLoading: boolean;
}

const actions: PlayerAction[] = [
  {
    text: 'Forage for Food',
    description: 'Scour for snacks. [+10 Hunger, -2 Style, -1 Progress]',
    icon: Utensils,
    consequences: { hunger: 10, style: -2, irony: 0, authenticity: 0, coffee: 0, vinyls: 0, progress: -1, bikeHealth: 0 },
  },
  {
    text: 'Tune-up Bike',
    description: 'Maintain your fixie. [-5 Coffee, +15 Bike Health, -1 Progress]',
    icon: Wrench,
    consequences: { hunger: 0, style: 0, irony: 0, authenticity: 0, coffee: -5, vinyls: 0, progress: -1, bikeHealth: 15 },
  },
  {
    text: 'Go Thrifting',
    description: 'Hunt for vintage threads. [-5 Coffee, +10 Style, -5 Authenticity, -1 Progress]',
    icon: ShoppingBag,
    consequences: { hunger: 0, style: 10, irony: 0, authenticity: -5, coffee: -5, vinyls: 0, progress: -1, bikeHealth: 0 },
  },
  {
    text: 'Street Perform',
    description: 'Share your "art". [+10 Coffee, +5 Irony, -5 Authenticity, -1 Progress]',
    icon: Guitar,
    consequences: { hunger: 0, style: 0, irony: 5, authenticity: -5, coffee: 10, vinyls: 0, progress: -1, bikeHealth: 0 },
  },
];


export default function ActionsCard({ onAction, isLoading }: ActionsCardProps) {
  return (
    <Card className="shadow-lg border">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline text-lg">Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <TooltipProvider>
          {actions.map((action) => (
            <Tooltip key={action.text}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className="flex flex-col h-auto p-3 text-center gap-1"
                  onClick={() => onAction(action)}
                  disabled={isLoading}
                >
                  <action.icon className="h-6 w-6" />
                  <span className="text-xs leading-tight">{action.text}</span>
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
