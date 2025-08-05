
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
  
  const prompt = `You are the Game Master for "The Portland Trail," a quirky text-based RPG. Create a complete scenario.

**Player Status:** ${input.playerStatus}
**Location:** ${input.location}
**Character:** Name: ${input.character.name}, Job: ${input.character.job}

**Instructions:**
1.  **Analyze Player Status**: Create balanced choices. If the player is struggling, make rewards generous.
2.  **Generate Scenario**: Create a quirky scenario specific to the player's location, with a subtle Diablo II reference.
3.  **Create Choices**: Generate 2-3 choices with full consequences. Each choice needs a "text" and a "description" field.
4.  **Consequences MUST be Numbers**: All consequence values (health, style, irony, authenticity, vibes, progress, coffee, vinyls, stamina) MUST be numbers, not strings. For example, use "health": 10, not "health": "10".
5.  **Badges**: If a choice warrants a special reward, you MUST include a 'badge' object in its 'consequences'. The badge object MUST have three keys: 'badgeDescription' (string), 'badgeEmoji' (string), and 'isUber' (boolean).
6.  **Avatar Kaomoji**: Create a Japanese-style Kaomoji for the player.

You MUST respond with only a valid JSON object, with no other text before or after it. All fields are required unless specified as optional. The JSON object must match this structure exactly:
{
  "scenario": "string",
  "challenge": "string",
  "diablo2Element": "string (optional)",
  "avatarKaomoji": "string",
  "choices": [
    {
      "text": "string",
      "description": "string",
      "consequences": {
        "health": "number",
        "style": "number",
        "irony": "number",
        "authenticity": "number",
        "vibes": "number",
        "progress": "number",
        "coffee": "number",
        "vinyls": "number",
        "stamina": "number",
        "badge": { "badgeDescription": "string", "badgeEmoji": "string", "isUber": "boolean" } (optional)
      }
    }
  ]
}`;

    const result = await callNexixApi('gemma3:12b', prompt, OllamaResponseSchema);
    return { ...result, dataSource: 'primary' };
}

ai.defineFlow(
  {
    name: 'generatePortlandScenarioFlow',
    inputSchema: GeneratePortlandScenarioInputSchema,
    outputSchema: GeneratePortlandScenarioOutputSchema,
  },
  generatePortlandScenario
);
