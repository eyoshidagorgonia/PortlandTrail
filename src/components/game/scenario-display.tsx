'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Scenario, Choice } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';

interface ScenarioDisplayProps {
  scenario: Scenario | null;
  isLoading: boolean;
  onChoice: (choice: Choice) => void;
}

const LoadingState = () => (
    <Card className="shadow-lg border">
      <CardHeader className="p-4 pb-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-1" />
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        <Skeleton className="w-full h-48 rounded-md" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-4 p-4 pt-4 border-t">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  );

export default function ScenarioDisplay({ scenario, isLoading, onChoice }: ScenarioDisplayProps) {
  if (isLoading || !scenario) {
    return <LoadingState />;
  }

  // This component might receive the previous scenario if a fetch for a new one fails.
  // The old scenario object won't have an `image` property.
  const hasImage = 'image' in scenario && scenario.image;

  return (
    <Card className="shadow-lg border">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="font-headline text-xl">{scenario.challenge}</CardTitle>
        {scenario.reward && <CardDescription className="pt-1">Potential Reward: {scenario.reward}</CardDescription>}
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {hasImage && (
          <div className="mb-4 rounded-md overflow-hidden border">
            <Image
              src={scenario.image}
              alt={scenario.challenge || 'Scenario image'}
              width={500}
              height={300}
              className="w-full object-cover"
              priority
            />
          </div>
        )}
        <p className="text-sm text-foreground/90 leading-normal whitespace-pre-wrap">{scenario.scenario}</p>
        {scenario.diablo2Element && (
           <p className="mt-3 text-sm text-primary/80 border-l-2 border-primary/50 pl-3 italic">
            {scenario.diablo2Element}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-4 p-4 pt-4 border-t">
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
