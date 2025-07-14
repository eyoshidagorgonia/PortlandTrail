
'use server';

import { generatePortlandScenario } from '@/ai/flows/generate-portland-scenario';
import { generateImagesForScenario } from '@/ai/flows/generate-images-for-scenario';
import type { PlayerState, Scenario, Choice, GenerateImagesInput, GenerateImagesOutput, Badge } from '@/lib/types';

export async function getScenarioAction(playerState: PlayerState): Promise<Scenario | { error: string }> {
  console.log('[getScenarioAction] Action started. Fetching new scenario for player:', playerState.name);
  try {
    const scenarioInput = {
      playerStatus: `Name: ${playerState.name}, Job: ${playerState.job}, Bio: ${playerState.bio}, Hunger: ${playerState.stats.hunger}/100, Style: ${playerState.stats.style}, Vinyls: ${playerState.resources.vinyls}, Irony: ${playerState.stats.irony}, Authenticity: ${playerState.stats.authenticity}, Bike Health: ${playerState.resources.bikeHealth}%, Progress: ${playerState.progress}%`,
      location: playerState.location,
      character: { name: playerState.name, job: playerState.job },
    };
    
    console.log('[getScenarioAction] Calling generatePortlandScenario...');
    
    const scenarioDetails = await generatePortlandScenario(scenarioInput);
    console.log(`[getScenarioAction] Flow response received. Scenario Source: ${scenarioDetails.dataSource}`);
    
    const hasBadge = !!scenarioDetails.badge;

    let dataSources: Record<string, 'primary' | 'fallback' | 'hardcoded'> = {
        scenario: scenarioDetails.dataSource,
    };

    let choices: Choice[] = scenarioDetails.choices;
    
    // Attach the badge info to the first choice if a badge was awarded by the model.
    // The frontend will use this to associate the generated image with the badge.
    if (hasBadge && choices.length > 0) {
        choices[0].consequences.badge = {
            description: scenarioDetails.badge!.badgeDescription,
            emoji: scenarioDetails.badge!.badgeEmoji,
        };
        dataSources.badge = scenarioDetails.dataSource;
        console.log('[getScenarioAction] Badge details attached to "Embrace" choice.');
    }

    const finalScenario: Scenario = {
      scenario: scenarioDetails.scenario,
      challenge: scenarioDetails.challenge,
      diablo2Element: scenarioDetails.diablo2Element,
      choices,
      playerAvatar: scenarioDetails.avatarKaomoji,
      dataSources,
    };
    
    // Also include top-level badge info for the image generation step
    if (scenarioDetails.badge) {
        finalScenario.badge = {
            description: scenarioDetails.badge.badgeDescription,
            emoji: scenarioDetails.badge.badgeEmoji,
        }
    }

    console.log('[getScenarioAction] Successfully constructed scenario object.');
    return finalScenario;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[getScenarioAction] Critical failure: ${errorMessage}`, { playerState });
    return {
      error: errorMessage,
    };
  }
}


export async function getImagesAction(input: GenerateImagesInput): Promise<GenerateImagesOutput | { error: string }> {
    console.log('[getImagesAction] Action started. Fetching images for scenario.');
    try {
        const images = await generateImagesForScenario(input);
        console.log('[getImagesAction] Successfully generated images.');
        return images;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[getImagesAction] Critical failure: ${errorMessage}`);
        return { error: errorMessage };
    }
}
