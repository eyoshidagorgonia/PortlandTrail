
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Scenario, Choice } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConjuringIcon } from './icons';
import { cn } from '@/lib/utils';

interface ScenarioDisplayProps {
  scenario: Scenario | null;
  isLoading: boolean;
  isImageLoading: boolean;
  sceneImage: string | null;
  onChoice: (choice: Choice) => void;
}

const LoadingState = () => (
    <Card className="bg-card/90 backdrop-blur-sm">
      <CardHeader className="p-4 pb-2">
        <Skeleton className="h-8 w-3/4" />
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        <div className="w-full aspect-video bg-muted/50 rounded-sm flex flex-col items-center justify-center gap-2 text-foreground animate-pulse-text">
            <ConjuringIcon className="h-10 w-10" />
            <p className="font-body">The Vibe Sage is painting the scene...</p>
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
      </CardContent>
      <CardFooter className="grid grid-cols-3 gap-4 p-4 pt-4 border-t border-border/50">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardFooter>
    </Card>
  );

export default function ScenarioDisplay({ scenario, isLoading, isImageLoading, sceneImage, onChoice }: ScenarioDisplayProps) {
  if (isLoading || !scenario) {
    return <LoadingState />;
  }

  return (
    <Card className="h-full flex flex-col bg-card/90 backdrop-blur-sm">
      <CardHeader className="p-6 pb-2">
        <div className="space-y-1">
            <p className="font-headline text-3xl font-bold tracking-wide">{scenario.scenario}</p>
            <p className="font-body text-xl text-muted-foreground">{scenario.challenge}</p>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2 flex-grow">
        <div className="mb-4 overflow-hidden rounded-sm border-2 border-border/50 bg-muted/30">
          {isImageLoading || !sceneImage ? (
             <div className="w-full aspect-video bg-muted/50 rounded-sm flex flex-col items-center justify-center gap-2 text-foreground animate-pulse-text">
                <ConjuringIcon className="h-10 w-10" />
                <p className="font-body">The Vibe Sage is painting the scene...</p>
            </div>
          ) : (
            <Image
              src={sceneImage}
              alt={scenario.challenge}
              width={600}
              height={400}
              className="w-full h-auto object-cover"
              unoptimized // Required for local data URIs from Auto1111
              data-ai-hint="scene depiction"
            />
          )}
        </div>
        
        {scenario.diablo2Element && (
           <p className="mt-4 text-lg text-accent/80 border-l-4 border-accent/50 pl-4 italic font-body">
            {scenario.diablo2Element}
          </p>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-3 gap-4 p-6 pt-4 border-t-2 border-border/50">
        <TooltipProvider>
          {scenario.choices.map((choice, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button 
                  variant='secondary'
                  onClick={() => onChoice(choice)}
                  disabled={isLoading || isImageLoading}
                  className={cn("font-headline text-xl w-full whitespace-normal h-auto")}
                  size="lg"
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
