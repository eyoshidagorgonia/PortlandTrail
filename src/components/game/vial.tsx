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
    <div className="relative w-full h-full flex flex-col justify-end text-center p-2 border-2 border-secondary bg-black/30 overflow-hidden rounded-sm">
      <div 
        className="absolute bottom-0 left-0 right-0 transition-all duration-500" 
        style={{ height: `${percentage}%`, backgroundColor: color, zIndex: 1 }}
      />
      <div className="relative z-10 flex flex-col h-full justify-between text-white mix-blend-difference">
        <span className="font-headline text-lg tracking-wider">{label}</span>
        <span className="font-mono text-2xl font-bold">{value}%</span>
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-1/2 h-28">
              {content}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="w-1/2 h-28">
      {content}
    </div>
  )
};

export { Vial }

    