
'use server';
/**
 * @fileOverview A character bio generator for the Portland Trail game.
 *
 * - generateCharacterBio - A function that generates a short character bio.
 * - GenerateCharacterBioInput - The input type for the generateCharacterBio function.
 * - GenerateCharacterBioOutput - The return type for the generateCharacterBio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { callNexixApi } from '@/ai/nexix-api';

const GenerateCharacterBioInputSchema = z.object({
  name: z.string().describe('The name of the character.'),
  job: z.string().describe('The job of the character.'),
  vibe: z.string().describe('The current vibe or mood of the character (e.g., "Peak Vibe", "Aesthetically Fading").'),
});
export type GenerateCharacterBioInput = z.infer<typeof GenerateCharacterBioInputSchema>;

const GenerateCharacterBioOutputSchema = z.object({
  bio: z.string().describe('A short, 1-2 sentence, quirky bio for the character in the third person.'),
});
export type GenerateCharacterBioOutput = z.infer<typeof GenerateCharacterBioOutputSchema>;

const GenerateCharacterBioAndSourceOutputSchema = GenerateCharacterBioOutputSchema.extend({
    dataSource: z.enum(['primary', 'hardcoded']).describe('The source of the generated data.'),
});
type GenerateCharacterBioAndSourceOutput = z.infer<typeof GenerateCharacterBioAndSourceOutputSchema>;

export async function generateCharacterBio(input: GenerateCharacterBioInput): Promise<GenerateCharacterBioAndSourceOutput> {
  return generateCharacterBioFlow(input);
}

const generateCharacterBioFlow = ai.defineFlow(
  {
    name: 'generateCharacterBioFlow',
    inputSchema: GenerateCharacterBioInputSchema,
    outputSchema: GenerateCharacterBioAndSourceOutputSchema,
  },
  async ({ name, job, vibe }) => {
    console.log(`[generateCharacterBioFlow] Started for character: ${name}, Job: ${job}, Vibe: ${vibe}`);
    const prompt = `You are a character bio writer for a quirky video game.
You will be given a character's name, job, and current "vibe".
Based on this, write a short, 1-2 sentence bio for them in a witty, third-person voice.
The bio should capture a hipster or artisanal vibe and reflect their current state.

Character Name: ${name}
Character Job: ${job}
Current Vibe: ${vibe}

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "bio": "The generated bio."
}`;

    try {
      const apiResponse = await callNexixApi('gemma3:12b', prompt);

      let parsedResult;
      try {
        // AI might return a JSON string, or an escaped JSON string.
        parsedResult = GenerateCharacterBioOutputSchema.parse(JSON.parse(apiResponse));
      } catch (e) {
        console.warn("[generateCharacterBioFlow] Failed to parse directly, attempting to unescape and parse again.", { error: e });
        const unescapedResponse = JSON.parse(apiResponse);
        parsedResult = GenerateCharacterBioOutputSchema.parse(JSON.parse(unescapedResponse));
      }

      return { ...parsedResult, dataSource: 'primary' };

    } catch (error) {
        console.error(`[generateCharacterBioFlow] Call failed. Returning hard-coded bio.`, { error });
        return {
            bio: "They believe their artisanal pickles can change the world, one jar at a time.",
            dataSource: 'hardcoded',
        }
    }
  }
);
