'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { INITIAL_PLAYER_STATE, TRAIL_WAYPOINTS, HIPSTER_JOBS } from '@/lib/constants';
import type { PlayerState, Scenario, Choice, PlayerAction } from '@/lib/types';
import { getScenarioAction } from '@/app/actions';
import { generateAvatar } from '@/ai/flows/generate-avatar';
import { generateHipsterName } from '@/ai/flows/generate-hipster-name';
import StatusDashboard from '@/components/game/status-dashboard';
import TrailMap from '@/components/game/trail-map';
import ScenarioDisplay from '@/components/game/scenario-display';
import GameOverScreen from '@/components/game/game-over-screen';
import ActionsCard from '@/components/game/actions-card';
import { Coffee, Route, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function PortlandTrailPage() {
  const [playerState, setPlayerState] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover' | 'won'>('intro');
  const [eventLog, setEventLog] = useState<{ message: string; timestamp: Date }[]>([]);
  
  const [name, setName] = useState('');
  const [job, setJob] = useState(HIPSTER_JOBS[0]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const [isNameLoading, setIsNameLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const { toast } = useToast();

  const waypointIndex = useMemo(() => {
    return Math.floor(playerState.progress / (100 / (TRAIL_WAYPOINTS.length - 1)));
  }, [playerState.progress]);

  const currentLocation = useMemo(() => {
    return TRAIL_WAYPOINTS[waypointIndex] || TRAIL_WAYPOINTS[TRAIL_WAYPOINTS.length - 1];
  }, [waypointIndex]);

  const addLog = (message: string) => {
    setEventLog(prev => [{ message, timestamp: new Date() }, ...prev.slice(0, 4)]);
  };

  const handleGenerateName = useCallback(async () => {
    setIsNameLoading(true);
    try {
        const result = await generateHipsterName();
        setName(result.name);
    } catch (error) {
        console.error('Failed to generate name:', error);
        toast({
            variant: 'destructive',
            title: 'Name Generation Failed',
            description: 'Could not fetch a new name. Using a default.',
        });
        setName('Pip'); // A safe fallback
    } finally {
        setIsNameLoading(false);
    }
  }, [toast]);

  const handleGenerateAvatar = useCallback(async () => {
    setIsAvatarLoading(true);
    try {
      const result = await generateAvatar({ name: name || 'A nameless wanderer', job });
      setAvatarUrl(result.avatarDataUri);
    } catch (error) {
      console.error('Failed to generate avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Avatar Generation Failed',
        description: 'Could not create a new avatar. Using a default.',
      });
      setAvatarUrl('https://placehold.co/128x128.png');
    } finally {
      setIsAvatarLoading(false);
    }
  }, [name, job, toast]);

  useEffect(() => {
    if (gameState === 'intro' && !hasInitialized) {
      handleGenerateName();
      const randomJob = HIPSTER_JOBS[Math.floor(Math.random() * HIPSTER_JOBS.length)];
      setJob(randomJob);
      setHasInitialized(true);
    }
  }, [gameState, hasInitialized, handleGenerateName]);
  
  useEffect(() => {
    if (gameState === 'intro' && name) {
      handleGenerateAvatar();
    }
  }, [gameState, name, handleGenerateAvatar]);
  
  const startGame = useCallback(async () => {
    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'Name Required', description: 'Please enter a name for your character.' });
      return;
    }

    setIsLoading(true);
    
    const initialState: PlayerState = {
      ...INITIAL_PLAYER_STATE,
      name: name,
      job: job,
      avatar: avatarUrl,
    };
    
    setPlayerState(initialState);
    const initialLogMessage = `Your journey as ${name} the ${job} begins in San Francisco. The road to Portland is long and fraught with peril (and artisanal cheese).`;
    setEventLog([{ message: initialLogMessage, timestamp: new Date() }]);
    
    const result = await getScenarioAction({ ...initialState, location: 'San Francisco' });
    if (result.error) {
      addLog(result.error);
    } else {
      setScenario(result as Scenario);
      addLog(`An event unfolds: ${result.scenario}`);
    }
    setGameState('playing');
    setIsLoading(false);
  }, [name, job, avatarUrl, toast]);
  
  const restartGame = useCallback(() => {
    setGameState('intro');
    setPlayerState(INITIAL_PLAYER_STATE);
    setName('');
    setJob(HIPSTER_JOBS[0]);
    setHasInitialized(false);
  }, []);

  const advanceTurn = (tempState: PlayerState) => {
    // Check for game over/win conditions
    if (tempState.stats.hunger <= 0) {
      setGameState('gameover');
      addLog('You have succumbed to hunger. Your journey ends.');
      setIsLoading(false);
      return;
    }
    if (tempState.resources.bikeHealth <= 0) {
        setGameState('gameover');
        addLog('Your bike broke down, leaving you stranded. Your journey ends.');
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

  const handleAction = (action: PlayerAction) => {
    if (isLoading) return;

    if (playerState.resources.coffee + action.consequences.coffee < 0) {
        toast({
            variant: 'destructive',
            title: 'Not Enough Coffee',
            description: 'You need more coffee beans to perform this action.',
        });
        return;
    }

    setIsLoading(true);
    let tempState = { ...playerState };
    const consequences = action.consequences;

    // Apply consequences
    tempState.stats.hunger = Math.min(100, Math.max(0, tempState.stats.hunger + consequences.hunger));
    tempState.stats.style = Math.max(0, tempState.stats.style + consequences.style);
    tempState.stats.irony = Math.max(0, tempState.stats.irony + consequences.irony);
    tempState.stats.authenticity = Math.max(0, tempState.stats.authenticity + consequences.authenticity);
    tempState.resources.coffee = Math.max(0, tempState.resources.coffee + consequences.coffee);
    tempState.resources.vinyls = Math.max(0, tempState.resources.vinyls + consequences.vinyls);
    tempState.progress = Math.min(100, Math.max(0, tempState.progress + consequences.progress));
    tempState.resources.bikeHealth = Math.min(100, Math.max(0, tempState.resources.bikeHealth + consequences.bikeHealth));
    tempState.location = currentLocation;

    setPlayerState(tempState);
    addLog(`You chose to: ${action.text}.`);
    advanceTurn(tempState);
  };

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
    advanceTurn(tempState);
  };

  if (gameState === 'intro') {
    return (
      <main className="min-h-screen bg-background text-foreground font-body p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full text-center shadow-xl border">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Coffee className="mx-auto h-12 w-12 text-primary mb-2" />
              <h1 className="text-3xl font-headline font-bold">The Portland Trail</h1>
              <p className="text-muted-foreground">
                Craft your hipster persona and embark on a journey of survival and irony.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8 text-left">
              <div className="relative shrink-0">
                <Avatar className="h-32 w-32 border-4 border-primary/50 text-4xl">
                  <AvatarImage src={avatarUrl} alt="Your hipster avatar" />
                  <AvatarFallback>
                    {isAvatarLoading ? <Loader2 className="animate-spin" /> : (name?.charAt(0) || 'A')}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute bottom-0 -right-2 rounded-full h-10 w-10 border-2 border-background" 
                  onClick={handleGenerateAvatar} 
                  disabled={isAvatarLoading}
                  aria-label="Randomize Avatar"
                  >
                  {isAvatarLoading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                </Button>
              </div>

              <div className="space-y-4 flex-1 w-full">
                <div className="space-y-2">
                  <Label htmlFor="name">Hipster Name</Label>
                  <div className="flex items-center gap-2">
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., River, Kale, Britta" disabled={isNameLoading} />
                    <Button 
                      type="button"
                      size="icon" 
                      variant="secondary" 
                      onClick={() => handleGenerateName()}
                      disabled={isNameLoading}
                      aria-label="Randomize Name"
                      >
                      {isNameLoading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job">Calling</Label>
                  <Select value={job} onValueChange={setJob}>
                    <SelectTrigger id="job">
                      <SelectValue placeholder="Select a hipster profession" />
                    </SelectTrigger>
                    <SelectContent>
                      {HIPSTER_JOBS.map((j) => (
                        <SelectItem key={j} value={j}>{j}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button size="lg" onClick={startGame} disabled={isLoading || isAvatarLoading}>
              {(isLoading || isAvatarLoading) ? <Loader2 className="mr-2 animate-spin" /> : <Route className="mr-2 h-5 w-5" />}
              Begin the Journey
            </Button>
            <Link href="/help" passHref>
                <Button variant="link" className="text-muted-foreground mt-2">How to Play</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (gameState === 'gameover' || gameState === 'won') {
    return <GameOverScreen status={gameState} onRestart={restartGame} finalState={playerState} />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto border-2 shadow-xl p-4 md:p-6 bg-card/80 rounded-lg backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <StatusDashboard playerState={playerState} />
            <ActionsCard onAction={handleAction} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <TrailMap progress={playerState.progress} waypoints={TRAIL_WAYPOINTS} currentLocation={currentLocation} />
            <ScenarioDisplay scenario={scenario} isLoading={isLoading} onChoice={handleChoice} />
            <Card>
              <CardContent className="p-4">
                 <h3 className="font-headline text-lg mb-2">Travel Diary</h3>
                 <div className="text-sm text-muted-foreground space-y-2">
                    {eventLog.map((log, i) => (
                      <div key={i} className="flex items-start gap-2 opacity-80 first:opacity-100">
                        <p className="text-primary/70 font-mono text-xs pt-0.5 whitespace-nowrap">
                          [{log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
                        </p>
                        <p>{log.message}</p>
                      </div>
                    ))}
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
