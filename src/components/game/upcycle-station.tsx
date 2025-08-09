
'use client';

import React, { useState, useMemo } from 'react';
import type { LootItem, GearQuality } from '@/lib/types';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { getItemIcon } from './icons';
import { ThematicSeparator } from './thematic-separator';
import { AlertCircle, Zap } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';

interface UpcycleStationProps {
  inventory: LootItem[];
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

const ItemCard = ({ item, isSelected, onSelect }: { item: LootItem, isSelected: boolean, onSelect: (item: LootItem) => void }) => {
    const Icon = getItemIcon(item.type);
    return (
        <div 
            className={cn(
                "p-2 rounded-sm border-2 flex items-center gap-3 cursor-pointer transition-all",
                isSelected ? 'border-primary shadow-lg shadow-primary/20 bg-primary/10' : 'border-border/20 bg-black/20 hover:border-border/50',
                getQualityColor(item.quality)
            )}
            onClick={() => onSelect(item)}
        >
            <Checkbox checked={isSelected} className="border-current" />
            <Icon className="h-6 w-6 shrink-0" />
            <span className="text-sm truncate font-body">{item.name}</span>
        </div>
    )
}

export default function UpcycleStation({ inventory, onUpcycle, isLoading }: UpcycleStationProps) {
    const [selectedItems, setSelectedItems] = useState<LootItem[]>([]);

    const groupedItems = useMemo(() => {
        const groups: Record<GearQuality, LootItem[]> = {
            'Thrifted': [],
            'Artisanal': [],
            'One-of-One': [],
        };
        inventory.forEach(item => {
            if (groups[item.quality]) {
                groups[item.quality].push(item);
            }
        });
        return groups;
    }, [inventory]);

    const handleSelect = (item: LootItem) => {
        if (isLoading) return;

        const isAlreadySelected = selectedItems.some(i => i.name === item.name);

        if (isAlreadySelected) {
            setSelectedItems(selectedItems.filter(i => i.name !== item.name));
            return;
        }

        // If starting a new selection, clear previous
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
        }
    };

    const canUpcycle = selectedItems.length === 3;
    const nextQualityMap: Record<GearQuality, GearQuality | null> = {
        'Thrifted': 'Artisanal',
        'Artisanal': 'One-of-One',
        'One-of-One': null,
    };
    const nextQuality = canUpcycle ? nextQualityMap[selectedItems[0].quality] : null;

    return (
        <Card className="bg-transparent border-none shadow-none">
            <CardHeader className="p-0 text-center">
                <CardTitle className="text-sm font-headline uppercase text-muted-foreground tracking-widest mb-2">Upcycle Station</CardTitle>
            </CardHeader>
            <CardContent className="p-2 rounded-sm border border-border/20 bg-black/20 space-y-3">
                 <div className="space-y-3 max-h-52 overflow-y-auto pr-2">
                    {Object.entries(groupedItems).map(([quality, items]) => {
                        if (items.length < 3 || quality === 'One-of-One') return null;
                        return (
                            <div key={quality}>
                                <h4 className={cn("text-center font-bold mb-1 text-sm", getQualityColor(quality))}>{quality}</h4>
                                <div className="grid grid-cols-1 gap-1">
                                    {items.map((item, index) => (
                                        <ItemCard 
                                            key={`${item.name}-${index}`} 
                                            item={item} 
                                            isSelected={selectedItems.some(i => i.name === item.name)}
                                            onSelect={handleSelect} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                    {inventory.filter(i => i.quality !== 'One-of-One').length < 3 && (
                        <p className="text-xs text-center text-muted-foreground italic p-4">You need at least three items of the same quality to upcycle.</p>
                    )}
                 </div>
                 
                <ThematicSeparator />

                <div className="space-y-3 text-center">
                     <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                        <span>Warning: 99.95% chance of a cursed item.</span>
                    </p>
                    <Button 
                        onClick={handleUpcycleClick}
                        disabled={!canUpcycle || isLoading}
                        className="w-full font-headline"
                        variant="destructive"
                    >
                        {isLoading ? 'Conjuring...' : (
                            <>
                                <Zap className="h-4 w-4 mr-2" />
                                {`Upcycle for 1 ${nextQuality || '...'} Item`}
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

    