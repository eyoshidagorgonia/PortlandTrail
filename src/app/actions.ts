
'use server';

import { generatePortlandScenario } from '@/ai/flows/generate-portland-scenario';
import { generateImagesForScenario } from '@/ai/flows/generate-images-for-scenario';
import type { PlayerState, Scenario, Choice, GenerateImagesInput, GenerateImagesOutput, Badge } from '@/lib/types';

export async function getScenarioAction(playerState: PlayerState): Promise<Scenario | { error: string }> {
  console.log('[getScenarioAction] Action started. Fetching new scenario for player:', playerState.name);
  try {
    const scenarioInput = {
      playerStatus: `Name: ${playerState.name}, Job: ${playerState.job}, Bio: ${playerState.bio}, Health: ${playerState.stats.health}/100, Style: ${playerState.stats.style}, Vinyls: ${playerState.resources.vinyls}, Irony: ${playerState.stats.irony}, Authenticity: ${playerState.stats.authenticity}, Stamina: ${playerState.resources.stamina}%, Progress: ${playerState.progress}%`,
      location: playerState.location,
      character: { name: playerState.name, job: playerState.job },
    };
    
    console.log('[getScenarioAction] Calling generatePortlandScenario...');
    
    const scenarioDetails = await generatePortlandScenario(scenarioInput);
    console.log(`[getScenarioAction] Flow response received. Scenario Source: ${scenarioDetails.dataSource}`);
    
    let dataSources: Record<string, 'primary' | 'fallback' | 'hardcoded'> = {
        scenario: scenarioDetails.dataSource,
    };

    let choices: Choice[] = scenarioDetails.choices;
    
    // The AI flow now attaches badge info directly to the consequence object of a choice.
    // We check if any choice has a badge to determine if we need to set the badge data source.
    const choiceWithBadge = choices.find(c => c.consequences.badge);

    if (choiceWithBadge) {
        const badge = choiceWithBadge.consequences.badge!;
        dataSources.badge = scenarioDetails.dataSource;
        console.log(`[getScenarioAction] Badge "${badge.badgeDescription}" details found on choice "${choiceWithBadge.text}".`);
    }

    const finalScenario: Scenario = {
      scenario: scenarioDetails.scenario,
      challenge: scenarioDetails.challenge,
      diablo2Element: scenarioDetails.diablo2Element,
      choices,
      playerAvatar: scenarioDetails.avatarKaomoji, // The kaomoji is now here
      dataSources,
    };
    
    // Also include top-level badge info for the image generation step if a badge was part of the winning choice
    if (choiceWithBadge) {
        const badgeInfo = choiceWithBadge.consequences.badge!;
        finalScenario.badge = {
            description: badgeInfo.badgeDescription,
            emoji: badgeInfo.badgeEmoji,
        }
    }

    console.log('[getScenarioAction] Successfully constructed scenario object.');
    return finalScenario;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[getScenarioAction] Critical failure: ${errorMessage}`, { playerState });
    return {
      error: `Failed to get scenario: ${errorMessage}`,
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
        return { error: `Failed to generate images: ${errorMessage}` };
    }
}
