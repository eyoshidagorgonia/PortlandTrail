
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { INITIAL_PLAYER_STATE, TRAIL_WAYPOINTS, HIPSTER_JOBS, BUILD_NUMBER, getIronicHealthStatus, SERVICE_DISPLAY_NAMES } from '@/lib/constants';
import type { PlayerState, Scenario, Choice, PlayerAction, SystemStatus } from '@/lib/types';
import { getScenarioAction } from '@/app/actions';
import { generateHipsterName } from '@/ai/flows/generate-hipster-name';
import { generateCharacterBio } from '@/ai/flows/generate-character-bio';
import StatusDashboard from '@/components/game/status-dashboard';
import TrailMap from '@/components/game/trail-map';
import ScenarioDisplay from '@/components/game/scenario-display';
import GameOverScreen from '@/components/game/game-over-screen';
import ActionsCard from '@/components/game/actions-card';
import { Coffee, Route, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const INITIAL_SYSTEM_STATUS: SystemStatus = {
    healthyServices: new Set(),
    primaryDegradedServices: new Set(),
    fullyOfflineServices: new Set(),
};

export default function PortlandTrailPage() {
  const [playerState, setPlayerState] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover' | 'won'>('intro');
  const [eventLog, setEventLog] = useState<{ message: string; timestamp: Date }[]>([]);
  
  const [name, setName] = useState('');
  const [job, setJob] = useState('');
  const [avatarKaomoji, setAvatarKaomoji] = useState('(-_-)');
  const [bio, setBio] = useState('');
  const [isNameLoading, setIsNameLoading] = useState(true);
  const [isBioLoading, setIsBioLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(INITIAL_SYSTEM_STATUS);

  const { toast } = useToast();

  const updateSystemStatus = useCallback((sources: Record<string, 'primary' | 'fallback' | 'hardcoded'>) => {
    let showDegradedToast = false;
    let showOfflineToast = false;

    setSystemStatus(prevStatus => {
        const newStatus: SystemStatus = {
            healthyServices: new Set(prevStatus.healthyServices),
            primaryDegradedServices: new Set(prevStatus.primaryDegradedServices),
            fullyOfflineServices: new Set(prevStatus.fullyOfflineServices),
        };

        for (const [service, source] of Object.entries(sources)) {
            const serviceName = SERVICE_DISPLAY_NAMES[service] || service;
            // Remove from all sets first to handle status changes
            newStatus.healthyServices.delete(serviceName);
            newStatus.primaryDegradedServices.delete(serviceName);
            newStatus.fullyOfflineServices.delete(serviceName);

            if (source === 'primary') {
                newStatus.healthyServices.add(serviceName);
            } else if (source === 'fallback') {
                newStatus.primaryDegradedServices.add(serviceName);
                if (!prevStatus.primaryDegradedServices.has(serviceName) && !prevStatus.fullyOfflineServices.has(serviceName)) {
                    showDegradedToast = true;
                }
            } else if (source === 'hardcoded') {
                newStatus.fullyOfflineServices.add(serviceName);
                 if (!prevStatus.fullyOfflineServices.has(serviceName)) {
                    showOfflineToast = true;
                }
            }
        }
        
        // Persist to local storage for other pages
        localStorage.setItem('healthyServices', JSON.stringify(Array.from(newStatus.healthyServices)));
        localStorage.setItem('primaryDegradedServices', JSON.stringify(Array.from(newStatus.primaryDegradedServices)));
        localStorage.setItem('fullyOfflineServices', JSON.stringify(Array.from(newStatus.fullyOfflineServices)));
        
        return newStatus;
    });

    if (showOfflineToast) {
        toast({
            variant: 'destructive',
            title: 'An AI System is Offline',
            description: "Using hardcoded data. The experience will be less dynamic.",
        });
    } else if (showDegradedToast) {
        toast({
            variant: 'destructive',
            title: 'An AI System is Degraded',
            description: "Using fallback AI. You may notice differences.",
        });
    }
  }, [toast]);

  const waypointIndex = useMemo(() => {
    return Math.floor(playerState.progress / (100 / (TRAIL_WAYPOINTS.length - 1)));
  }, [playerState.progress]);

  const currentLocation = useMemo(() => {
    return TRAIL_WAYPOINTS[waypointIndex] || TRAIL_WAYPOINTS[TRAIL_WAYPOINTS.length - 1];
  }, [waypointIndex]);
  
  const currentVibe = useMemo(() => {
    const normalizedHealth =
      ((playerState.stats.hunger / 100) +
        (playerState.resources.bikeHealth / 100) +
        (playerState.stats.style / 200) +
        (playerState.stats.irony / 200) +
        (playerState.stats.authenticity / 200)) /
      5 * 100;
      return getIronicHealthStatus(normalizedHealth).text;
  }, [playerState.stats, playerState.resources]);


  const addLog = useCallback((message: string) => {
    setEventLog(prev => [{ message, timestamp: new Date() }, ...prev.slice(0, 4)]);
  }, []);

  const handleGenerateName = useCallback(async () => {
    setIsNameLoading(true);
    const result = await generateHipsterName();
    if (result.name) {
        setName(result.name);
    }
    updateSystemStatus({ name: result.dataSource });
    setIsNameLoading(false);
  }, [updateSystemStatus]);

  const handleGenerateBio = useCallback(async (vibe: string) => {
     if (!name || !job) return;
    setIsBioLoading(true);
    const result = await generateCharacterBio({ name, job, vibe });
    setBio(result.bio);
    updateSystemStatus({ bio: result.dataSource });
    setIsBioLoading(false);
  }, [name, job, updateSystemStatus]);

  useEffect(() => {
    if (gameState === 'intro' && !hasInitialized) {
      handleGenerateName();
      const randomJob = HIPSTER_JOBS[Math.floor(Math.random() * HIPSTER_JOBS.length)];
      setJob(randomJob);
      setHasInitialized(true);
    }
  }, [gameState, hasInitialized, handleGenerateName]);
  
  useEffect(() => {
    if (gameState === 'intro' && !job) {
       const randomJob = HIPSTER_JOBS[Math.floor(Math.random() * HIPSTER_JOBS.length)];
       setJob(randomJob);
    }
  }, [gameState, job]);
  
  useEffect(() => {
    if (gameState === 'intro' && name && job) {
      handleGenerateBio("Just starting out");
    }
  }, [gameState, name, job, handleGenerateBio]);

  // Regenerate bio when vibe changes
  useEffect(() => {
    if(gameState === 'playing') {
      const newVibe = currentVibe;
      if (newVibe !== playerState.vibe) {
        generateCharacterBio({name: playerState.name, job: playerState.job, vibe: newVibe}).then(result => {
           setPlayerState(prevState => ({...prevState, bio: result.bio, vibe: newVibe }));
           updateSystemStatus({ bio: result.dataSource });
        });
      }
    }
  }, [currentVibe, gameState, playerState.name, playerState.job, playerState.vibe, updateSystemStatus]);
  
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
      avatar: avatarKaomoji,
      bio: bio,
      vibe: "Just starting out",
    };
    
    const result = await getScenarioAction({ ...initialState, location: 'San Francisco' });
    if ('error' in result && result.error) {
      toast({
        variant: 'destructive',
        title: 'A Rocky Start',
        description: `Could not start the journey. ${result.error}`,
      });
      setIsLoading(false);
      return;
    }
    
    const scenarioResult = result as Scenario;
    
    // The first scenario call also generates the initial avatar
    setPlayerState({...initialState, avatar: scenarioResult.playerAvatar || avatarKaomoji });
    setAvatarKaomoji(scenarioResult.playerAvatar || avatarKaomoji);
    
    const initialLogMessage = `Your journey as ${name} the ${job} begins in San Francisco. The road to Portland is long and fraught with peril (and artisanal cheese).`;
    setEventLog([{ message: initialLogMessage, timestamp: new Date() }]);
    
    setScenario(scenarioResult);
    addLog(`An event unfolds: ${scenarioResult.scenario}`);
    if (scenarioResult.dataSources) {
        updateSystemStatus(scenarioResult.dataSources);
    }

    setGameState('playing');
    setIsLoading(false);
  }, [name, job, avatarKaomoji, bio, toast, addLog, updateSystemStatus]);
  
  const restartGame = useCallback(() => {
    setGameState('intro');
    setPlayerState(INITIAL_PLAYER_STATE);
    setName('');
    setBio('');
    setJob('');
    setHasInitialized(false);
    setSystemStatus(INITIAL_SYSTEM_STATUS);
    localStorage.removeItem('healthyServices');
    localStorage.removeItem('primaryDegradedServices');
    localStorage.removeItem('fullyOfflineServices');
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
      if ('error' in result && result.error) {
        addLog(result.error);
        toast({
            variant: "destructive",
            title: "The Trail Went Cold",
            description: "We couldn't generate the next event. Try taking a different action."
        });
      } else {
        const scenarioResult = result as Scenario;
        setScenario(scenarioResult);
        addLog(`A new event unfolds: ${scenarioResult.scenario}`);
        if (scenarioResult.dataSources) {
            updateSystemStatus(scenarioResult.dataSources);
        }
        // Update player avatar with the new one from the scenario
        if(scenarioResult.playerAvatar) {
            setPlayerState(prevState => ({...prevState, avatar: scenarioResult.playerAvatar! }));
        }
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

  const handleChoice = async (choice: Choice) => {
    if (isLoading || !scenario) return;

    setIsLoading(true);
    let tempState = { ...playerState };

    if (choice.text === 'GO FOR BROKE' && choice.consequences.badge) {
        const gamble = Math.random();
        if (gamble < 0.2) { // 20% chance of winning
            addLog('You went for broke and it paid off spectacularly!');
            const newBadge = {
                description: `Uber-Rare: ${choice.consequences.badge.description}`,
                emoji: `✨${choice.consequences.badge.emoji}✨`,
                isUber: true,
            };
            tempState.resources.badges = [...tempState.resources.badges, newBadge];
            tempState.stats.style += 20; // A nice bonus
        } else { // 80% chance of failure
            addLog('You went for broke and got broken. A significant, but not devastating, failure.');
            tempState.stats.hunger = Math.max(0, tempState.stats.hunger - 10);
            tempState.resources.bikeHealth = Math.max(0, tempState.resources.bikeHealth - 15);
            tempState.stats.style = Math.max(0, tempState.stats.style - 5);
        }
    } else {
        // Apply normal consequences
        const consequences = choice.consequences;
        tempState.stats.hunger = Math.max(0, tempState.stats.hunger + consequences.hunger);
        tempState.stats.style = Math.max(0, tempState.stats.style + consequences.style);
        tempState.stats.irony = Math.max(0, tempState.stats.irony + consequences.irony);
        tempState.stats.authenticity = Math.max(0, tempState.stats.authenticity + consequences.authenticity);
        tempState.resources.coffee = Math.max(0, tempState.resources.coffee + consequences.coffee);
        tempState.resources.vinyls += consequences.vinyls;
        tempState.progress = Math.min(100, tempState.progress + consequences.progress);
        tempState.resources.bikeHealth = Math.min(100, Math.max(0, tempState.resources.bikeHealth + consequences.bikeHealth));
        
        if (consequences.badge) {
            tempState.resources.badges = [...tempState.resources.badges, consequences.badge];
            addLog(`You earned a badge: "${consequences.badge.description}"!`);
        }
    }

    tempState.location = currentLocation;

    setPlayerState(tempState);
    advanceTurn(tempState);
  };
  
  const StatusIcons = () => {
    return (
        <div className="flex items-center gap-2">
            <TooltipProvider>
                {systemStatus.fullyOfflineServices.size > 0 && (
                    <Tooltip>
                        <TooltipTrigger>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </TooltipTrigger>
                        <TooltipContent>
                             <div className="space-y-1 text-center">
                                <p className="font-bold">AI Systems Offline</p>
                                <p className="text-xs text-muted-foreground">Using hardcoded data for:</p>
                                <ul className="list-disc list-inside text-xs">
                                    {Array.from(systemStatus.fullyOfflineServices).map(s => <li key={s}>{s}</li>)}
                                </ul>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                )}
            </TooltipProvider>
        </div>
    )
  }

  if (gameState === 'intro') {
    return (
      <main className="min-h-screen bg-background text-foreground font-body p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full text-center shadow-xl border relative">
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
                  <AvatarImage src="" alt="Your hipster avatar" />
                  <AvatarFallback className="text-4xl p-2 bg-muted">
                    {avatarKaomoji}
                  </AvatarFallback>
                </Avatar>
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

            <Button size="lg" onClick={startGame} disabled={isLoading || isBioLoading || !job}>
              {(isLoading || isBioLoading) ? <Loader2 className="mr-2 animate-spin" /> : <Route className="mr-2 h-5 w-5" />}
              Begin the Journey
            </Button>
            <Link href="/help" passHref>
                <Button variant="link" className="text-muted-foreground mt-2">How to Play</Button>
            </Link>
          </CardContent>
           <div className="absolute bottom-2 right-3 text-xs text-muted-foreground/50 font-mono flex items-center gap-2">
                <StatusIcons />
                <span>Build: {BUILD_NUMBER.toFixed(3)}</span>
            </div>
        </Card>
      </main>
    );
  }

  if (gameState === 'gameover' || gameState === 'won') {
    return <GameOverScreen status={gameState} onRestart={restartGame} finalState={playerState} systemStatus={systemStatus} />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body p-4 sm:p-6 lg:p-8 relative">
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
      <div className="absolute bottom-2 right-3 text-xs text-muted-foreground/50 font-mono flex items-center gap-2">
        <StatusIcons />
        <span>Build: {BUILD_NUMBER.toFixed(3)}</span>
      </div>
    </main>
  );
}
