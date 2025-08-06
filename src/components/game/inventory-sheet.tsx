
'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThematicSeparator } from "./thematic-separator";
import type { Equipment, LootItem, EquipmentSlot } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface InventorySheetProps {
    equipment: Equipment;
    inventory: LootItem[];
    onEquip: (item: LootItem) => void;
    onUnequip: (slot: EquipmentSlot) => void;
}

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
    const Icon = value > 0 ? ArrowUp : ArrowDown;
    const color = value > 0 ? 'text-green-400' : 'text-red-400';

    return (
        <div className={`flex items-center gap-1 ${color}`}>
            <Icon className="h-4 w-4" />
            <span>{value} {label}</span>
        </div>
    )
}

const EquipmentSlotDisplay = ({ slot, item, onUnequip }: { slot: EquipmentSlot, item: LootItem | undefined, onUnequip: (slot: EquipmentSlot) => void }) => {
    return (
        <div className="p-2 rounded-sm bg-muted/40 border border-border/50 space-y-2">
            <h4 className="font-headline text-lg text-center text-muted-foreground">{slot}</h4>
            {item ? (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={cn("p-2 rounded-sm border cursor-pointer", getQualityColor(item.quality), getQualityBgColor(item.quality))}
                                onClick={() => onUnequip(item.type)}
                            >
                                <p className="font-bold">{item.name}</p>
                                <p className="text-xs italic text-muted-foreground">{item.flavorText}</p>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Click to unequip</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : (
                <div className="p-2 text-center text-muted-foreground/50 italic h-[60px] flex items-center justify-center">
                    Empty
                </div>
            )}
        </div>
    )
}

export function InventorySheet({ equipment, inventory, onEquip, onUnequip }: InventorySheetProps) {
    const [selectedItem, setSelectedItem] = useState<LootItem | null>(null);

    const handleItemClick = (item: LootItem) => {
        setSelectedItem(item);
    }
    
    const handleEquipClick = () => {
        if(selectedItem) {
            onEquip(selectedItem);
            setSelectedItem(null); // Clear selection after equipping
        }
    }

    const EQUIPMENT_SLOTS: EquipmentSlot[] = ["Headwear", "Eyewear", "Outerwear", "Accessory", "Footwear"];


    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="secondary" className="w-full font-headline text-xl">Inventory &amp; Gear</Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle className="font-headline text-4xl text-center">Equipment</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-3 p-1">
                    {EQUIPMENT_SLOTS.map(slot => (
                        <EquipmentSlotDisplay key={slot} slot={slot} item={equipment[slot]} onUnequip={onUnequip} />
                    ))}
                </div>

                <ThematicSeparator />

                <h3 className="font-headline text-3xl text-center">Inventory</h3>
                <ScrollArea className="h-[40vh] border rounded-sm p-2 bg-muted/20">
                    <div className="space-y-2">
                    {inventory.length === 0 && <p className="text-center text-muted-foreground italic p-4">Your bag is tragically empty.</p>}
                    {inventory.map(item => (
                        <div 
                            key={item.name}
                            onClick={() => handleItemClick(item)}
                            className={cn(
                                "p-2 rounded-sm border cursor-pointer transition-all", 
                                getQualityColor(item.quality), 
                                getQualityBgColor(item.quality),
                                selectedItem?.name === item.name && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                            )}
                        >
                            <p className="font-bold">{item.name}</p>
                            <p className="text-xs italic text-muted-foreground">{item.flavorText}</p>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
                
                {selectedItem && (
                    <div className="mt-4 p-3 border rounded-sm bg-card">
                        <h4 className="font-headline text-xl">{selectedItem.name}</h4>
                        <p className={cn("font-bold text-sm", getQualityColor(selectedItem.quality))}>[{selectedItem.quality}]</p>
                        <p className="text-sm italic text-muted-foreground mt-1">{selectedItem.flavorText}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm font-body">
                           {Object.entries(selectedItem.modifiers).map(([stat, value]) => (
                               value !== 0 && <StatModifierDisplay key={stat} label={stat} value={value} />
                           ))}
                        </div>
                        <Button className="w-full mt-4" onClick={handleEquipClick}>Equip</Button>
                    </div>
                )}

            </SheetContent>
        </Sheet>
    )
}
