
'use server';
/**
 * @fileOverview An agentic scenario generator for the Portland Trail game.
 *
 * - generatePortlandScenario - A function that uses an AI agent to generate a scenario.
 * - GeneratePortlandScenarioInput - The input type for the generatePortlandScenario function.
 * - GeneratePortlandScenarioOutput - The return type for the generatePortlandScenario function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { callNexixApi } from '@/ai/nexix-api';
import { ChoiceSchema } from '@/lib/types';

const GeneratePortlandScenarioInputSchema = z.object({
  playerStatus: z
    .string()
    .describe('The current status of the player, including health, style, vinyl collection, irony, and authenticity.'),
  location: z.string().describe('The current location of the player on the trail.'),
  character: z.object({
    name: z.string(),
    job: z.string(),
  }),
});
export type GeneratePortlandScenarioInput = z.infer<typeof GeneratePortlandScenarioInputSchema>;

const GeneratePortlandScenarioOutputSchema = z.object({
  scenario: z.string().describe('A description of the generated scenario.'),
  challenge: z.string().describe('A challenge the player must overcome in the scenario.'),
  diablo2Element: z.string().optional().describe('The subtle Diablo II reference.'),
  avatarKaomoji: z.string().describe('A Japanese-style Kaomoji (e.g., (⌐■_■) or ┐(‘～` )┌) representing the player character.'),
  choices: z.array(ChoiceSchema).describe("An array of 2-3 choices for the player."),
  dataSource: z.enum(['primary', 'hardcoded']).describe('The source of the generated data.'),
});
export type GeneratePortlandScenarioOutput = z.infer<typeof GeneratePortlandScenarioOutputSchema>;

// This is the schema we expect the proxied model to return
const OllamaResponseSchema = z.object({
  scenario: z.string(),
  challenge: z.string(),
  diablo2Element: z.string().optional(),
  avatarKaomoji: z.string(),
  choices: z.array(ChoiceSchema),
});

export async function generatePortlandScenario(
  input: GeneratePortlandScenarioInput
): Promise<GeneratePortlandScenarioOutput> {
  console.log('[generatePortlandScenario] Started with agent flow.');
  
  let result;
  let dataSource: 'primary' | 'hardcoded' = 'primary';

  try {
        const prompt = `You are the Game Master for "The Portland Trail," a quirky text-based RPG. Create a complete scenario.

**Player Status:** ${input.playerStatus}
**Location:** ${input.location}
**Character:** Name: ${input.character.name}, Job: ${input.character.job}

**Instructions:**
1.  **Analyze Player Status**: Create balanced choices. If the player is struggling, make rewards generous.
2.  **Generate Scenario**: Create a quirky scenario specific to the player's location, with a subtle Diablo II reference.
3.  **Create Choices**: Generate 2-3 choices with full consequences (health, style, irony, authenticity, vibes, progress, coffee, vinyls, stamina).
4.  **Badges**: Decide if a choice warrants a standard or "Uber" badge and include the 'badge' object in its consequences if so.
5.  **Avatar Kaomoji**: Create a Japanese-style Kaomoji for the player.

You MUST respond with only a valid JSON object, with no other text before or after it.`;

    result = await callNexixApi('gemma3:12b', prompt, OllamaResponseSchema);
    return { ...result, dataSource: 'primary' };
  } catch (error) {
    console.error(`[generatePortlandScenario] AI call failed. Returning hard-coded scenario.`, { error });
    dataSource = 'hardcoded';
    result = {
        scenario: "You encounter a glitch in the hipster matrix. A flock of identical pigeons, all wearing tiny fedoras, stares at you menacingly before dispersing.",
        challenge: 'Question your reality',
        diablo2Element: "You feel as though you've just witnessed a 'Diablo Clone' event, but for birds.",
        avatarKaomoji: '(o_O;)',
        choices: [
            {
                text: 'Embrace the weirdness',
                description: "What's the worst that could happen?",
                consequences: { health: -2, style: 5, irony: 5, authenticity: -3, vibes: 10, progress: 0, coffee: 0, vinyls: 0, stamina: 0, badge: { badgeDescription: 'Fedorapocalypse Witness', badgeEmoji: '🐦', isUber: false } },
            },
            {
                text: 'Skedaddle',
                description: 'This is too much. Time to leave.',
                consequences: { health: -1, style: -2, irony: 0, authenticity: 0, vibes: -5, progress: 3, coffee: 0, vinyls: 0, stamina: -5 },
            },
            {
                text: 'Summon Hipsters',
                description: 'Call upon the local cognoscenti for aid. What could go wrong?',
                consequences: { health: -50, style: -20, irony: -20, authenticity: -20, vibes: -50, progress: 0, coffee: -10, vinyls: -2, stamina: -50 },
            }
        ],
    };
    return { ...result, dataSource: 'hardcoded' };
  }
}

ai.defineFlow(
  {
    name: 'generatePortlandScenarioFlow',
    inputSchema: GeneratePortlandScenarioInputSchema,
    outputSchema: GeneratePortlandScenarioOutputSchema,
  },
  generatePortlandScenario
);
