'use server';

import { generatePortlandScenario } from '@/ai/flows/generate-portland-scenario';
import type { PlayerState, Scenario, Choice } from '@/lib/types';

function createConsequences(): Choice['consequences'] {
  return {
    hunger: -1 * (Math.floor(Math.random() * 4) + 2), // -2 to -5
    style: Math.floor(Math.random() * 11) - 5, // -5 to +5
    irony: Math.floor(Math.random() * 7) - 2, // -2 to +4
    authenticity: Math.floor(Math.random() * 7) - 3, // -3 to +3
    coffee: -1 * Math.floor(Math.random() * 3), // 0 to -2
    vinyls: Math.random() > 0.8 ? 1 : 0, // 20% chance to find a vinyl
    progress: Math.floor(Math.random() * 5) + 5, // 5 to 9
  };
}

export async function getScenarioAction(playerState: PlayerState): Promise<Scenario | { error: string }> {
  try {
    const scenarioInput = {
      playerStatus: `Hunger: ${playerState.stats.hunger}/100, Style: ${playerState.stats.style}, Vinyls: ${playerState.resources.vinyls}, Irony: ${playerState.stats.irony}, Authenticity: ${playerState.stats.authenticity}, Bike Health: ${playerState.resources.bikeHealth}%`,
      location: playerState.location,
    };
    const scenario = await generatePortlandScenario(scenarioInput);

    const choices: Choice[] = [
      {
        text: `Embrace the weirdness`,
        description: `You dive headfirst into the situation. What's the worst that could happen?`,
        consequences: createConsequences(),
      },
      {
        text: `Play it safe`,
        description: `This seems a bit too strange. You decide to observe from a safe distance and move on.`,
        consequences: {
          ...createConsequences(),
          style: -2,
          irony: -1,
          authenticity: -1,
          progress: 7, // a bit more progress for being safe
        },
      },
    ];

    return { ...scenario, choices };
  } catch (error) {
    console.error('Error in getScenarioAction:', error);
    return {
      error: 'Failed to generate a new scenario. The path has grown cold and desolate.',
    };
  }
}
