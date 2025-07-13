
'use server';

import { generatePortlandScenario } from '@/ai/flows/generate-portland-scenario';
import { generateScenarioImage } from '@/ai/flows/generate-scenario-image';
import { generateBadgeImage } from '@/ai/flows/generate-badge-image';
import { generateTransportMode } from '@/ai/flows/generate-transport-mode';
import type { PlayerState, Scenario, Choice } from '@/lib/types';

function createConsequences(): Omit<Choice['consequences'], 'badge'> {
  return {
    hunger: -1 * (Math.floor(Math.random() * 4) + 2), // -2 to -5
    style: Math.floor(Math.random() * 11) - 5, // -5 to +5
    irony: Math.floor(Math.random() * 7) - 2, // -2 to +4
    authenticity: Math.floor(Math.random() * 7) - 3, // -3 to +3
    coffee: -1 * Math.floor(Math.random() * 3), // 0 to -2
    vinyls: Math.random() > 0.8 ? 1 : 0, // 20% chance to find a vinyl
    progress: Math.floor(Math.random() * 2) + 1, // 1 to 2
    bikeHealth: -1 * (Math.floor(Math.random() * 3)), // -0 to -2, general wear and tear
  };
}

export async function getScenarioAction(playerState: PlayerState): Promise<Scenario | { error: string }> {
  console.log('[getScenarioAction] Action started. Fetching new scenario for player:', playerState.name);
  try {
    const scenarioInput = {
      playerStatus: `Name: ${playerState.name}, Job: ${playerState.job}, Bio: ${playerState.bio}, Hunger: ${playerState.stats.hunger}/100, Style: ${playerState.stats.style}, Vinyls: ${playerState.resources.vinyls}, Irony: ${playerState.stats.irony}, Authenticity: ${playerState.stats.authenticity}, Bike Health: ${playerState.resources.bikeHealth}%`,
      location: playerState.location,
    };
    
    console.log('[getScenarioAction] Calling generatePortlandScenario flow...');
    const scenarioDetails = await generatePortlandScenario(scenarioInput);
    console.log(`[getScenarioAction] Flow response received. Source: ${scenarioDetails.dataSource}`);
    
    const hasBadge = scenarioDetails.badgeDescription && scenarioDetails.badgeImagePrompt;

    // Generate supporting assets in parallel
    console.log('[getScenarioAction] Generating images and transport mode in parallel...');
    const [imageResult, badgeImageResult, transportModeResult] = await Promise.all([
        generateScenarioImage({ prompt: scenarioDetails.imagePrompt }),
        hasBadge ? generateBadgeImage({ prompt: scenarioDetails.badgeImagePrompt! }) : Promise.resolve(null),
        generateTransportMode()
    ]);
    console.log('[getScenarioAction] Parallel generation complete.');

    let dataSources: Record<string, 'primary' | 'fallback' | 'hardcoded'> = {
        scenario: scenarioDetails.dataSource,
        image: imageResult.dataSource,
        transport: transportModeResult.dataSource,
    };

    const choices: Choice[] = [];
    
    // Add the "Embrace" choice, which may or may not have a badge.
    const embraceChoice: Choice = {
        text: `Embrace the weirdness`,
        description: `You dive headfirst into the situation. What's the worst that could happen?`,
        consequences: {
            hunger: -1 * (Math.floor(Math.random() * 4) + 2),
            style: Math.floor(Math.random() * 11) - 5,
            irony: Math.floor(Math.random() * 7) - 2,
            authenticity: Math.floor(Math.random() * 7) - 3,
            progress: 0,
            coffee: 0,
            vinyls: 0,
            bikeHealth: 0,
        },
    };

    if (hasBadge && badgeImageResult) {
        embraceChoice.consequences.badge = {
            description: scenarioDetails.badgeDescription!,
            imageDataUri: badgeImageResult.imageDataUri,
        };
        dataSources.badge = badgeImageResult.dataSource;
        console.log('[getScenarioAction] Badge details attached to "Embrace" choice.');
    }
    choices.push(embraceChoice);

    // Add the "Continue" choice
    choices.push({
        text: transportModeResult.text,
        description: `This seems a bit too strange. You decide to observe from a safe distance and move on.`,
        consequences: {
          ...createConsequences(),
          style: -2,
          irony: -1,
          authenticity: -1,
          progress: 4,
          bikeHealth: -5,
        },
    });

    // Add the "Go for Broke" choice only if there's a badge to gamble for.
    if (hasBadge) {
        choices.push({
            text: 'GO FOR BROKE',
            description: 'A high-risk, high-reward gamble. You might earn an incredible badge, or you might face a devastating failure.',
            consequences: {
                hunger: 0, style: 0, irony: 0, authenticity: 0, coffee: 0, vinyls: 0, progress: 0, bikeHealth: 0,
            }
        });
        console.log('[getScenarioAction] "GO FOR BROKE" choice added.');
    }


    console.log('[getScenarioAction] Successfully constructed scenario object.');
    return { 
        ...scenarioDetails, 
        choices, 
        image: imageResult.imageDataUri,
        dataSources,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[getScenarioAction] Critical failure: ${errorMessage}`, { playerState });
    return {
      error: 'Failed to generate a new scenario. The path has grown cold and desolate.',
    };
  }
}
