
'use server';

import { generatePortlandScenario } from '@/ai/flows/generate-portland-scenario';
import { generateImagesForScenario } from '@/ai/flows/generate-images-for-scenario';
import { generateLoot } from '@/ai/flows/generate-loot';
import { generateUpcycledItem } from '@/ai/flows/generate-upcycled-item';
import type { PlayerState, Scenario, Choice, GenerateImagesInput, GenerateImagesOutput, LootItem, LootCache, GearQuality, EquipmentSlot } from '@/lib/types';

export async function getScenarioAction(playerState: PlayerState): Promise<Scenario | { error: string }> {
  console.log('[getScenarioAction] Action started. Fetching new scenario for player:', playerState.name);
  try {
    const scenarioInput = {
      playerStatus: `Name: ${playerState.name}, Job: ${playerState.job}, Health: ${playerState.stats.health}/100, Style: ${playerState.stats.style}, Vinyls: ${playerState.resources.vinyls}, Irony: ${playerState.stats.irony}, Authenticity: ${playerState.stats.authenticity}, Stamina: ${playerState.resources.stamina}%, Progress: ${playerState.progress}%`,
      location: playerState.location,
      character: { name: playerState.name, job: playerState.job },
    };
    
    console.log('[getScenarioAction] Calling generatePortlandScenario...');
    
    const scenarioDetails = await generatePortlandScenario(scenarioInput);
    console.log(`[getScenarioAction] Flow response received. Scenario Source: ${scenarioDetails.dataSource}`);
    
    let dataSources: Record<string, 'primary' | 'hardcoded'> = {
        scenario: scenarioDetails.dataSource,
    };
    
    const finalScenario: Scenario = {
      scenario: scenarioDetails.scenario,
      challenge: scenarioDetails.challenge,
      diablo2Element: scenarioDetails.diablo2Element,
      choices: scenarioDetails.choices,
      playerAvatar: scenarioDetails.avatarKaomoji, // The kaomoji is now here
      dataSources,
    };

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


export async function getLootAction(playerState: PlayerState, scenarioText: string): Promise<LootCache | { error: string }> {
    console.log('[getLootAction] Action started. Fetching loot.');
    try {
        const lootInput = {
            playerStatus: `Health: ${playerState.stats.health}, Style: ${playerState.stats.style}, Irony: ${playerState.stats.irony}, Authenticity: ${playerState.stats.authenticity}`,
            scenario: scenarioText,
        };

        const result = await generateLoot(lootInput);
        console.log(`[getLootAction] Successfully generated loot. Source: ${result.dataSource}`);
        return { loot: result.loot, badge: result.badge, dataSource: result.dataSource };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[getLootAction] Critical failure: ${errorMessage}`);
        return { error: `Failed to generate loot: ${errorMessage}` };
    }
}

export async function upcycleItemsAction(inputQuality: GearQuality): Promise<{ item: LootItem; isBlessed: boolean } | { error: string }> {
    console.log('[upcycleItemsAction] Action started.');
    try {
        // As per FRD-035, 0.05% chance to be blessed, 99.95% to be cursed.
        const isBlessed = Math.random() < 0.0005;

        const result = await generateUpcycledItem({ inputQuality, isBlessed });
        
        console.log(`[upcycleItemsAction] Successfully generated upcycled item. Blessed: ${isBlessed}`);

        return { item: result.item, isBlessed };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[upcycleItemsAction] Critical failure: ${errorMessage}`);
        return { error: `Failed to generate upcycled item: ${errorMessage}` };
    }
}

    