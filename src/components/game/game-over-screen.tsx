'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlayerState } from '@/lib/types';
import { Award, Bike, Frown, PartyPopper, RefreshCw } from 'lucide-react';

interface GameOverScreenProps {
  status: 'gameover' | 'won';
  onRestart: () => void;
  finalState: PlayerState;
}

export default function GameOverScreen({ status, onRestart, finalState }: GameOverScreenProps) {
  const isWin = status === 'won';

  return (
    <main className="min-h-screen bg-background text-foreground font-body p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md text-center shadow-xl border">
        <CardHeader>
          {isWin ? (
            <PartyPopper className="mx-auto h-16 w-16 text-primary mb-4" />
          ) : (
            <Frown className="mx-auto h-16 w-16 text-destructive mb-4" />
          )}
          <CardTitle className="text-3xl font-headline">
            {isWin ? "You've Arrived in Portland!" : 'Your Journey Has Ended'}
          </CardTitle>
          <CardDescription>
            {isWin
              ? 'You successfully navigated the perils of the trail and can now enjoy a well-deserved, ethically sourced cup of coffee.'
              : 'The road was too much. Your fixed-gear bike lies abandoned, a monument to your failed quest for ultimate coolness.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-left bg-muted/50 p-4 rounded-lg border">
            <h4 className="font-headline text-lg mb-2 text-center">Final Tally</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex justify-between"><span>Vinyls Collected:</span> <span className="font-mono text-foreground">{finalState.resources.vinyls}</span></li>
              <li className="flex justify-between"><span>Final Style Score:</span> <span className="font-mono text-foreground">{finalState.stats.style}</span></li>
              <li className="flex justify-between"><span>Peak Irony:</span> <span className="font-mono text-foreground">{finalState.stats.irony}</span></li>
              <li className="flex justify-between"><span>Authenticity Level:</span> <span className="font-mono text-foreground">{finalState.stats.authenticity}</span></li>
            </ul>
          </div>
          <Button size="lg" onClick={onRestart} className="w-full">
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
