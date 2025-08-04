
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Choice } from '@/lib/types';
import { ThematicSeparator } from './thematic-separator';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface OutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  choice: Choice;
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

export default function OutcomeModal({ isOpen, onClose, choice }: OutcomeModalProps) {
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
                    <ConsequenceItem label="Health" value={consequences.health} />
                    <ConsequenceItem label="Style" value={consequences.style} />
                    <ConsequenceItem label="Irony" value={consequences.irony} />
                    <ConsequenceItem label="Authenticity" value={consequences.authenticity} />
                    <ConsequenceItem label="Vibes" value={consequences.vibes} />
                    <ConsequenceItem label="Bike Stamina" value={consequences.stamina} />
                    <ConsequenceItem label="Coffee Beans" value={consequences.coffee} />
                    <ConsequenceItem label="Vinyls" value={consequences.vinyls} />
                    <ConsequenceItem label="Progress" value={consequences.progress} />
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


                <DialogFooter>
                    <Button onClick={onClose} className="w-full font-headline text-xl" size="lg">Continue</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

    