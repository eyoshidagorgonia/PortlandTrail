"use client"

import * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from "@/lib/utils";

interface OrbProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
  tooltip?: string;
}

const Orb = ({ label, value, maxValue = 100, color = 'hsl(var(--primary))', tooltip }: OrbProps) => {
  const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));

  const orbContent = (
    <div className="flex flex-col items-center gap-1">
        <div 
            className="relative w-20 h-20 rounded-full border-2 border-border/60 bg-background/80 shadow-inner overflow-hidden"
            style={{
                boxShadow: `inset 0 0 8px rgba(0,0,0,0.7), 0 0 12px -5px ${color}`,
            }}
        >
            {/* Background Texture */}
            <div 
                className="absolute inset-0 opacity-20" 
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}
            />

            {/* The glowing fill */}
            <div 
                className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out"
                style={{ 
                    height: `${percentage}%`, 
                    background: `radial-gradient(ellipse at bottom, ${color} 0%, transparent 80%)`,
                    boxShadow: `0 0 20px 8px ${color}`,
                    opacity: 0.9,
                }}
            />
            
            {/* Color-matched gradient overlay for shading */}
             <div 
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 100%)`,
                    mixBlendMode: 'multiply'
                }}
            />


            {/* Inner glow/glare effect, more subtle */}
            <div 
                className="absolute inset-0 rounded-full"
                style={{
                    background: 'radial-gradient(circle at 50% 40%, hsla(0,0%,100%,0.1), transparent 50%)',
                }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
                 <span className="font-mono text-2xl font-bold text-white" style={{textShadow: '1px 1px 3px #000'}}>{Math.round(value)}</span>
            </div>
        </div>
         <span className="font-headline text-md tracking-wider text-muted-foreground">{label}</span>
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">{orbContent}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return orbContent;
};

export { Orb }
