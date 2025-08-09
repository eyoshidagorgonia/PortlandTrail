
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
    <div className="flex flex-col items-center gap-2">
        <div 
            className="relative w-24 h-24 rounded-full border-4 border-border/60 bg-black/50 shadow-inner overflow-hidden"
            style={{
                boxShadow: 'inset 0 0 10px #000, 0 0 15px -5px hsl(var(--border))',
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
                    boxShadow: `0 0 30px 10px ${color}`,
                    opacity: 0.8,
                }}
            />
            
            {/* Inner glow/glare effect, more subtle */}
            <div 
                className="absolute inset-0 rounded-full"
                style={{
                    background: 'radial-gradient(circle at 50% 40%, hsla(0,0%,100%,0.2), transparent 50%)',
                }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
                 <span className="font-mono text-3xl font-bold text-white" style={{textShadow: '2px 2px 4px #000'}}>{Math.round(value)}</span>
            </div>
        </div>
         <span className="font-headline text-lg tracking-wider text-muted-foreground">{label}</span>
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
