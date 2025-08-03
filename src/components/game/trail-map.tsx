'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MapPin } from 'lucide-react';

interface TrailMapProps {
  progress: number;
  waypoints: string[];
  currentLocation: string;
}

export default function TrailMap({ progress, waypoints, currentLocation }: TrailMapProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex-row items-center justify-between pb-4">
        <CardTitle className="font-headline text-3xl font-bold">The Trail</CardTitle>
        <div className="text-sm text-muted-foreground flex items-center gap-2 font-body">
            <MapPin className="h-4 w-4" />
            <span>Near: <span className="font-semibold text-foreground">{currentLocation}</span></span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="relative h-12 w-full mb-2">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted rounded-none -translate-y-1/2" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-primary rounded-none -translate-y-1/2"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute top-1/2 left-0 right-0 flex justify-between -translate-y-1/2">
            {waypoints.map((waypoint, index) => {
              const waypointProgress = (index / (waypoints.length - 1)) * 100;
              const isPassed = progress >= waypointProgress;
              const isCurrent = waypoint === currentLocation;

              return (
                <TooltipProvider key={waypoint}>
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        className={`h-4 w-4 rounded-none border-2 ${
                          isCurrent ? 'bg-primary border-primary-foreground animate-pulse' : isPassed ? 'bg-primary border-primary/50' : 'bg-muted border-border'
                        } transition-colors duration-500 transform rotate-45`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{waypoint}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground font-body">
          <span>San Francisco</span>
          <span className="font-bold text-primary">Portland</span>
        </div>
      </CardContent>
    </Card>
  );
}
