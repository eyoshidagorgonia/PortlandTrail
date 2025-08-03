
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
            className="relative w-24 h-24 rounded-full border-4 border-border/60 bg-black/50 shadow-inner"
            style={{
                boxShadow: 'inset 0 0 10px #000, 0 0 15px -5px var(--border)',
            }}
        >
            {/* The liquid fill */}
            <div 
                className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500 ease-out"
                style={{ 
                    height: `${percentage}%`, 
                    backgroundColor: color,
                    boxShadow: `0 0 20px 5px ${color}`,
                    opacity: 0.8,
                }} 
            />
            {/* Liquid surface/edge effect */}
            {value > 0 && value < 100 && (
                 <div
                    className="absolute left-0 right-0 w-full bg-white/40"
                    style={{
                        top: `${100 - percentage}%`,
                        height: '3px',
                        filter: 'blur(1px)',
                        transform: 'translateY(-1.5px)',
                    }}
                 />
            )}
            {/* Glassy glare effect */}
            <div 
                className="absolute top-2 left-2 w-20 h-20 rounded-full"
                style={{
                    background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.4), transparent 60%)',
                    transform: 'rotate(10deg)',
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
