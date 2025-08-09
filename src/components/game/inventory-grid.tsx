
'use client';

import type { LootItem, EquipmentSlot } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '../ui/button';

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
        <p className="text-xs text-primary pt-2">Click to equip</p>
    </div>
);


const InventoryItemDisplay = ({ item, onEquip }: { item: LootItem, onEquip: (item: LootItem) => void }) => {
    return (
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div 
                        className={cn(
                            "h-20 w-20 flex items-center justify-center rounded-sm border-2 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer",
                            getQualityColor(item.quality)
                        )}
                        onClick={() => onEquip(item)}
                    >
                        <div className={cn("p-1 text-center", getQualityBgColor(item.quality))}>
                            <p className="font-bold text-xs leading-tight">{item.name}</p>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <ItemTooltipContent item={item} />
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}


export default function InventoryGrid({ inventory, onEquip }: { inventory: LootItem[], onEquip: (item: LootItem) => void }) {
    
    return (
        <div>
            <h3 className="text-sm font-headline uppercase text-muted-foreground tracking-widest text-center mb-2">Inventory</h3>
            <div className="grid grid-cols-3 gap-2 p-2 rounded-sm border border-border/20 bg-black/20 min-h-[96px]">
                {inventory.length === 0 && (
                    <p className="col-span-3 text-center text-muted-foreground italic p-4 text-sm">Your tote bag is tragically empty.</p>
                )}
                {inventory.map((item, index) => (
                    <InventoryItemDisplay key={`${item.name}-${index}`} item={item} onEquip={onEquip} />
                ))}
            </div>
        </div>
    );
}

    