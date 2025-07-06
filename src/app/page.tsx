'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { INITIAL_PLAYER_STATE, TRAIL_WAYPOINTS } from '@/lib/constants';
import type { PlayerState, Scenario, Choice } from '@/lib/types';
import { getScenarioAction } from '@/app/actions';
import StatusDashboard from '@/components/game/status-dashboard';
import TrailMap from '@/components/game/trail-map';
import ScenarioDisplay from '@/components/game/scenario-display';
import GameOverScreen from '@/components/game/game-over-screen';
import { Coffee, Route } from 'lucide-react';

export default function PortlandTrailPage() {
  const [playerState, setPlayerState] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover' | 'won'>('intro');
  const [eventLog, setEventLog] = useState<string[]>([]);

  const waypointIndex = useMemo(() => {
    return Math.floor(playerState.progress / (100 / (TRAIL_WAYPOINTS.length - 1)));
  }, [playerState.progress]);

  const currentLocation = useMemo(() => {
    return TRAIL_WAYPOINTS[waypointIndex] || TRAIL_WAYPOINTS[TRAIL_WAYPOINTS.length - 1];
  }, [waypointIndex]);

  const addLog = (message: string) => {
    setEventLog(prev => [message, ...prev.slice(0, 4)]);
  };

  const startGame = useCallback(async () => {
    setIsLoading(true);
    setGameState('playing');
    setPlayerState(INITIAL_PLAYER_STATE);
    setEventLog(['Your journey begins in San Francisco. The road to Portland is long and fraught with peril (and artisanal cheese).']);
    const result = await getScenarioAction({ ...INITIAL_PLAYER_STATE, location: 'San Francisco' });
    if (result.error) {
      addLog(result.error);
    } else {
      setScenario(result as Scenario);
      addLog(`An event unfolds: ${result.scenario}`);
    }
    setIsLoading(false);
  }, []);

  const handleChoice = (choice: Choice) => {
    if (isLoading) return;

    setIsLoading(true);
    let tempState = { ...playerState };

    // Apply consequences
    const consequences = choice.consequences;
    tempState.stats.hunger = Math.max(0, tempState.stats.hunger + consequences.hunger);
    tempState.stats.style = Math.max(0, tempState.stats.style + consequences.style);
    tempState.stats.irony = Math.max(0, tempState.stats.irony + consequences.irony);
    tempState.stats.authenticity = Math.max(0, tempState.stats.authenticity + consequences.authenticity);
    tempState.resources.coffee = Math.max(0, tempState.resources.coffee + consequences.coffee);
    tempState.resources.vinyls += consequences.vinyls;
    tempState.progress = Math.min(100, tempState.progress + consequences.progress);
    tempState.location = currentLocation;

    setPlayerState(tempState);

    // Check for game over/win conditions
    if (tempState.stats.hunger <= 0) {
      setGameState('gameover');
      addLog('You have succumbed to hunger. Your journey ends.');
      setIsLoading(false);
      return;
    }
    if (tempState.progress >= 100) {
      setGameState('won');
      addLog('You have arrived in Portland! You are the epitome of cool.');
      setIsLoading(false);
      return;
    }

    // Fetch next scenario
    const getNextScenario = async () => {
      const result = await getScenarioAction(tempState);
      if (result.error) {
        addLog(result.error);
      } else {
        setScenario(result as Scenario);
        addLog(`A new event unfolds: ${result.scenario}`);
      }
      setIsLoading(false);
    };

    // Add a slight delay for suspense
    setTimeout(getNextScenario, 500);
  };

  if (gameState === 'intro') {
    return (
      <main className="min-h-screen bg-background text-foreground font-body p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <Card className="max-w-2xl text-center shadow-2xl border-2 border-foreground/20">
          <CardContent className="p-8">
            <Coffee className="mx-auto h-16 w-16 text-primary mb-4" />
            <h1 className="text-4xl font-headline font-bold mb-2">The Portland Trail</h1>
            <p className="text-muted-foreground mb-6">
              A perilous journey from the tech-bro territory of San Francisco to the hipster-haven of Portland. Manage your hunger, style, and irony to survive the trek. Can you make it without selling out?
            </p>
            <Button size="lg" onClick={startGame}>
              <Route className="mr-2 h-5 w-5" />
              Begin the Journey
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (gameState === 'gameover' || gameState === 'won') {
    return <GameOverScreen status={gameState} onRestart={startGame} finalState={playerState} />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto border-4 border-foreground/20 dark:border-foreground/40 shadow-2xl p-4 md:p-6 bg-card/80 rounded-lg backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <StatusDashboard playerState={playerState} />
            <Card>
              <CardContent className="p-4">
                 <h3 className="font-headline text-lg mb-2">Event Log</h3>
                 <div className="text-sm text-muted-foreground space-y-2">
                    {eventLog.map((log, i) => <p key={i} className="opacity-80 first:opacity-100">{log}</p>)}
                 </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <TrailMap progress={playerState.progress} waypoints={TRAIL_WAYPOINTS} currentLocation={currentLocation} />
            <ScenarioDisplay scenario={scenario} isLoading={isLoading} onChoice={handleChoice} />
          </div>
        </div>
      </div>
    </main>
  );
}
