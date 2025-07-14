
'use server';

import { generatePortlandScenario } from '@/ai/flows/generate-portland-scenario';
import type { PlayerState, Scenario, Choice } from '@/lib/types';

export async function getScenarioAction(playerState: PlayerState): Promise<Scenario | { error: string }> {
  console.log('[getScenarioAction] Action started. Fetching new scenario for player:', playerState.name);
  try {
    const scenarioInput = {
      playerStatus: `Name: ${playerState.name}, Job: ${playerState.job}, Bio: ${playerState.bio}, Hunger: ${playerState.stats.hunger}/100, Style: ${playerState.stats.style}, Vinyls: ${playerState.resources.vinyls}, Irony: ${playerState.stats.irony}, Authenticity: ${playerState.stats.authenticity}, Bike Health: ${playerState.resources.bikeHealth}%, Progress: ${playerState.progress}%`,
      location: playerState.location,
      character: { name: playerState.name, job: playerState.job },
    };
    
    console.log('[getScenarioAction] Calling generatePortlandScenario...');
    
    // Generate scenario and choices from the AI
    const scenarioDetails = await generatePortlandScenario(scenarioInput);
    console.log(`[getScenarioAction] Flow response received. Scenario Source: ${scenarioDetails.dataSource}`);
    
    // The agent may or may not decide to create a badge
    const hasBadge = !!scenarioDetails.badge;

    let dataSources: Record<string, 'primary' | 'fallback' | 'hardcoded'> = {
        scenario: scenarioDetails.dataSource,
    };

    let choices: Choice[] = scenarioDetails.choices;
    
    // If the AI decided to award a badge, attach it to the first ("Embrace") choice's consequences.
    if (hasBadge && choices.length > 0) {
        choices[0].consequences.badge = {
            description: scenarioDetails.badge!.badgeDescription,
            emoji: scenarioDetails.badge!.badgeEmoji,
        };
        dataSources.badge = scenarioDetails.dataSource; // The badge comes from the same source as the scenario
        console.log('[getScenarioAction] Badge details attached to "Embrace" choice.');
    }
    
    // Add the "Go for Broke" choice only if there's a badge to gamble for.
    if (hasBadge) {
        choices.push({
            text: 'GO FOR BROKE',
            description: 'A high-risk, high-reward gamble. You might earn an incredible badge, or you might face a devastating failure.',
            consequences: {
                hunger: 0, style: 0, irony: 0, authenticity: 0, coffee: 0, vinyls: 0, progress: 0, bikeHealth: 0,
                // The actual badge for "Go for Broke" is handled client-side
                badge: { description: scenarioDetails.badge!.badgeDescription, emoji: scenarioDetails.badge!.badgeEmoji }
            }
        });
        console.log('[getScenarioAction] "GO FOR BROKE" choice added.');
    }

    const finalScenario = {
      scenario: scenarioDetails.scenario,
      challenge: scenarioDetails.challenge,
      reward: 'Varies by choice', // Reward is now baked into choices
      diablo2Element: scenarioDetails.diablo2Element,
      badgeDescription: scenarioDetails.badge?.badgeDescription,
      asciiArt: scenarioDetails.asciiArt,
    };

    console.log('[getScenarioAction] Successfully constructed scenario object.');
    return { 
        ...finalScenario, 
        choices, 
        playerAvatar: scenarioDetails.avatarKaomoji,
        dataSources,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[getScenarioAction] Critical failure: ${errorMessage}`, { playerState });
    return {
      error: errorMessage,
    };
  }
}
