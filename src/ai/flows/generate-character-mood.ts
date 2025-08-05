
'use server';
/**
 * @fileOverview A character mood generator for the Portland Trail game.
 *
 * - generateCharacterMood - A function that generates a short character mood description.
 * - GenerateCharacterMoodInput - The input type for the function.
 * - GenerateCharacterMoodOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { callNexixApi } from '@/ai/nexix-api';

const GenerateCharacterMoodInputSchema = z.object({
  name: z.string().describe('The name of the character.'),
  job: z.string().describe('The job of the character.'),
  stats: z.object({
    health: z.number(),
    style: z.number(),
    irony: z.number(),
    authenticity: z.number(),
    vibes: z.number(),
  }),
  resources: z.object({
    vinyls: z.number(),
    coffee: z.number(),
    stamina: z.number(),
  }),
  progress: z.number(),
});
export type GenerateCharacterMoodInput = z.infer<typeof GenerateCharacterMoodInputSchema>;

const GenerateCharacterMoodOutputSchema = z.object({
  mood: z.string().describe('A short, 1-2 sentence, quirky mood description for the character in the third person, reflecting their current status.'),
});
export type GenerateCharacterMoodOutput = z.infer<typeof GenerateCharacterMoodOutputSchema>;

const GenerateCharacterMoodAndSourceOutputSchema = GenerateCharacterMoodOutputSchema.extend({
    dataSource: z.enum(['primary', 'hardcoded']).describe('The source of the generated data.'),
});
type GenerateCharacterMoodAndSourceOutput = z.infer<typeof GenerateCharacterMoodAndSourceOutputSchema>;

export async function generateCharacterMood(input: GenerateCharacterMoodInput): Promise<GenerateCharacterMoodAndSourceOutput> {
    console.log(`[generateCharacterMood] Started for character: ${input.name}`);
    
    const prompt = `Generate a short, 1-2 sentence, quirky mood description for a video game character. The mood should be in the third person, with a hipster or artisanal vibe, and reflect their current status.

Character Details:
- Name: ${input.name}
- Job: ${input.job}
- Health: ${input.stats.health}/100
- Bike Stamina: ${input.resources.stamina}/100
- Vibes: ${input.stats.vibes}/100
- Social Stats: Style ${input.stats.style}, Irony ${input.stats.irony}, Authenticity ${input.stats.authenticity}
- Resources: ${input.resources.coffee} Coffee Beans, ${input.resources.vinyls} Vinyls
- Progress to Portland: ${input.progress}%

You MUST respond with only a valid JSON object, with no other text before or after it. The JSON object must contain a single key "mood".`;

    const parsedResult = await callNexixApi('gemma3:12b', prompt, GenerateCharacterMoodOutputSchema);
    return { ...parsedResult, dataSource: 'primary' };
}

ai.defineFlow(
  {
    name: 'generateCharacterMoodFlow',
    inputSchema: GenerateCharacterMoodInputSchema,
    outputSchema: GenerateCharacterMoodAndSourceOutputSchema,
  },
  generateCharacterMood
);
