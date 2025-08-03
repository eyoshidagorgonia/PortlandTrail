
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Scenario, Choice } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ScenarioDisplayProps {
  scenario: Scenario | null;
  isLoading: boolean;
  isImageLoading: boolean;
  sceneImage: string | null;
  onChoice: (choice: Choice) => void;
}

const LoadingState = () => (
    <Card className="shadow-lg">
      <CardHeader className="p-4 pb-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-1" />
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        <Skeleton className="w-full aspect-video rounded-md" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-4 p-4 pt-4 border-t border-border/50">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  );

export default function ScenarioDisplay({ scenario, isLoading, isImageLoading, sceneImage, onChoice }: ScenarioDisplayProps) {
  if (isLoading || !scenario) {
    return <LoadingState />;
  }

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="font-headline text-3xl">{scenario.challenge}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="mb-4 rounded-md overflow-hidden border border-border/50 bg-muted/30">
          {isImageLoading || !sceneImage ? (
            <Skeleton className="w-full aspect-video" />
          ) : (
            <Image
              src={sceneImage}
              alt={scenario.challenge}
              width={768}
              height={512}
              className="w-full h-auto object-cover"
              unoptimized // Required for local data URIs from Auto1111
              data-ai-hint="scene depiction"
            />
          )}
        </div>
        <p className="text-lg text-foreground/90 leading-relaxed whitespace-pre-wrap font-body">{scenario.scenario}</p>
        {scenario.diablo2Element && (
           <p className="mt-4 text-base text-accent/80 border-l-2 border-accent/50 pl-3 italic font-body">
            {scenario.diablo2Element}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-4 p-4 pt-4 border-t border-border/50">
        <TooltipProvider>
          {scenario.choices.map((choice, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button 
                  variant={index === 0 ? 'default' : 'secondary'} 
                  onClick={() => onChoice(choice)}
                  disabled={isLoading || isImageLoading}
                  className="font-headline text-lg"
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
