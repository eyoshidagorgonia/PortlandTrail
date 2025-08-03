
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MapPin, Maximize, Route } from 'lucide-react';
import type { TrailEvent } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface TrailMapProps {
  progress: number;
  waypoints: string[];
  currentLocation: string;
  events: TrailEvent[];
}

const MapView = ({ progress, waypoints, events, isMini }: { progress: number; waypoints: string[], events: TrailEvent[], isMini: boolean }) => (
    <div className="relative w-full">
        {/* Trail Line */}
        <div className={cn("absolute top-1/2 left-0 right-0 bg-muted rounded-full -translate-y-1/2", isMini ? 'h-2' : 'h-4')} />
        <div
            className={cn("absolute top-1/2 left-0 bg-primary rounded-full -translate-y-1/2", isMini ? 'h-2' : 'h-4')}
            style={{ width: `${progress}%` }}
        />
        
        {/* Player Position */}
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <div 
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 bg-primary/80 transition-all duration-500 flex items-center justify-center",
                            isMini ? "h-6 w-6 border-background" : "h-8 w-8 border-background"
                        )}
                        style={{ left: `${progress}%` }}>
                            <MapPin className={cn("text-primary-foreground", isMini ? "h-3 w-3" : "h-4 w-4")} />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>You are here ({Math.round(progress)}%)</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

        {/* Waypoints */}
        <div className="absolute top-1/2 left-0 right-0 flex justify-between -translate-y-1/2">
        {waypoints.map((waypoint, index) => {
            const waypointProgress = (index / (waypoints.length - 1)) * 100;
            const isPassed = progress >= waypointProgress;

            return (
            <TooltipProvider key={waypoint}>
                <Tooltip>
                <TooltipTrigger>
                    <div
                        className={cn(
                            "rounded-full border-2 transition-colors duration-500",
                            isMini ? "h-3 w-3" : "h-5 w-5",
                            isPassed ? 'bg-primary/80 border-primary/50' : 'bg-muted border-border'
                        )}
                        style={{
                            transform: `translateX(${index === 0 ? '0%' : index === waypoints.length - 1 ? '-100%' : '-50%'})`
                        }}
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

        {/* Events */}
        {!isMini && events.map((event, index) => (
            <TooltipProvider key={index}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className="absolute top-1/2 -translate-y-[150%] -translate-x-1/2 cursor-help"
                            style={{ left: `${event.progress}%` }}
                        >
                            <Route className="h-5 w-5 text-accent animate-pulse" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p className='max-w-xs'>{event.description}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ))}
    </div>
);


export default function TrailMap({ progress, waypoints, currentLocation, events }: TrailMapProps) {
  return (
    <Dialog>
        <Card className="bg-card/50 backdrop-blur-sm border-none shadow-none">
        <CardHeader className="flex-row items-center justify-between pb-2 px-0">
            <CardTitle className="font-headline text-lg font-bold">The Trail</CardTitle>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                    <Maximize className="h-4 w-4" />
                </Button>
            </DialogTrigger>
        </CardHeader>
        <CardContent className="pt-4 px-0">
            <div className="h-8"> {/* Container to give space for player pin */}
                <MapView progress={progress} waypoints={waypoints} events={events} isMini={true} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground font-body mt-2">
                <span>SF</span>
                <span>PDX</span>
            </div>
        </CardContent>
        </Card>
        <DialogContent className="max-w-4xl w-full p-8">
            <DialogHeader>
                <DialogTitle className="font-headline text-4xl text-center mb-4">Trail Map</DialogTitle>
            </DialogHeader>
            <div className="h-24 flex items-center">
                 <MapView progress={progress} waypoints={waypoints} events={events} isMini={false} />
            </div>
            <div className="flex justify-between text-lg text-muted-foreground font-body mt-2">
                <span>San Francisco</span>
                <span className="font-bold text-foreground">Near: {currentLocation}</span>
                <span className="font-bold text-primary">Portland</span>
            </div>
        </DialogContent>
    </Dialog>
  );
}
