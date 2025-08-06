
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { INITIAL_PLAYER_STATE, TRAIL_WAYPOINTS, HIPSTER_JOBS, BUILD_NUMBER, getIronicHealthStatus, SERVICE_DISPLAY_NAMES, IRONIC_TAGLINES } from '@/lib/constants';
import type { PlayerState, Scenario, Choice, PlayerAction, SystemStatus, Badge, TrailEvent, LootItem, Equipment, EquipmentSlot } from '@/lib/types';
import { getScenarioAction, getImagesAction, getLootAction } from '@/app/actions';
import { generateHipsterName } from '@/ai/flows/generate-hipster-name';
import { generateCharacterMood } from '@/ai/flows/generate-character-mood';
import StatusDashboard from '@/components/game/status-dashboard';
import ScenarioDisplay from '@/components/game/scenario-display';
import GameOverScreen from '@/components/game/game-over-screen';
import ActionsCard from '@/components/game/actions-card';
import OutcomeModal from '@/components/game/outcome-modal';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { PennyFarthingIcon, ConjuringIcon } from '@/components/game/icons';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import TrailMap from '@/components/game/trail-map';
import { cn } from '@/lib/utils';
import { calculateStats } from '@/lib/utils';

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
  const [mood, setMood] = useState('');
  const [isNameLoading, setIsNameLoading] = useState(true);
  const [isMoodLoading, setIsMoodLoading] = useState(true);
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
  const [isAvatarRendered, setIsAvatarRendered] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  // Outcome modal state
  const [lastChoice, setLastChoice] = useState<Choice | null>(null);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [lastLoot, setLastLoot] = useState<LootItem[]>([]);

  const [randomTagline, setRandomTagline] = useState('');

  const { toast } = useToast();

  const updateSystemStatus = useCallback((sources: Record<string, 'primary' | 'hardcoded'>) => {
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
    const { id: toastId } = toast({ title: 'Conjuring Name...', description: 'The AI is brewing a quirky moniker.' });
    try {
        const result = await generateHipsterName();
        setName(result.name);
        updateSystemStatus({ name: result.dataSource });
        toast({ id: toastId, title: 'Name Conjured!', description: 'Your new identity awaits.' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({ id: toastId, variant: 'destructive', title: 'Name Generation Failed', description: errorMessage });
    } finally {
        setIsNameLoading(false);
    }
  }, [updateSystemStatus, toast]);

  const handleGenerateMood = useCallback(async (state: PlayerState) => {
     if (!state.name || !state.job) return;
    setIsMoodLoading(true);
    const { id: toastId } = toast({ title: 'Reading the Aura...', description: 'The Vibe Sage is assessing your current mood.' });
    try {
        const result = await generateCharacterMood({ 
            name: state.name, 
            job: state.job, 
            stats: state.stats,
            resources: state.resources,
            progress: state.progress,
        });
        setPlayerState(prev => ({...prev, mood: result.mood, vibe: currentVibe }));
        updateSystemStatus({ mood: result.dataSource });
        toast({ id: toastId, title: 'Aura Read!', description: 'Your mood has been updated.' });
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({ id: toastId, variant: 'destructive', title: 'Aura Reading Failed', description: errorMessage });
    } finally {
        setIsMoodLoading(false);
    }
  }, [updateSystemStatus, toast, currentVibe]);
  
  const generateIntroAvatar = useCallback(async () => {
    if (!name || !job) return;
    setIsIntroAvatarLoading(true);
    setIsAvatarRendered(false);
    const { id: toastId } = toast({ title: 'Conjuring Avatar...', description: 'Capturing your artisanal essence in pixels.' });
    
    const imageInput = {
      scenarioDescription: `A beautiful, painterly, nostalgic, Studio Ghibli anime style portrait of a hipster named ${name}, who is a ${job}.`,
      character: { name, job, vibe: "Just starting out", avatarKaomoji },
    };
    
    try {
        const imageResult = await getImagesAction(imageInput);
        if ('error' in imageResult) {
            toast({ id: toastId, variant: 'destructive', title: 'Image Generation Failed', description: imageResult.error });
            setIntroAvatarImage('');
        } else {
            setIntroAvatarImage(imageResult.avatarImage);
            if (imageResult.dataSource) {
                updateSystemStatus({ image: imageResult.dataSource });
            }
            toast({ id: toastId, title: 'Avatar Conjured', description: 'Your essence has been captured.' });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({ id: toastId, variant: 'destructive', title: 'Image Generation Failed', description: errorMessage });
        setIntroAvatarImage('');
    } finally {
        setIsIntroAvatarLoading(false);
    }
  }, [name, job, avatarKaomoji, toast, updateSystemStatus]);

  useEffect(() => {
    setRandomTagline(IRONIC_TAGLINES[Math.floor(Math.random() * IRONIC_TAGLINES.length)]);
    if (gameState === 'intro' && !hasInitialized) {
      handleGenerateName();
      const randomJob = HIPSTER_JOBS[Math.floor(Math.random() * HIPSTER_JOBS.length)];
      setJob(randomJob);
      setHasInitialized(true);
    }
  }, [gameState, hasInitialized, handleGenerateName]);

  useEffect(() => {
    if (gameState === 'intro' && name && job && !mood) {
      handleGenerateMood({...INITIAL_PLAYER_STATE, name, job });
    }
  }, [gameState, name, job, mood, handleGenerateMood]);
  
  // This useEffect now handles initial load AND job changes for the avatar.
  useEffect(() => {
    if (gameState === 'intro' && name && job) {
        generateIntroAvatar();
    }
  }, [name, job, gameState, generateIntroAvatar]);

  // Countdown timer effect
  useEffect(() => {
    if (gameState === 'intro' && isAvatarRendered) {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }
  }, [gameState, countdown, isAvatarRendered]);

  // Regenerate mood when vibe changes during gameplay
  useEffect(() => {
    if(gameState === 'playing') {
      const newVibe = currentVibe;
      if (newVibe !== playerState.vibe) {
        const newState = {...playerState, vibe: newVibe};
        setPlayerState(newState);
        handleGenerateMood(newState);
      }
    }
  }, [currentVibe, gameState, playerState, handleGenerateMood]);
  
  const startGame = useCallback(async () => {
    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'Name Required', description: 'Please enter a name for your character.' });
      return;
    }

    setIsLoading(true);
    const { id: toastId } = toast({ title: 'Starting Your Journey...', description: 'The road to Portland unfolds before you.' });
    
    const initialEvents: TrailEvent[] = [{ progress: 0, description: "Your journey begins in San Francisco.", timestamp: new Date() }];
    
    const initialState: PlayerState = {
      ...INITIAL_PLAYER_STATE,
      name: name,
      job: job,
      avatar: avatarKaomoji,
      mood: mood,
      vibe: "Just starting out",
      events: initialEvents,
    };
    
    setPlayerState(initialState);
    setAvatarImage(introAvatarImage); // Carry over the avatar from the intro screen
    
    const result = await getScenarioAction({ ...initialState, location: 'San Francisco' });
    if ('error' in result && result.error) {
      toast({
        id: toastId,
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
    toast({ id: toastId, title: 'Journey Begun!', description: 'Your first trial awaits.' });

    // Fetch images for the first scenario
    // We pass the *full* new player state, including the potentially new kaomoji
    fetchImages(scenarioResult, {...initialState, avatar: scenarioResult.playerAvatar || avatarKaomoji });

  }, [name, job, avatarKaomoji, mood, toast, addLog, updateSystemStatus, introAvatarImage]);
  
  const restartGame = useCallback(() => {
    setGameState('intro');
    setPlayerState(INITIAL_PLAYER_STATE);
    setName('');
    setMood('');
    setJob('');
    setHasInitialized(false);
    setSystemStatus(INITIAL_SYSTEM_STATUS);
    setSceneImage('');
    setAvatarImage('');
    setIntroAvatarImage('');
    setBadgeImage(null);
    setCountdown(3);
    setIsAvatarRendered(false);
    localStorage.removeItem('healthyServices');
    localStorage.removeItem('primaryDegradedServices');
    localStorage.removeItem('fullyOfflineServices');
  }, []);

  const fetchImages = async (currentScenario: Scenario, currentPlayerState: PlayerState) => {
    setIsImageLoading(true);
    setSceneImage('');
    setBadgeImage(null);
    const { id: toastId } = toast({ title: 'Conjuring Scene...', description: 'The Vibe Sage is painting a picture of your surroundings.' });

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

    try {
        const imageResult = await getImagesAction(imageInput);
        if ('error' in imageResult) {
            toast({ id: toastId, variant: 'destructive', title: 'Image Generation Failed', description: imageResult.error });
        } else {
            // Only update scene and badge images. Avatar remains the same.
            setSceneImage(imageResult.sceneImage);
            if (imageResult.badgeImage) {
                setBadgeImage(imageResult.badgeImage);
            }
            if (imageResult.dataSource) {
                updateSystemStatus({ image: imageResult.dataSource });
            }
            toast({ id: toastId, title: 'Visions Conjured', description: 'The scene has been rendered.' });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({ id: toastId, variant: 'destructive', title: 'Image Generation Failed', description: errorMessage });
    } finally {
        setIsImageLoading(false);
    }
  };

  const advanceTurn = (tempState: PlayerState) => {
    setIsLoading(true);
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

    const { id: toastId, update } = toast({ title: 'Game Master is thinking...', description: 'Analyzing your precarious situation.' });

    const getNextScenario = async () => {
        try {
            setTimeout(() => {
                update({ id: toastId, title: 'Game Master is thinking...', description: 'Crafting a quirky, ironic trial...' });
            }, 750);
            
            const result = await getScenarioAction(tempState);

            if ('error' in result && result.error) {
                addLog(result.error, tempState.progress);
                update({
                    id: toastId,
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
                update({ id: toastId, title: 'New Scenario!', description: 'What fresh weirdness is this?' });
                fetchImages(scenarioResult, newPlayerState);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            update({
                id: toastId,
                variant: "destructive",
                title: "Failed to get next scenario",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    setTimeout(getNextScenario, 500);
  };
  
  const handleModalClose = () => {
        setIsOutcomeModalOpen(false);
        advanceTurn(playerState); // playerState is already updated
        setLastChoice(null);
        setLastLoot([]);
  }

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

    let tempState = { ...playerState };
    const consequences = action.consequences;

    // Apply consequences to base stats
    tempState.baseStats.health = Math.max(0, tempState.baseStats.health + consequences.health);
    tempState.baseStats.style = Math.max(0, tempState.baseStats.style + consequences.style);
    tempState.baseStats.irony = Math.max(0, tempState.baseStats.irony + consequences.irony);
    tempState.baseStats.authenticity = Math.max(0, tempState.baseStats.authenticity + consequences.authenticity);
    tempState.baseStats.vibes = Math.max(0, tempState.baseStats.vibes + consequences.vibes);
    
    // Apply consequences to resources
    tempState.resources.coffee = Math.max(0, tempState.resources.coffee + consequences.coffee);
    tempState.resources.vinyls = Math.max(0, tempState.resources.vinyls + consequences.vinyls);
    tempState.progress = Math.min(100, Math.max(0, tempState.progress + consequences.progress));
    tempState.resources.stamina = Math.min(100, Math.max(0, tempState.resources.stamina + consequences.stamina));
    
    // Recalculate final stats
    tempState.stats = calculateStats(tempState.baseStats, tempState.resources.equipment);
    
    tempState.location = currentLocation;

    const newEvent: TrailEvent = {
        progress: tempState.progress,
        description: `You chose to: ${action.text}.`,
        timestamp: new Date()
    };
    tempState.events = [newEvent, ...tempState.events];

    setPlayerState(tempState);
    addLog(`You chose to: ${action.text}.`, tempState.progress);
    
    // For actions, we show a simplified outcome via toast and advance immediately.
    toast({
      title: 'Action Taken',
      description: action.description,
    });
    advanceTurn(tempState);
  };

  const handleChoice = async (choice: Choice) => {
    if (isLoading || isImageLoading) return;

    let tempState = { ...playerState };
    const consequences = choice.consequences;

    // Apply consequences to base stats
    tempState.baseStats.health += consequences.health;
    tempState.baseStats.style += consequences.style;
    tempState.baseStats.irony += consequences.irony;
    tempState.baseStats.authenticity += consequences.authenticity;
    tempState.baseStats.vibes += consequences.vibes;

    // Apply consequences to resources
    tempState.resources.coffee += consequences.coffee;
    tempState.resources.vinyls += consequences.vinyls;
    tempState.progress = Math.min(100, tempState.progress + consequences.progress);
    tempState.resources.stamina = Math.min(100, Math.max(0, tempState.resources.stamina + consequences.stamina));
    
    // Recalculate final stats
    tempState.stats = calculateStats(tempState.baseStats, tempState.resources.equipment);

    const potentialBadge = (consequences as any).badge;
    if (potentialBadge) {
        const newBadge: Badge = { 
            description: potentialBadge.badgeDescription,
            emoji: potentialBadge.badgeEmoji,
            isUber: potentialBadge.isUber || false,
            image: badgeImage || undefined,
         };
        tempState.resources.badges = [...tempState.resources.badges, newBadge];
        addLog(`You earned a badge: "${newBadge.description}"!`, tempState.progress);
        toast({ title: 'Badge Earned!', description: newBadge.description });
    }
    
    let earnedLoot: LootItem[] = [];
    if (consequences.reward?.loot && scenario) {
        const { id: toastId } = toast({ title: 'Finding Treasure...', description: 'Searching for something ironically cool.' });
        const lootResult = await getLootAction(tempState, scenario.scenario);
        if (lootResult.loot) {
            earnedLoot = lootResult.loot;
            tempState.resources.inventory.push(...earnedLoot);
            addLog(`You found a cache of items!`, tempState.progress);
            toast({ id: toastId, title: 'Loot Found!', description: 'Check your inventory for new gear.' });
            if (lootResult.dataSource) {
                updateSystemStatus({ loot: lootResult.dataSource });
            }
        } else if (lootResult.error) {
            toast({ id: toastId, variant: 'destructive', title: 'Loot Generation Failed', description: lootResult.error });
        }
    }
    
    tempState.location = currentLocation;

    const newEvent: TrailEvent = {
        progress: tempState.progress,
        description: `You chose to "${choice.text}".`,
        timestamp: new Date()
    };
    tempState.events = [newEvent, ...tempState.events];

    setPlayerState(tempState);
    addLog(`You chose to "${choice.text}".`, tempState.progress);
    
    setLastChoice(choice);
    setLastLoot(earnedLoot);
    setIsOutcomeModalOpen(true);
  };

  const handleEquipItem = (item: LootItem) => {
    setPlayerState(prevState => {
        const newState = { ...prevState };
        const { type } = item;

        // Unequip the current item in that slot and move it to inventory
        const currentItem = newState.resources.equipment[type];
        if (currentItem) {
            newState.resources.inventory.push(currentItem);
        }

        // Equip the new item and remove it from inventory
        newState.resources.equipment[type] = item;
        newState.resources.inventory = newState.resources.inventory.filter(invItem => invItem.name !== item.name);
        
        // Recalculate stats
        newState.stats = calculateStats(newState.baseStats, newState.resources.equipment);
        addLog(`You equipped: ${item.name}.`, newState.progress);
        toast({ title: "Item Equipped", description: `${item.name} is now active.` });

        return newState;
    });
  };

  const handleUnequipItem = (slot: EquipmentSlot) => {
    setPlayerState(prevState => {
        const newState = { ...prevState };
        const itemToUnequip = newState.resources.equipment[slot];

        if (itemToUnequip) {
            // Move item back to inventory
            newState.resources.inventory.push(itemToUnequip);
            // Clear the equipment slot
            delete newState.resources.equipment[slot];
            
            // Recalculate stats
            newState.stats = calculateStats(newState.baseStats, newState.resources.equipment);
            addLog(`You unequipped: ${itemToUnequip.name}.`, newState.progress);
            toast({ title: "Item Unequipped", description: `${itemToUnequip.name} returned to inventory.` });
        }
        
        return newState;
    });
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
    const isAnythingLoading = isNameLoading || isMoodLoading || isIntroAvatarLoading;
    const isButtonDisabled = isAnythingLoading || isLoading || !job || !name || (isAvatarRendered && countdown > 0);
    const isCountdownActive = isAvatarRendered && countdown > 0;
    const isReady = isAvatarRendered && countdown === 0;

    const getButtonContent = () => {
        if (isLoading) {
            return <span className="animate-pulse-text-destructive">Hitting The Trail... of Doom</span>
        }
        if (isAnythingLoading) {
            return (
                <>
                    <ConjuringIcon className="mr-2 h-5 w-5" />
                    <span>Conjuring...</span>
                </>
            );
        }
        if (isCountdownActive) {
            return (
                <span className="animate-pulse-text">Conjuring... {countdown}</span>
            );
        }
        return (
             <>
                <PennyFarthingIcon className="mr-2 h-5 w-5" />
                <span>Begin Your Descent</span>
             </>
        );
    };

    return (
      <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full text-center shadow-2xl relative bg-card/80 backdrop-blur-sm border-2 border-border/20">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-6xl font-headline font-bold text-primary">The Portland Trail</h1>
              <p className="text-muted-foreground font-body text-xl">
                {randomTagline}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8 text-left pt-4">
              <div className="relative shrink-0">
                <Avatar className="h-40 w-40 border-4 border-secondary/50 text-5xl font-headline rounded-full">
                  {isIntroAvatarLoading || !introAvatarImage ? (
                    <div className="h-full w-full rounded-full bg-muted/50 flex flex-col items-center justify-center gap-2 text-foreground">
                        <ConjuringIcon className="h-10 w-10" />
                    </div>
                  ) : (
                    <AvatarImage 
                        src={introAvatarImage} 
                        alt={name} 
                        className="rounded-full" 
                        data-ai-hint="avatar portrait" 
                        onLoad={() => setIsAvatarRendered(true)}
                    />
                  )}
                   <AvatarFallback className="rounded-full">{name.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-4 flex-1 w-full">
                <div className="space-y-2">
                  <Label htmlFor="name" className='font-headline text-xl'>HIPSTER NAME</Label>
                  <div className="flex items-center gap-2">
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Rune, Thorne, Lux" disabled={isLoading || isNameLoading} className="text-lg" />
                    <Button 
                      type="button"
                      size="icon" 
                      variant="secondary" 
                      onClick={() => handleGenerateName()}
                      disabled={isLoading || isNameLoading}
                      aria-label="Randomize Name"
                      >
                      {isNameLoading ? <ConjuringIcon className="h-6 w-6" /> : <RefreshCw />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job" className='font-headline text-xl'>WHAT YOU DO IN BETWEEN GIGS</Label>
                  <Select value={job} onValueChange={setJob} disabled={isLoading}>
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

            <Button 
                size="lg" 
                onClick={startGame} 
                disabled={isButtonDisabled} 
                className={cn(
                    "font-headline text-2xl mt-4",
                    isReady && "animate-glow-primary"
                )}
            >
                {getButtonContent()}
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
       {lastChoice && (
            <OutcomeModal 
                isOpen={isOutcomeModalOpen}
                onClose={handleModalClose}
                choice={lastChoice}
                loot={lastLoot}
            />
        )}
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          <div className="lg:col-span-1 flex flex-col gap-6 opacity-0 animate-fade-in animate-delay-100">
            <StatusDashboard 
              playerState={playerState} 
              avatarImage={avatarImage} 
              isImageLoading={isImageLoading} 
              onEquip={handleEquipItem}
              onUnequip={handleUnequipItem}
            />
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

    