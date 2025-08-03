
"use client"

import * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VialProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
  tooltip?: string;
}

const Vial = ({ label, value, maxValue = 100, color = 'hsl(var(--primary))', tooltip }: VialProps) => {
  const percentage = (value / maxValue) * 100;

  const content = (
    <div className="relative w-full h-full flex flex-col justify-end text-center p-2 border-2 border-secondary bg-black/30 overflow-hidden rounded-md">
      <div 
        className="absolute bottom-0 left-0 right-0 transition-all duration-500" 
        style={{ height: `${percentage}%`, backgroundColor: color, zIndex: 1 }}
      />
      <div 
        className="absolute inset-0 z-20"
        style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 30%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 52%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.4) 100%)'
        }}
      />
      <div className="relative z-30 flex flex-col h-full justify-between text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>
        <span className="font-headline text-lg tracking-wider">{label}</span>
        <span className="font-mono text-2xl font-bold">{value}%</span>
      </div>
    </div>
  );

  const trigger = <div className="w-1/2 h-28">{content}</div>;

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {trigger}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return trigger;
};

export { Vial }
