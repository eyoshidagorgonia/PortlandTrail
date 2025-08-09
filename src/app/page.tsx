
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { INITIAL_PLAYER_STATE, TRAILS, HIPSTER_JOBS, STARTING_CITIES, BUILD_NUMBER, getIronicHealthStatus, SERVICE_DISPLAY_NAMES, IRONIC_TAGLINES } from '@/lib/constants';
import type { PlayerState, Scenario, Choice, PlayerAction, SystemStatus, Badge, TrailEvent, LootItem, LootCache, EquipmentSlot } from '@/lib/types';
import { getScenarioAction, getImagesAction, getLootAction } from '@/app/actions';
import { generateHipsterName } from '@/ai/flows/generate-hipster-name';
import { generateCharacterMood } from '@/ai/flows/generate-character-mood';
import StatusDashboard from '@/components/game/status-dashboard';
import ScenarioDisplay from '@/components/game/scenario-display';
import GameOverScreen from '@/components/game/game-over-screen';
import OutcomeModal from '@/components/game/outcome-modal';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { PennyFarthingIcon, ConjuringIcon, VibeSageIcon } from '@/components/game/icons';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import TrailMap from '@/components/game/trail-map';
import { cn } from '@/lib/utils';
import { calculateStats } from '@/lib/utils';
import HistoryDisplay from '@/components/game/history-display';

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
  const [origin, setOrigin] = useState('');
  const [avatarKaomoji, setAvatarKaomoji] = useState('(-_-)');
  const [isNameLoading, setIsNameLoading] = useState(false);
  
  // Mood is part of playerState now, but we need a loading flag for the UI.
  const [isMoodLoading, setIsMoodLoading] = useState(false);
  
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(INITIAL_SYSTEM_STATUS);

  // Image states
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [avatarImage, setAvatarImage] = useState<string>('');
  const [sceneImage, setSceneImage] = useState<string>('');
  const [badgeImage, setBadgeImage] = useState<string | null>(null);

  // Intro-specific image state
  const [isIntroAvatarLoading, setIsIntroAvatarLoading] = useState(false);
  
  // Outcome modal state
  const [lastChoice, setLastChoice] = useState<Choice | null>(null);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [lastLoot, setLastLoot] = useState<LootItem[]>([]);
  const [lastBadge, setLastBadge] = useState<Badge | null>(null);

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
  
  // This effect will run only on the client, after hydration.
  useEffect(() => {
    setRandomTagline(IRONIC_TAGLINES[Math.floor(Math.random() * IRONIC_TAGLINES.length)]);
  }, []);

  const waypointIndex = useMemo(() => {
    if (!playerState.trail || playerState.trail.length <= 1) return 0;
    // Ensure we don't go out of bounds if progress is 100%
    const calculatedIndex = Math.floor(playerState.progress / (100 / (playerState.trail.length - 1)));
    return Math.min(calculatedIndex, playerState.trail.length - 1);
  }, [playerState.progress, playerState.trail]);

  const currentLocation = useMemo(() => {
    if (!playerState.trail || playerState.trail.length === 0) return 'The Void';
    return playerState.trail[waypointIndex] || playerState.trail[playerState.trail.length - 1];
  }, [waypointIndex, playerState.trail]);
  
  const currentVibe = useMemo(() => {
      return getIronicHealthStatus(playerState.stats.health).text;
  }, [playerState.stats.health]);


  const addLog = useCallback((message: string, progress: number) => {
    setEventLog(prev => [{ description: message, progress, timestamp: new Date() }, ...prev.slice(0, 49)]);
  }, []);

  const handleGenerateName = useCallback(async () => {
    setIsNameLoading(true);
    const { id: toastId } = toast({ title: 'Conjuring Moniker...', description: 'The Vibe Sage is consulting the ether.' });
    try {
        const result = await generateHipsterName();
        setName(result.name);
        updateSystemStatus({ name: result.dataSource });
        toast({ id: toastId, title: 'Moniker Conjured!', description: 'Your new identity awaits, for now.' });
        return result.name;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({ id: toastId, variant: 'destructive', title: 'Name Generation Failed', description: errorMessage });
        return '';
    } finally {
        setIsNameLoading(false);
    }
  }, [updateSystemStatus, toast]);

  const handleGenerateMood = useCallback(async (state: PlayerState) => {
     if (!state.name || !state.job || !state.origin) return;
    setIsMoodLoading(true);
    // Don't toast here to reduce notification spam
    try {
        const result = await generateCharacterMood({ 
            name: state.name, 
            job: state.job,
            origin: state.origin, 
            stats: state.stats,
            resources: state.resources,
            progress: state.progress,
        });
        setPlayerState(prev => ({...prev, mood: result.mood, vibe: currentVibe }));
        updateSystemStatus({ mood: result.dataSource });
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({ variant: 'destructive', title: 'Aura Reading Failed', description: errorMessage });
    } finally {
        setIsMoodLoading(false);
    }
  }, [updateSystemStatus, toast, currentVibe]);
  
  const generateIntroAvatar = useCallback(async (currentName: string, currentJob: string, currentOrigin: string) => {
    if (!currentName || !currentJob || !currentOrigin) return;
    setIsIntroAvatarLoading(true);
    const imageInput = {
      scenarioDescription: `A beautiful, painterly, nostalgic, Studio Ghibli anime style portrait of a hipster named ${currentName}, who is a ${currentJob} from ${currentOrigin}.`,
      character: { name: currentName, job: currentJob, origin: currentOrigin, vibe: "Just starting out", avatarKaomoji },
    };
    
    try {
        const imageResult = await getImagesAction(imageInput);
        if ('error' in imageResult) {
            toast({ variant: 'destructive', title: 'Image Generation Failed', description: imageResult.error });
            setAvatarImage(''); // Set to empty on failure
        } else {
            // In the intro, the sceneImage field is repurposed to carry the avatar image.
            setAvatarImage(imageResult.sceneImage);
            if (imageResult.dataSource) {
                updateSystemStatus({ image: imageResult.dataSource });
            }
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({ variant: 'destructive', title: 'Image Generation Failed', description: errorMessage });
        setAvatarImage(''); // Set to empty on failure
    } finally {
        setIsIntroAvatarLoading(false);
    }
  }, [avatarKaomoji, toast, updateSystemStatus]);

  // Effect for initial game setup.
  useEffect(() => {
    if (gameState === 'intro' && !hasInitialized) {
        const performInitialSetup = async () => {
            setIsInitializing(true);
            
            // Set random job and origin first
            const randomJob = HIPSTER_JOBS[Math.floor(Math.random() * HIPSTER_JOBS.length)];
            const randomOrigin = STARTING_CITIES[Math.floor(Math.random() * STARTING_CITIES.length)];
            setJob(randomJob);
            setOrigin(randomOrigin);

            // Then generate the name
            const generatedName = await handleGenerateName();
            
            // Only after name is generated, do we generate avatar and mood
            if (generatedName) {
                await Promise.all([
                    generateIntroAvatar(generatedName, randomJob, randomOrigin),
                    handleGenerateMood({...INITIAL_PLAYER_STATE, name: generatedName, job: randomJob, origin: randomOrigin })
                ]);
            }

            setIsInitializing(false);
            setHasInitialized(true); 
        };
        performInitialSetup();
    }
  }, [gameState, hasInitialized, handleGenerateName, generateIntroAvatar, handleGenerateMood]);

  // Effect for user-driven changes on the intro screen, AFTER initial setup.
  useEffect(() => {
    const handleUserChange = async () => {
        if (gameState === 'intro' && hasInitialized && !isInitializing) {
            await generateIntroAvatar(name, job, origin);
            await handleGenerateMood({...INITIAL_PLAYER_STATE, name, job, origin });
        }
    };
    handleUserChange();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, job, origin, hasInitialized]);


  // Regenerate mood when vibe changes during gameplay
  useEffect(() => {
    if(gameState === 'playing' && !isInitializing) {
      const newVibe = currentVibe;
      if (newVibe !== playerState.vibe) {
        const newState = {...playerState, vibe: newVibe};
        setPlayerState(newState);
        handleGenerateMood(newState);
      }
    }
  }, [currentVibe, gameState, playerState, handleGenerateMood, isInitializing]);
  
  const startGame = useCallback(async () => {
    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'Name Required', description: 'Even ironically, you must have a name.' });
      return;
    }

    setIsLoading(true);
    const { id: toastId } = toast({ title: 'Beginning the Descent...', description: 'The road to Portland beckons, or something.' });
    
    const chosenTrail = TRAILS[origin] || TRAILS['San Francisco'];
    
    const initialState: PlayerState = {
      ...INITIAL_PLAYER_STATE,
      name: name,
      job: job,
      origin: origin,
      avatar: avatarKaomoji,
      mood: playerState.mood, // Carry over the generated mood
      vibe: "Just starting out",
      location: chosenTrail[0],
      trail: chosenTrail,
      events: [{ progress: 0, description: `The "journey" begins in ${origin}.`, timestamp: new Date() }]
    };
    
    setPlayerState(initialState);
    
    const result = await getScenarioAction(initialState);
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
    
    const finalInitialState = {...initialState, avatar: scenarioResult.playerAvatar || avatarKaomoji};
    setPlayerState(finalInitialState);
    setAvatarKaomoji(scenarioResult.playerAvatar || avatarKaomoji);
    
    const initialLogMessage = `Your journey as ${name} the ${job} from ${origin} begins. The road to Portland is long and fraught with peril (and artisanal cheese).`;
    setEventLog(finalInitialState.events);
    addLog(initialLogMessage, 0);
    
    setScenario(scenarioResult);
    addLog(`An event unfolds: ${scenarioResult.scenario}`, 0);
    if (scenarioResult.dataSources) {
        updateSystemStatus(scenarioResult.dataSources);
    }
    
    setGameState('playing');
    setIsLoading(false);
    toast({ id: toastId, title: 'And So It Begins.', description: 'Your first trial awaits.' });

    // Fetch images for the first scenario
    fetchImages(scenarioResult, finalInitialState);

  }, [name, job, origin, avatarKaomoji, playerState.mood, toast, addLog, updateSystemStatus]);
  
  const restartGame = useCallback(() => {
    setGameState('intro');
    setPlayerState(INITIAL_PLAYER_STATE);
    setName('');
    setJob('');
    setOrigin('');
    setHasInitialized(false);
    setIsInitializing(true); // Reset for next game start
    setSystemStatus(INITIAL_SYSTEM_STATUS);
    setSceneImage('');
    setAvatarImage('');
    setBadgeImage(null);
    setEventLog([]);
    localStorage.removeItem('fullyOfflineServices');
  }, []);

  const fetchImages = async (currentScenario: Scenario, currentPlayerState: PlayerState) => {
    setIsImageLoading(true);
    setSceneImage('');
    setBadgeImage(null);

    const imageInput = {
      scenarioDescription: currentScenario.scenario,
      character: {
        name: currentPlayerState.name,
        job: currentPlayerState.job,
        origin: currentPlayerState.origin,
        vibe: currentPlayerState.vibe,
        avatarKaomoji: currentPlayerState.avatar,
      },
      // Badge is now part of the loot cache, but we can pass its details if it exists for image gen
      badge: lastBadge ? { description: lastBadge.description, emoji: lastBadge.emoji } : undefined,
    };

    try {
        const imageResult = await getImagesAction(imageInput);
        if ('error' in imageResult) {
            toast({ variant: 'destructive', title: 'Image Generation Failed', description: imageResult.error });
        } else {
            setSceneImage(imageResult.sceneImage);
            if (imageResult.badgeImage) {
                setBadgeImage(imageResult.badgeImage);
            }
            if (imageResult.dataSource) {
                updateSystemStatus({ image: imageResult.dataSource });
            }
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({ variant: 'destructive', title: 'Image Generation Failed', description: errorMessage });
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

    const getNextScenario = async () => {
        try {
            const result = await getScenarioAction(tempState);

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
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            toast({
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
        setLastBadge(null);
  }

  const handleAction = (action: PlayerAction) => {
    if (isLoading || isImageLoading) return;

    if (playerState.resources.coffee + action.consequences.coffee < 0) {
        toast({
            variant: 'destructive',
            title: 'Not Enough Coffee Beans',
            description: 'Your artisanal wallet is empty. A familiar feeling.',
        });
        return;
    }
    
    setIsLoading(true);
    let tempState = { ...playerState };
    const consequences = action.consequences;

    // Apply consequences to base stats
    tempState.baseStats.health = Math.max(0, tempState.baseStats.health + (consequences.health ?? 0));
    tempState.baseStats.style = Math.max(0, tempState.baseStats.style + (consequences.style ?? 0));
    tempState.baseStats.irony = Math.max(0, tempState.baseStats.irony + (consequences.irony ?? 0));
    tempState.baseStats.authenticity = Math.max(0, tempState.baseStats.authenticity + (consequences.authenticity ?? 0));
    tempState.baseStats.vibes = Math.max(0, tempState.baseStats.vibes + (consequences.vibes ?? 0));
    
    // Apply consequences to resources
    tempState.resources.coffee = Math.max(0, tempState.resources.coffee + (consequences.coffee ?? 0));
    tempState.resources.vinyls = Math.max(0, tempState.resources.vinyls + (consequences.vinyls ?? 0));
    tempState.progress = Math.min(100, Math.max(0, tempState.progress + (consequences.progress ?? 0)));
    tempState.resources.stamina = Math.min(100, Math.max(0, tempState.resources.stamina + (consequences.stamina ?? 0)));
    
    // Recalculate final stats
    tempState.stats = calculateStats(tempState.baseStats, tempState.resources.equipment);
    
    const newWaypointIndex = Math.floor(tempState.progress / (100 / (tempState.trail.length - 1)));
    tempState.location = tempState.trail[newWaypointIndex] || tempState.trail[tempState.trail.length - 1];

    const newEvent: TrailEvent = {
        progress: tempState.progress,
        description: `You decided to: ${action.text}.`,
        timestamp: new Date()
    };
    tempState.events = [newEvent, ...tempState.events];

    setPlayerState(tempState);
    addLog(`You decided to: ${action.text}.`, tempState.progress);
    
    advanceTurn(tempState);
  };
  
  // Toast for action taken
  useEffect(() => {
    if (eventLog[0]?.description.startsWith('You decided to:')) {
        toast({
          title: 'Action Taken',
          description: eventLog[0].description,
        });
    }
  }, [eventLog, toast]);

  const handleChoice = async (choice: Choice) => {
    if (isLoading || isImageLoading) return;
    setIsLoading(true);

    let tempState = { ...playerState };
    const consequences = choice.consequences;

    // Apply consequences to base stats
    tempState.baseStats.health += consequences.health ?? 0;
    tempState.baseStats.style += consequences.style ?? 0;
    tempState.baseStats.irony += consequences.irony ?? 0;
    tempState.baseStats.authenticity += consequences.authenticity ?? 0;
    tempState.baseStats.vibes += consequences.vibes ?? 0;

    // Apply consequences to resources
    tempState.resources.coffee += consequences.coffee ?? 0;
    tempState.resources.vinyls += consequences.vinyls ?? 0;
    tempState.progress = Math.min(100, tempState.progress + (consequences.progress ?? 0));
    tempState.resources.stamina = Math.min(100, Math.max(0, tempState.resources.stamina + (consequences.stamina ?? 0)));
    
    // Recalculate final stats
    tempState.stats = calculateStats(tempState.baseStats, tempState.resources.equipment);

    let earnedLoot: LootItem[] = [];
    let earnedBadge: Badge | null = null;
    
    if (scenario) {
        const lootResult = await getLootAction(tempState, scenario.scenario);
        if ('error' in lootResult) {
            toast({ variant: 'destructive', title: 'Loot Generation Failed', description: lootResult.error });
        } else {
            earnedLoot = lootResult.loot;
            tempState.resources.inventory.push(...earnedLoot);
            addLog(`You found some stuff.`, tempState.progress);
            if (lootResult.dataSource) {
                updateSystemStatus({ loot: lootResult.dataSource });
            }
            
            if (lootResult.badge) {
                const newBadge: Badge = { 
                    description: lootResult.badge.badgeDescription,
                    emoji: lootResult.badge.badgeEmoji,
                    isUber: lootResult.badge.isUber || false,
                };
                earnedBadge = newBadge;
                setLastBadge(newBadge); // Set for image generation
            }
        }
    }

    const newWaypointIndex = Math.floor(tempState.progress / (100 / (tempState.trail.length - 1)));
    const finalWaypointIndex = Math.min(newWaypointIndex, tempState.trail.length - 1);
    tempState.location = tempState.trail[finalWaypointIndex] || tempState.trail[tempState.trail.length - 1];

    const newEvent: TrailEvent = {
        progress: tempState.progress,
        description: `You chose to "${choice.text}".`,
        timestamp: new Date()
    };
    tempState.events = [newEvent, ...tempState.events];

    // Badge image generation happens here, after the loot has been decided
    if (earnedBadge) {
        setIsImageLoading(true); // Start image loading spinner
        const imageInput = {
            scenarioDescription: scenario!.scenario,
            character: {
                name: tempState.name,
                job: tempState.job,
                origin: tempState.origin,
                vibe: tempState.vibe,
                avatarKaomoji: tempState.avatar,
            },
            badge: { description: earnedBadge.description, emoji: earnedBadge.emoji },
        };
        const imageResult = await getImagesAction(imageInput);
        let finalBadgeImage: string | undefined = undefined;
        if (!('error' in imageResult) && imageResult.badgeImage) {
            finalBadgeImage = imageResult.badgeImage;
            updateSystemStatus({ image: imageResult.dataSource });
        }
        
        const finalBadge = { ...earnedBadge, image: finalBadgeImage };
        tempState.resources.badges.push(finalBadge);
        setLastBadge(finalBadge); // Update badge with image for modal
        addLog(`You "earned" a badge: "${finalBadge.description}"`, tempState.progress);
        setIsImageLoading(false); // Stop image loading spinner
    }


    setPlayerState(tempState);
    addLog(`You chose to "${choice.text}".`, tempState.progress);
    
    setLastChoice(choice);
    setLastLoot(earnedLoot);
    setIsOutcomeModalOpen(true);
    setIsLoading(false); // Done with this choice, modal is open
  };

  // Toast for loot found
  useEffect(() => {
    if (lastLoot.length > 0) {
      toast({ title: 'Loot Acquired!', description: 'Check your tote bag for questionably useful items.' });
    }
  }, [lastLoot, toast]);

  // Toast for badge earned
  useEffect(() => {
    if (lastBadge) {
      toast({ title: 'Badge of Dishonor Earned!', description: lastBadge.description });
    }
  }, [lastBadge, toast]);


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
        toast({ title: "Item Equipped", description: `${item.name} is now part of your "look."` });

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
            toast({ title: "Item Unequipped", description: `${itemToUnequip.name} returned to your tote bag.` });
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
    const isAnythingLoading = isNameLoading || isMoodLoading || isIntroAvatarLoading || isInitializing;
    const isButtonDisabled = isAnythingLoading || isLoading || !job || !name || !origin;

    const getButtonContent = () => {
        if (isLoading) {
            return <span className="animate-pulse-text">Beginning the Descent...</span>
        }
        if (isAnythingLoading) {
            return (
                <>
                    <ConjuringIcon className="mr-2 h-5 w-5 animate-pulse-text" />
                    <span className="animate-pulse-text">Curating...</span>
                </>
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
      <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 flex items-center justify-center relative">
        <Card className="max-w-2xl w-full text-center shadow-2xl relative bg-card/80 backdrop-blur-sm border-2 border-border/20">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-6xl font-headline font-bold text-primary">The Portland Trail</h1>
              <p className="text-muted-foreground font-body text-xl">
                {randomTagline}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8 text-left pt-4">
              <div className="relative shrink-0 h-40 w-40">
                {isInitializing || isIntroAvatarLoading ? (
                  <div className="h-full w-full rounded-full border-4 border-secondary/50 bg-muted/50 flex flex-col items-center justify-center gap-2 text-foreground animate-pulse">
                    <ConjuringIcon className="h-10 w-10 text-primary" />
                  </div>
                ) : (
                  <Avatar className="h-40 w-40 border-4 border-secondary/50 text-5xl font-headline rounded-full">
                    <AvatarImage
                      src={avatarImage}
                      alt={name}
                      className="rounded-full"
                      data-ai-hint="avatar portrait"
                    />
                    <AvatarFallback className="rounded-full">{name.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                )}
              </div>

              <div className="space-y-4 flex-1 w-full">
                <div className="space-y-2">
                  <Label htmlFor="name" className='font-headline text-xl'>YOUR MONIKER</Label>
                  <div className="flex items-center gap-2">
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Rune, Thorne, Lux" disabled={isLoading || isNameLoading || isInitializing} className="text-lg" />
                    <Button 
                      type="button"
                      size="icon" 
                      variant="secondary" 
                      onClick={handleGenerateName}
                      disabled={isLoading || isNameLoading || isInitializing}
                      aria-label="Randomize Name"
                      >
                      {isNameLoading || isInitializing ? (
                        <ConjuringIcon className="h-6 w-6 animate-pulse-text" />
                      ) : (
                        <ConjuringIcon className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="job" className='font-headline text-xl'>VOCATION</Label>
                        <Select value={job} onValueChange={setJob} disabled={isLoading || isInitializing}>
                            <SelectTrigger id="job" className="text-lg">
                            <SelectValue placeholder="Select a profession" />
                            </SelectTrigger>
                            <SelectContent>
                            {HIPSTER_JOBS.map((j) => (
                                <SelectItem key={j} value={j} className="text-base">{j}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="origin" className='font-headline text-xl'>PROVENANCE</Label>
                        <Select value={origin} onValueChange={setOrigin} disabled={isLoading || isInitializing}>
                            <SelectTrigger id="origin" className="text-lg">
                            <SelectValue placeholder="Select an origin" />
                            </SelectTrigger>
                            <SelectContent>
                            {STARTING_CITIES.map((c) => (
                                <SelectItem key={c} value={c} className="text-base">{c}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center mt-4">
                <Button 
                    size="lg" 
                    onClick={startGame} 
                    disabled={isButtonDisabled} 
                    className={cn(
                        "font-headline text-2xl",
                        !isButtonDisabled && "animate-glow-primary"
                    )}
                >
                    {getButtonContent()}
                </Button>

                <Link href="/help" passHref>
                    <Button variant="link" className="text-muted-foreground mt-4">
                        <VibeSageIcon className="mr-2 h-5 w-5" />
                        Whisper to the Vibe Sage
                    </Button>
                </Link>
            </div>
          </CardContent>
           <div className="absolute bottom-2 right-3 text-xs text-muted-foreground/50 font-code flex items-center gap-2">
                <StatusIcons />
                <span>Build: {BUILD_NUMBER.toFixed(3)}</span>
            </div>
        </Card>
        <HistoryDisplay />
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
                badge={lastBadge}
            />
        )}
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          <div className="lg:col-span-1 flex flex-col gap-6 opacity-0 animate-fade-in animate-delay-100">
            <StatusDashboard 
              playerState={playerState} 
              avatarImage={avatarImage} 
              onEquip={handleEquipItem}
              onUnequip={handleUnequipItem}
              onAction={handleAction}
              isLoading={isLoading || isImageLoading}
            />
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
      <HistoryDisplay />
      <div className="absolute bottom-2 left-3 text-xs text-muted-foreground/50 font-code flex items-center gap-2">
        <StatusIcons />
        <span>Build: {BUILD_NUMBER.toFixed(3)}</span>
      </div>
    </main>
  );
}
