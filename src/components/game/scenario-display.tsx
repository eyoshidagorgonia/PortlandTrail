'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Scenario, Choice } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ScenarioDisplayProps {
  scenario: Scenario | null;
  isLoading: boolean;
  onChoice: (choice: Choice) => void;
}

const LoadingState = () => (
  <Card className="flex-1">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
    <CardFooter className="flex gap-4">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
    </CardFooter>
  </Card>
);

export default function ScenarioDisplay({ scenario, isLoading, onChoice }: ScenarioDisplayProps) {
  if (isLoading || !scenario) {
    return <LoadingState />;
  }

  return (
    <Card className="flex-1 flex flex-col justify-between shadow-lg border-2 border-foreground/10">
      <CardHeader>
        <CardTitle className="font-headline text-xl">{scenario.challenge}</CardTitle>
        {scenario.reward && <CardDescription>Potential Reward: {scenario.reward}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/90 leading-relaxed">{scenario.scenario}</p>
        {scenario.diablo2Element && (
           <p className="mt-4 text-sm text-primary/80 border-l-2 border-primary/50 pl-3 italic">
            {scenario.diablo2Element}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-4 pt-4 border-t">
        <TooltipProvider>
          {scenario.choices.map((choice, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button 
                  variant={index === 0 ? 'default' : 'secondary'} 
                  onClick={() => onChoice(choice)}
                  disabled={isLoading}
                >
                  {choice.text}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{choice.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
