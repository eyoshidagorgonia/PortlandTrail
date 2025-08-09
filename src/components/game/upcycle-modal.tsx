
'use client';

import React, { useState, useMemo } from 'react';
import type { LootItem, GearQuality, Equipment } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { getItemIcon } from './icons';
import { Checkbox } from '../ui/checkbox';
import { AlertCircle, Zap } from 'lucide-react';

interface UpcycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: LootItem[];
  equipment: Equipment;
  onUpcycle: (items: LootItem[], quality: GearQuality) => void;
  isLoading: boolean;
}

const getQualityColor = (quality: string) => {
    switch (quality) {
        case 'One-of-One': return 'text-accent border-accent';
        case 'Artisanal': return 'text-blue-400 border-blue-400';
        case 'Thrifted':
        default: return 'text-green-400 border-green-400';
    }
}

const ItemCard = ({ item, isSelected, onSelect, disabled }: { item: LootItem, isSelected: boolean, onSelect: (item: LootItem) => void, disabled: boolean }) => {
    const Icon = getItemIcon(item.type);
    return (
        <div 
            className={cn(
                "p-2 rounded-sm border-2 flex items-center gap-3 transition-all",
                isSelected ? 'border-primary shadow-lg shadow-primary/20 bg-primary/10' : 'border-border/20 bg-muted/20',
                disabled && !isSelected ? 'opacity-50' : 'cursor-pointer hover:border-border/50',
                getQualityColor(item.quality)
            )}
            onClick={() => !disabled && onSelect(item)}
        >
            <Checkbox checked={isSelected} className="border-current" disabled={disabled && !isSelected}/>
            <Icon className="h-8 w-8 shrink-0" />
            <div className='flex-grow'>
                <p className="font-bold truncate font-body">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.isEquipped ? "(Equipped)" : ""}</p>
            </div>
        </div>
    )
}

export default function UpcycleModal({ isOpen, onClose, inventory, equipment, onUpcycle, isLoading }: UpcycleModalProps) {
    const [selectedItems, setSelectedItems] = useState<LootItem[]>([]);

    const allItems = useMemo(() => {
        const equippedItems = Object.values(equipment).map(item => ({...item, isEquipped: true}));
        const inventoryItems = inventory.map(item => ({...item, isEquipped: false}));
        return [...inventoryItems, ...equippedItems];
    }, [inventory, equipment]);

    const groupedItems = useMemo(() => {
        const groups: Record<GearQuality, LootItem[]> = {
            'Thrifted': [],
            'Artisanal': [],
            'One-of-One': [],
        };
        allItems.forEach(item => {
            if (item && groups[item.quality]) {
                groups[item.quality].push(item);
            }
        });
        return groups;
    }, [allItems]);

    const hasAnyUpcyclableGroups = useMemo(() => {
        return Object.values(groupedItems).some(group => group.length >= 3);
    }, [groupedItems]);

    const handleSelect = (item: LootItem) => {
        if (isLoading) return;

        const isAlreadySelected = selectedItems.some(i => i.name === item.name);

        if (isAlreadySelected) {
            setSelectedItems(selectedItems.filter(i => i.name !== item.name));
            return;
        }

        // If starting a new selection with a different quality, clear previous
        if (selectedItems.length > 0 && selectedItems[0].quality !== item.quality) {
            setSelectedItems([item]);
            return;
        }

        if (selectedItems.length < 3) {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const handleUpcycleClick = () => {
        if (selectedItems.length === 3) {
            onUpcycle(selectedItems, selectedItems[0].quality);
            setSelectedItems([]);
            onClose();
        }
    };
    
    // Clear selection when modal is closed
    React.useEffect(() => {
        if (!isOpen) {
            setSelectedItems([]);
        }
    }, [isOpen]);

    const canUpcycle = selectedItems.length === 3;
    const nextQualityMap: Record<GearQuality, GearQuality | null> = {
        'Thrifted': 'Artisanal',
        'Artisanal': 'One-of-One',
        'One-of-One': null,
    };
    const nextQuality = canUpcycle ? nextQualityMap[selectedItems[0].quality] : null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="font-headline text-3xl text-center">Upcycle Station</DialogTitle>
                    <DialogDescription className="text-center font-body text-base">Combine 3 items of the same quality for a chance at greatness.</DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-grow my-4 pr-4 -mr-4">
                     <div className="space-y-4">
                        {hasAnyUpcyclableGroups ? (
                            Object.entries(groupedItems).map(([quality, items]) => {
                                if (items.length < 3 || quality === 'One-of-One') return null;
                                const isThisQualitySelected = selectedItems.length > 0 && selectedItems[0].quality === quality;
                                const isOtherQualitySelected = selectedItems.length > 0 && selectedItems[0].quality !== quality;
                                const canSelectMore = selectedItems.length < 3;

                                return (
                                    <div key={quality}>
                                        <h4 className={cn("text-center font-bold mb-2 text-lg", getQualityColor(quality))}>{quality} Items</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {items.map((item, index) => (
                                                <ItemCard 
                                                    key={`${item.name}-${index}`} 
                                                    item={item} 
                                                    isSelected={selectedItems.some(i => i.name === item.name)}
                                                    onSelect={handleSelect} 
                                                    disabled={isOtherQualitySelected || (isThisQualitySelected && !canSelectMore && !selectedItems.some(i => i.name === item.name))}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <p className="text-sm text-center text-muted-foreground italic p-4">You have no items eligible for upcycling.</p>
                        )}
                     </div>
                </ScrollArea>

                <DialogFooter className="flex-shrink-0 pt-4 border-t border-border/50 flex-col space-y-3">
                     <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                        <span>Warning: 99.95% chance of a cursed item.</span>
                    </p>
                    <Button 
                        onClick={handleUpcycleClick}
                        disabled={!canUpcycle || isLoading}
                        className="w-full font-headline text-lg"
                        variant="destructive"
                        size="lg"
                    >
                        {isLoading ? 'Conjuring...' : (
                            <>
                                <Zap className="h-5 w-5 mr-2" />
                                {`Upcycle for 1 ${nextQuality || '...'} Item`}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
