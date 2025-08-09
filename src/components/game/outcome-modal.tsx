
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Choice, LootItem } from '@/lib/types';
import { ThematicSeparator } from './thematic-separator';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface OutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  choice: Choice;
  loot: LootItem[];
}

const ConsequenceItem = ({ label, value }: { label: string; value: number }) => {
  if (value === 0) return null;

  const Icon = value > 0 ? ArrowUp : ArrowDown;
  const color = value > 0 ? 'text-green-400' : 'text-red-400';
  const sign = value > 0 ? '+' : '';

  return (
    <div className="flex justify-between items-center text-lg text-muted-foreground font-body">
      <span>{label}</span>
      <div className={`flex items-center gap-1 font-mono font-bold ${color}`}>
        <Icon className="h-4 w-4" />
        <span>{sign}{value}</span>
      </div>
    </div>
  );
};

const getQualityColor = (quality: string) => {
    switch (quality) {
        case 'One-of-One': return 'text-accent';
        case 'Artisanal': return 'text-blue-400';
        case 'Thrifted':
        default: return 'text-green-400';
    }
}

export default function OutcomeModal({ isOpen, onClose, choice, loot }: OutcomeModalProps) {
    if (!choice) return null;

    const { consequences, text, description } = choice;
    const badge = (consequences as any).badge;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline text-3xl text-center">{text}</DialogTitle>
                    <DialogDescription className="text-center text-base pt-2 font-body">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                
                <ThematicSeparator />

                <div className="space-y-2 py-4">
                    <h4 className="font-headline text-xl text-center text-primary mb-4">Consequences</h4>
                    <ConsequenceItem label="Health" value={consequences.health ?? 0} />
                    <ConsequenceItem label="Style" value={consequences.style ?? 0} />
                    <ConsequenceItem label="Irony" value={consequences.irony ?? 0} />
                    <ConsequenceItem label="Authenticity" value={consequences.authenticity ?? 0} />
                    <ConsequenceItem label="Vibes" value={consequences.vibes ?? 0} />
                    <ConsequenceItem label="Bike Stamina" value={consequences.stamina ?? 0} />
                    <ConsequenceItem label="Coffee Beans" value={consequences.coffee ?? 0} />
                    <ConsequenceItem label="Vinyls" value={consequences.vinyls ?? 0} />
                    <ConsequenceItem label="Progress" value={consequences.progress ?? 0} />
                </div>
                
                {badge && (
                    <>
                        <ThematicSeparator />
                        <div className="text-center py-4">
                            <h4 className="font-headline text-xl text-center text-primary mb-2">Badge Earned!</h4>
                            <p className="text-2xl">{badge.badgeEmoji}</p>
                            <p className="font-body text-lg">{badge.badgeDescription}</p>
                        </div>
                    </>
                )}

                {loot.length > 0 && (
                     <>
                        <ThematicSeparator />
                        <div className="text-center py-4 space-y-3">
                            <h4 className="font-headline text-xl text-center text-primary mb-2">Loot Found!</h4>
                            {loot.map(item => (
                                <div key={item.name} className='text-left font-body p-2 bg-muted/30 rounded-sm border border-border/30'>
                                    <p className={`font-bold ${getQualityColor(item.quality)}`}>{item.name} [{item.quality}]</p>
                                    <p className="text-sm italic text-muted-foreground">{item.flavorText}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}


                <DialogFooter>
                    <Button onClick={onClose} className="w-full font-headline text-xl" size="lg">Continue</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
