
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

// This is the schema we expect the proxied model to return
const OllamaResponseSchema = z.object({
  scenario: z.string(),
  challenge: z.string(),
  diablo2Element: z.string().optional(),
  avatarKaomoji: z.string(),
  choices: z.array(ChoiceSchema),
});


const GeneratePortlandScenarioOutputSchema = OllamaResponseSchema.extend({
  dataSource: z.enum(['primary', 'hardcoded']).describe('The source of the generated data.'),
});
export type GeneratePortlandScenarioOutput = z.infer<typeof GeneratePortlandScenarioOutputSchema>;


export async function generatePortlandScenario(
  input: GeneratePortlandScenarioInput
): Promise<GeneratePortlandScenarioOutput> {
  console.log('[generatePortlandScenario] Started with agent flow.');
  
  const prompt = `You are the Game Master for "The Portland Trail," a quirky, dark, and ironic text-based RPG. Your goal is to create a scenario that is challenging and contributes to a longer gameplay experience.

**Player Status:** ${input.playerStatus}
**Location:** ${input.location}
**Character:** Name: ${input.character.name}, Job: ${input.character.job}

**Instructions:**
1.  **Analyze Player Status & Create Challenge**: Based on the player's status, create a balanced but difficult scenario.
2.  **Generate Scenario**: Create a quirky scenario specific to the player's location, with a subtle Diablo II reference.
3.  **Create 4 Distinct Choices**: Generate exactly 4 choices with a clear risk/reward gradient.
    -   **One Safe Choice:** Low risk, low reward. Minimal stat changes.
    -   **Two Moderate Choices:** Balanced risk and reward.
    -   **One Super Risky Choice:** High risk, high reward. This choice should have the potential for large positive and negative consequences.
    -   Each choice MUST have "text" (a short 2-4 word summary for a button), "description" (a longer 1-2 sentence description for a tooltip), and "outcome" (a 1-2 sentence narrative of what happened).
4.  **Calculate Consequences Carefully**: Progress should be hard to earn.
    -   All consequence values (health, style, irony, authenticity, vibes, progress, coffee, vinyls, stamina) MUST be numbers.
    -   **Progress can be negative.** A bad choice can push the player backward on the trail. Use negative numbers for the "progress" field to represent this. For example: \`"progress": -5\`.
    -   The riskier the choice, the larger the potential stat swings (both positive and negative). The "Super Risky" choice could award 20+ points or penalize just as harshly.
5.  **No Loot or Badges**: Do NOT include 'reward' or 'badge' objects in the consequences. This is handled by a different system.
6.  **Avatar Kaomoji**: Create a Japanese-style Kaomoji for the player that reflects the mood of the scenario.

You MUST respond with only a valid JSON object, with no other text before or after it. All fields are required unless specified as optional. The JSON object must match this structure exactly:
{
  "scenario": "string",
  "challenge": "string",
  "diablo2Element": "string (optional)",
  "avatarKaomoji": "string",
  "choices": [
    {
      "text": "string (short, for a button)",
      "description": "string (longer, for a tooltip)",
      "outcome": "string (narrative result of the choice)",
      "consequences": {
        "health": "number",
        "style": "number",
        "irony": "number",
        "authenticity": "number",
        "vibes": "number",
        "progress": "number",
        "coffee": "number",
        "vinyls": "number",
        "stamina": "number"
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
