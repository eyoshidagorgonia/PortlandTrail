
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { INITIAL_PLAYER_STATE, TRAIL_WAYPOINTS, HIPSTER_JOBS, BUILD_NUMBER, getIronicHealthStatus, SERVICE_DISPLAY_NAMES } from '@/lib/constants';
import type { PlayerState, Scenario, Choice, PlayerAction, SystemStatus, Badge, TrailEvent } from '@/lib/types';
import { getScenarioAction, getImagesAction } from '@/app/actions';
import { generateHipsterName } from '@/ai/flows/generate-hipster-name';
import { generateCharacterBio } from '@/ai/flows/generate-character-bio';
import StatusDashboard from '@/components/game/status-dashboard';
import ScenarioDisplay from '@/components/game/scenario-display';
import GameOverScreen from '@/components/game/game-over-screen';
import ActionsCard from '@/components/game/actions-card';
import { Coffee, Route, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { PennyFarthingIcon } from '@/components/game/icons';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import TrailMap from '@/components/game/trail-map';

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
  const [eventLog, setEventLog] = useState<TrailEvent[]>([]);
  
  const [name, setName] = useState('');
  const [job, setJob] = useState('');
  const [avatarKaomoji, setAvatarKaomoji] = useState('(-_-)');
  const [bio, setBio] = useState('');
  const [isNameLoading, setIsNameLoading] = useState(true);
  const [isBioLoading, setIsBioLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(INITIAL_SYSTEM_STATUS);

  // Image states
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [avatarImage, setAvatarImage] = useState<string>('');
  const [sceneImage, setSceneImage] = useState<string>('');
  const [badgeImage, setBadgeImage] = useState<string | null>(null);

  // Intro-specific image state
  const [introAvatarImage, setIntroAvatarImage] = useState<string>('');
  const [isIntroAvatarLoading, setIsIntroAvatarLoading] = useState(false);

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
      return getIronicHealthStatus(playerState.stats.health).text;
  }, [playerState.stats.health]);


  const addLog = useCallback((message: string, progress: number) => {
    setEventLog(prev => [{ description: message, progress, timestamp: new Date() }, ...prev.slice(0, 49)]);
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
  
  const generateIntroAvatar = useCallback(async () => {
    if (!name || !job) return;
    setIsIntroAvatarLoading(true);

    const imageInput = {
      scenarioDescription: `A beautiful, painterly, nostalgic, Studio Ghibli anime style portrait of a hipster named ${name}, who is a ${job}.`,
      character: { name, job, vibe: "Just starting out", avatarKaomoji },
    };

    const imageResult = await getImagesAction(imageInput);

    if ('error' in imageResult) {
      toast({ variant: 'destructive', title: 'Image Generation Failed', description: imageResult.error });
      setIntroAvatarImage(''); // Clear image on failure
    } else {
      setIntroAvatarImage(imageResult.avatarImage);
      if (imageResult.dataSource) {
        updateSystemStatus({ image: imageResult.dataSource });
      }
    }
    setIsIntroAvatarLoading(false);
  }, [name, job, avatarKaomoji, toast, updateSystemStatus]);

  useEffect(() => {
    if (gameState === 'intro' && !hasInitialized) {
      handleGenerateName();
      const randomJob = HIPSTER_JOBS[Math.floor(Math.random() * HIPSTER_JOBS.length)];
      setJob(randomJob);
      setHasInitialized(true);
    }
  }, [gameState, hasInitialized, handleGenerateName]);

  useEffect(() => {
    if (gameState === 'intro' && name && job) {
      handleGenerateBio("Just starting out");
    }
  }, [gameState, name, job, handleGenerateBio]);
  
  // This useEffect now handles initial load AND job changes for the avatar.
  useEffect(() => {
    if (gameState === 'intro' && name && job) {
        generateIntroAvatar();
    }
  }, [name, job, gameState, generateIntroAvatar]);

  // Regenerate bio when vibe changes during gameplay
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
  }, [currentVibe, gameState, playerState.name, playerState.job, playerState.vibe, updateSystemStatus, handleGenerateBio]);
  
  const startGame = useCallback(async () => {
    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'Name Required', description: 'Please enter a name for your character.' });
      return;
    }

    setIsLoading(true);
    
    const initialEvents: TrailEvent[] = [{ progress: 0, description: "Your journey begins in San Francisco.", timestamp: new Date() }];
    
    const initialState: PlayerState = {
      ...INITIAL_PLAYER_STATE,
      name: name,
      job: job,
      avatar: avatarKaomoji,
      bio: bio,
      vibe: "Just starting out",
      events: initialEvents,
    };
    
    setPlayerState(initialState);
    setAvatarImage(introAvatarImage); // Carry over the avatar from the intro screen
    
    const result = await getScenarioAction({ ...initialState, location: 'San Francisco' });
    if ('error' in result && result.error) {
      toast({
        variant: 'destructive',
        title: 'A Rocky Start',
        description: result.error,
      });
      setIsLoading(false);
      return;
    }
    
    const scenarioResult = result as Scenario;
    
    setPlayerState(prev => ({...prev, avatar: scenarioResult.playerAvatar || avatarKaomoji }));
    setAvatarKaomoji(scenarioResult.playerAvatar || avatarKaomoji);
    
    const initialLogMessage = `Your journey as ${name} the ${job} begins in San Francisco. The road to Portland is long and fraught with peril (and artisanal cheese).`;
    setEventLog(initialEvents);
    addLog(initialLogMessage, 0);
    
    setScenario(scenarioResult);
    addLog(`An event unfolds: ${scenarioResult.scenario}`, 0);
    if (scenarioResult.dataSources) {
        updateSystemStatus(scenarioResult.dataSources);
    }
    
    setGameState('playing');
    setIsLoading(false);

    // Fetch images for the first scenario
    // We pass the *full* new player state, including the potentially new kaomoji
    fetchImages(scenarioResult, {...initialState, avatar: scenarioResult.playerAvatar || avatarKaomoji });

  }, [name, job, avatarKaomoji, bio, toast, addLog, updateSystemStatus, introAvatarImage]);
  
  const restartGame = useCallback(() => {
    setGameState('intro');
    setPlayerState(INITIAL_PLAYER_STATE);
    setName('');
    setBio('');
    setJob('');
    setHasInitialized(false);
    setSystemStatus(INITIAL_SYSTEM_STATUS);
    setSceneImage('');
    setAvatarImage('');
    setIntroAvatarImage('');
    setBadgeImage(null);
    localStorage.removeItem('healthyServices');
    localStorage.removeItem('primaryDegradedServices');
    localStorage.removeItem('fullyOfflineServices');
  }, []);

  const fetchImages = async (currentScenario: Scenario, currentPlayerState: PlayerState) => {
    setIsImageLoading(true);
    setSceneImage('');
    setBadgeImage(null);

    const imageInput = {
      // The avatar is no longer regenerated here, so we only need scene and badge info.
      scenarioDescription: currentScenario.scenario,
      character: {
        name: currentPlayerState.name,
        job: currentPlayerState.job,
        vibe: currentPlayerState.vibe,
        avatarKaomoji: currentPlayerState.avatar,
      },
      badge: currentScenario.badge ? { description: currentScenario.badge.description, emoji: currentScenario.badge.emoji } : undefined,
    };

    const imageResult = await getImagesAction(imageInput);

    if ('error' in imageResult) {
      toast({ variant: 'destructive', title: 'Image Generation Failed', description: imageResult.error });
    } else {
      // Only update scene and badge images. Avatar remains the same.
      setSceneImage(imageResult.sceneImage);
      if (imageResult.badgeImage) {
        setBadgeImage(imageResult.badgeImage);
      }
       if (imageResult.dataSource) {
        updateSystemStatus({ image: imageResult.dataSource });
      }
    }
    setIsImageLoading(false);
  };

  const advanceTurn = (tempState: PlayerState) => {
    if (tempState.stats.health <= 0) {
      setGameState('gameover');
      addLog('You have succumbed to poor health. Your journey ends.', tempState.progress);
      setIsLoading(false);
      return;
    }
    if (tempState.resources.stamina <= 0) {
        setGameState('gameover');
        addLog('Your bike broke down, leaving you stranded. Your journey ends.', tempState.progress);
        setIsLoading(false);
        return;
    }
    if (tempState.progress >= 100) {
      setGameState('won');
      addLog('You have arrived in Portland! You are the epitome of cool.', 100);
      setIsLoading(false);
      return;
    }

    const getNextScenario = async () => {
      const result = await getScenarioAction(tempState);
      setIsLoading(false);
      if ('error' in result && result.error) {
        addLog(result.error, tempState.progress);
        toast({
            variant: "destructive",
            title: "The Trail Went Cold",
            description: result.error,
        });
      } else {
        const scenarioResult = result as Scenario;
        setScenario(scenarioResult);
        addLog(`A new event unfolds: ${scenarioResult.scenario}`, tempState.progress);
        if (scenarioResult.dataSources) {
            updateSystemStatus(scenarioResult.dataSources);
        }
        
        const newPlayerState = {...tempState, avatar: scenarioResult.playerAvatar!};
        setPlayerState(newPlayerState);

        fetchImages(scenarioResult, newPlayerState);
      }
    };

    setTimeout(getNextScenario, 500);
  };

  const handleAction = (action: PlayerAction) => {
    if (isLoading || isImageLoading) return;

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

    tempState.stats.health = Math.min(100, Math.max(0, tempState.stats.health + consequences.health));
    tempState.stats.style = Math.max(0, tempState.stats.style + consequences.style);
    tempState.stats.irony = Math.max(0, tempState.stats.irony + consequences.irony);
    tempState.stats.authenticity = Math.max(0, tempState.stats.authenticity + consequences.authenticity);
    tempState.stats.vibes = Math.min(100, Math.max(0, tempState.stats.vibes + consequences.vibes));
    tempState.resources.coffee = Math.max(0, tempState.resources.coffee + consequences.coffee);
    tempState.resources.vinyls = Math.max(0, tempState.resources.vinyls + consequences.vinyls);
    tempState.progress = Math.min(100, Math.max(0, tempState.progress + consequences.progress));
    tempState.resources.stamina = Math.min(100, Math.max(0, tempState.resources.stamina + consequences.stamina));
    tempState.location = currentLocation;

    const newEvent: TrailEvent = {
        progress: tempState.progress,
        description: `You chose to: ${action.text}.`,
        timestamp: new Date()
    };
    tempState.events = [newEvent, ...tempState.events];

    setPlayerState(tempState);
    addLog(`You chose to: ${action.text}.`, tempState.progress);
    advanceTurn(tempState);
  };

  const handleChoice = async (choice: Choice) => {
    if (isLoading || isImageLoading) return;

    setIsLoading(true);
    let tempState = { ...playerState };

    const consequences = choice.consequences;
    tempState.stats.health = Math.max(0, tempState.stats.health + consequences.health);
    tempState.stats.style = Math.max(0, tempState.stats.style + consequences.style);
    tempState.stats.irony = Math.max(0, tempState.stats.irony + consequences.irony);
    tempState.stats.authenticity = Math.max(0, tempState.stats.authenticity + consequences.authenticity);
    tempState.stats.vibes = Math.min(100, Math.max(0, tempState.stats.vibes + consequences.vibes));
    tempState.resources.coffee = Math.max(0, tempState.resources.coffee + consequences.coffee);
    tempState.resources.vinyls += consequences.vinyls;
    tempState.progress = Math.min(100, tempState.progress + consequences.progress);
    tempState.resources.stamina = Math.min(100, Math.max(0, tempState.resources.stamina + consequences.stamina));
    
    const potentialBadge = (consequences as any).badge;
    if (potentialBadge) {
        const newBadge: Badge = { 
            description: potentialBadge.badgeDescription,
            emoji: potentialBadge.badgeEmoji,
            isUber: potentialBadge.isUber || false,
            // The badge image is now associated here.
            image: badgeImage || undefined,
         };
        tempState.resources.badges = [...tempState.resources.badges, newBadge];
        addLog(`You earned a badge: "${newBadge.description}"!`, tempState.progress);
    }
    
    tempState.location = currentLocation;

    // Add a trail event for the choice made
    const newEvent: TrailEvent = {
        progress: tempState.progress,
        description: `You chose to "${choice.text}".`,
        timestamp: new Date()
    };
    tempState.events = [newEvent, ...tempState.events];

    setPlayerState(tempState);
    addLog(`You chose to "${choice.text}".`, tempState.progress);
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
    const isAnythingLoading = isLoading || isNameLoading || isBioLoading || isIntroAvatarLoading;
    return (
      <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full text-center shadow-2xl relative bg-card/80 backdrop-blur-sm border-2 border-border/20">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-6xl font-headline font-bold text-primary">The Portland Trail</h1>
              <p className="text-muted-foreground font-body text-xl">
                A cursed journey of survival and irony.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8 text-left pt-4">
              <div className="relative shrink-0">
                <Avatar className="h-40 w-40 border-4 border-secondary/50 text-5xl font-headline rounded-full">
                  {isIntroAvatarLoading || !introAvatarImage ? (
                    <Skeleton className="h-full w-full rounded-full" />
                  ) : (
                    <AvatarImage src={introAvatarImage} alt={name} className="rounded-full" data-ai-hint="avatar portrait" />
                  )}
                   <AvatarFallback className="rounded-full">{name.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-4 flex-1 w-full">
                <div className="space-y-2">
                  <Label htmlFor="name" className='font-headline text-xl'>HIPSTER NAME</Label>
                  <div className="flex items-center gap-2">
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Rune, Thorne, Lux" disabled={isNameLoading} className="text-lg" />
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
                  <Label htmlFor="job" className='font-headline text-xl'>WHAT YOU DO IN BETWEEN GIGS</Label>
                  <Select value={job} onValueChange={setJob}>
                    <SelectTrigger id="job" className="text-lg">
                      <SelectValue placeholder="Select a dark profession" />
                    </SelectTrigger>
                    <SelectContent>
                      {HIPSTER_JOBS.map((j) => (
                        <SelectItem key={j} value={j} className="text-base">{j}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button size="lg" onClick={startGame} disabled={isAnythingLoading || !job || !name || !bio} className="font-headline text-2xl mt-4">
                <PennyFarthingIcon className="mr-2 h-5 w-5" isloading={String(isAnythingLoading)} />
                Begin Your Descent
            </Button>
            <Link href="/help" passHref>
                <Button variant="link" className="text-muted-foreground mt-2">Whisper to the Vibe Sage</Button>
            </Link>
          </CardContent>
           <div className="absolute bottom-2 right-3 text-xs text-muted-foreground/50 font-code flex items-center gap-2">
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
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          <div className="lg:col-span-1 flex flex-col gap-6 opacity-0 animate-fade-in animate-delay-100">
            <StatusDashboard playerState={playerState} avatarImage={avatarImage} isImageLoading={isImageLoading} />
            <ActionsCard onAction={handleAction} isLoading={isLoading || isImageLoading} />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="opacity-0 animate-fade-in animate-delay-200">
                <ScenarioDisplay scenario={scenario} isLoading={isLoading} isImageLoading={isImageLoading} sceneImage={sceneImage} onChoice={handleChoice} />
            </div>
            <div className="opacity-0 animate-fade-in animate-delay-300">
                <Card className="bg-card/90 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                    <CardContent className="p-0">
                        <h3 className="font-headline text-2xl tracking-wider mb-2 text-center text-muted-foreground">Travel Diary</h3>
                        <div className="text-base text-foreground/80 space-y-3 font-body max-h-96 overflow-y-auto pr-2 border-t border-border/50 pt-3">
                            {eventLog.map((log, i) => (
                            <div key={i} className="flex items-start gap-3 opacity-80 first:opacity-100">
                                <p className="text-primary/70 text-sm pt-0.5 whitespace-nowrap">
                                [{log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
                                </p>
                                <p>{log.description}</p>
                            </div>
                            ))}
                        </div>
                    </CardContent>
                    </CardHeader>
                </Card>
            </div>
          </div>

        </div>
      </div>
      <div className="absolute bottom-2 right-3 text-xs text-muted-foreground/50 font-code flex items-center gap-2">
        <StatusIcons />
        <span>Build: {BUILD_NUMBER.toFixed(3)}</span>
      </div>
    </main>
  );
}
