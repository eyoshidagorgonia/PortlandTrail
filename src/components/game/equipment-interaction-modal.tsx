
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LootItem, EquipmentSlot } from '@/lib/types';
import { ThematicSeparator } from './thematic-separator';
import { ArrowDown, ArrowUp, X, Replace } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { getItemIcon } from './icons';

interface EquipmentInteractionModalProps {
  modalState: {
    isOpen: boolean;
    mode: 'equip' | 'manage' | null;
    item: LootItem | null;
  };
  swappableItems: LootItem[];
  onClose: () => void;
  onEquip: (itemToEquip: LootItem, itemToSwap?: LootItem) => void;
  onUnequip: (slot: EquipmentSlot) => void;
}

const getQualityColor = (quality: string) => {
    switch (quality) {
        case 'One-of-One': return 'text-accent';
        case 'Artisanal': return 'text-blue-400';
        case 'Thrifted':
        default: return 'text-green-400';
    }
}

const StatModifierDisplay = ({ label, value }: { label: string, value: number}) => {
    if (value === 0) return null;
    const Icon = value > 0 ? ArrowUp : ArrowDown;
    const color = value > 0 ? 'text-green-400' : 'text-red-400';

    return (
        <div className={`flex items-center justify-between text-sm ${color}`}>
            <span className="capitalize">{label}</span>
            <span className="font-mono font-bold">{value > 0 ? '+' : ''}{value}</span>
        </div>
    )
}

const ItemDisplay = ({ item }: { item: LootItem }) => {
    const Icon = getItemIcon(item.type);
    return (
        <div className='flex items-center gap-4 text-left font-body p-3 bg-muted/30 rounded-sm border border-border/30'>
            <Icon className={cn("h-12 w-12 shrink-0", getQualityColor(item.quality))} />
            <div className="w-full">
                <p className={cn("font-bold text-lg", getQualityColor(item.quality))}>{item.name} <span className="text-xs font-light">[{item.quality}]</span></p>
                <p className="text-sm italic text-muted-foreground">{item.flavorText}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2">
                    {Object.entries(item.modifiers).map(([stat, value]) => (
                        <StatModifierDisplay key={stat} label={stat} value={value || 0} />
                    ))}
                </div>
            </div>
        </div>
    );
};


export default function EquipmentInteractionModal({ modalState, swappableItems, onClose, onEquip, onUnequip }: EquipmentInteractionModalProps) {
    const { isOpen, mode, item } = modalState;

    if (!isOpen || !item) return null;
    
    const handleEquip = () => {
        onEquip(item);
    }
    
    const handleSwap = (swapWithItem: LootItem) => {
        onEquip(swapWithItem, item);
    }

    const handleUnequip = () => {
        onUnequip(item.type);
    }

    const title = mode === 'equip' ? 'Equip Item?' : 'Manage Equipment';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="font-headline text-3xl text-center">{title}</DialogTitle>
                </DialogHeader>
                
                <div className="flex-grow overflow-y-auto pr-4 -mr-4 my-2 space-y-4">
                    <ItemDisplay item={item} />

                    {mode === 'manage' && (
                        <>
                            <ThematicSeparator />
                            <div>
                                <h4 className="font-headline text-xl text-center text-primary mb-2">Swap With</h4>
                                {swappableItems.length > 0 ? (
                                    <ScrollArea className="max-h-48">
                                        <div className="space-y-2 pr-4">
                                        {swappableItems.map(swapItem => (
                                            <div key={swapItem.name} className="flex items-center gap-2">
                                                <div className="grow">
                                                    <ItemDisplay item={swapItem} />
                                                </div>
                                                <Button size="icon" variant="secondary" onClick={() => handleSwap(swapItem)} aria-label={`Swap with ${swapItem.name}`}>
                                                    <Replace className="h-5 w-5"/>
                                                </Button>
                                            </div>
                                        ))}
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <p className="text-sm text-center text-muted-foreground italic">Nothing else of this type in your tote bag.</p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="flex-shrink-0 pt-2 flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    {mode === 'equip' && (
                        <Button onClick={handleEquip} className="w-full font-headline text-lg" size="lg">Equip</Button>
                    )}
                    {mode === 'manage' && (
                         <Button onClick={handleUnequip} variant="destructive" className="w-full font-headline text-lg" size="lg">Unequip</Button>
                    )}
                     <Button onClick={onClose} variant="outline" className="w-full font-headline text-lg" size="lg">Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

    