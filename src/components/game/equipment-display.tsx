
'use client';

import React from 'react';
import type { Equipment, EquipmentSlot, LootItem } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { getItemIcon } from './icons';

const getQualityColor = (quality: string) => {
    switch (quality) {
        case 'One-of-One': return 'text-accent border-accent';
        case 'Artisanal': return 'text-blue-400 border-blue-400';
        case 'Thrifted':
        default: return 'text-green-400 border-green-400';
    }
}
const getQualityBgColor = (quality: string) => {
    switch (quality) {
        case 'One-of-One': return 'bg-accent/10';
        case 'Artisanal': return 'bg-blue-400/10';
        case 'Thrifted':
        default: return 'bg-green-400/10';
    }
}

const StatModifierDisplay = ({ label, value }: { label: string, value: number}) => {
    if (value === 0) return null;
    const Icon = value > 0 ? ArrowUp : ArrowDown;
    const color = value > 0 ? 'text-green-400' : 'text-red-400';

    return (
        <div className={`flex items-center gap-1 ${color}`}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="capitalize">{value} {label}</span>
        </div>
    )
}

const ItemTooltipContent = ({ item }: { item: LootItem }) => (
    <div className="p-1 space-y-1 font-body">
        <p className={cn("font-bold", getQualityColor(item.quality))}>{item.name}</p>
        <p className="text-xs italic text-muted-foreground max-w-xs">{item.flavorText}</p>
        <div className="grid grid-cols-1 gap-x-4 gap-y-1 pt-1 text-sm">
            {Object.entries(item.modifiers).map(([stat, value]) => (
                <StatModifierDisplay key={stat} label={stat} value={value || 0} />
            ))}
        </div>
        <p className="text-xs text-destructive pt-2">Click to unequip</p>
    </div>
);


const EquipmentSlotDisplay = ({ slot, item, onUnequip }: { slot: EquipmentSlot, item: LootItem | undefined, onUnequip: (slot: EquipmentSlot) => void }) => {
    const gridPosition: { [key in EquipmentSlot]: string } = {
        Headwear: 'col-start-2',
        Eyewear: 'col-start-3',
        Outerwear: 'col-start-2',
        Accessory: 'col-start-1',
        Footwear: 'col-start-2',
    };
    
    const Icon = getItemIcon(slot);
    
    return (
        <div className={cn("flex flex-col items-center justify-center", gridPosition[slot])}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div 
                            className={cn(
                                "h-20 w-20 flex items-center justify-center rounded-sm border-2 bg-muted/20 hover:bg-muted/40 transition-colors",
                                item ? getQualityColor(item.quality) : 'border-border/50',
                                item && "cursor-pointer"
                            )}
                            onClick={() => item && onUnequip(item.type)}
                        >
                            {item ? (
                                <div className={cn("p-1 text-center flex items-center justify-center h-full w-full", getQualityBgColor(item.quality))}>
                                    {React.createElement(getItemIcon(item.type), { className: "h-10 w-10" })}
                                </div>
                            ) : (
                                <Icon className="h-10 w-10 text-muted-foreground/50" />
                            )}
                        </div>
                    </TooltipTrigger>
                    {item ? (
                        <TooltipContent side="right" className="ml-2">
                           <ItemTooltipContent item={item} />
                        </TooltipContent>
                    ) : (
                        <TooltipContent side="right" className="ml-2">
                            <p className="capitalize">{slot}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

export default function EquipmentDisplay({ equipment, onUnequip }: { equipment: Equipment, onUnequip: (slot: EquipmentSlot) => void }) {
    const SLOTS: EquipmentSlot[] = ["Headwear", "Accessory", "Outerwear", "Eyewear", "Footwear"];
    
    return (
        <div>
            <h3 className="text-sm font-headline uppercase text-muted-foreground tracking-widest text-center mb-2">Equipment</h3>
            <div 
                className="relative grid grid-cols-3 justify-center gap-1 p-4 rounded-sm"
                style={{ backgroundImage: `
                    radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%),
                    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23D5A87A' fill-opacity='0.05'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            >
                <div 
                    className="absolute inset-0 bg-no-repeat bg-center opacity-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='hsl(var(--foreground))'%3E%3Cpath d='M12 2a5 5 0 0 0-5 5v1.8c0 .2.1.4.2.5l2.4 2.4c.3.3.7.5 1.1.5h2.6c.4 0 .8-.2 1.1-.5l2.4-2.4c.1-.1.2-.3.2-.5V7a5 5 0 0 0-5-5zm-3.5 11.1L6 14.5V22h2v-7l1-1h6l1 1v7h2v-7.5l-2.5-1.4-1.5 1.5h-3l-1.5-1.5z'/%3E%3C/svg%3E")`,
                        backgroundSize: '60%',
                    }}
                />
                {SLOTS.map(slot => (
                    <EquipmentSlotDisplay key={slot} slot={slot} item={equipment[slot]} onUnequip={onUnequip} />
                ))}
            </div>
        </div>
    );
}
