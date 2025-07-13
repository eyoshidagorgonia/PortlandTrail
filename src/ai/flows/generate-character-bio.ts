
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
    dataSource: z.enum(['primary', 'fallback', 'hardcoded']).describe('The source of the generated data.'),
});
type GenerateCharacterBioAndSourceOutput = z.infer<typeof GenerateCharacterBioAndSourceOutputSchema>;

export async function generateCharacterBio(input: GenerateCharacterBioInput): Promise<GenerateCharacterBioAndSourceOutput> {
  return generateCharacterBioFlow(input);
}

const promptTemplate = `You are a character bio writer for a quirky video game.
You will be given a character's name, job, and current "vibe".
Based on this, write a short, 1-2 sentence bio for them in a witty, third-person voice.
The bio should capture a hipster or artisanal vibe and reflect their current state.

Character Name: {name}
Character Job: {job}
Current Vibe: {vibe}

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "bio": "The generated bio."
}
`;

const generateCharacterBioFlow = ai.defineFlow(
  {
    name: 'generateCharacterBioFlow',
    inputSchema: GenerateCharacterBioInputSchema,
    outputSchema: GenerateCharacterBioAndSourceOutputSchema,
  },
  async ({ name, job, vibe }) => {
    console.log(`[generateCharacterBioFlow] Started for character: ${name}, Job: ${job}, Vibe: ${vibe}`);
    const prompt = promptTemplate
      .replace('{name}', name)
      .replace('{job}', job)
      .replace('{vibe}', vibe);
    console.log(`[generateCharacterBioFlow] Generated prompt.`);

    try {
      const url = 'http://modelapi.nexix.ai/api/v1/proxy/generate';
      const apiKey = process.env.NEXIX_API_KEY;

      if (!apiKey) {
        throw new Error('NEXIX_API_KEY is not set for generateCharacterBioFlow.');
      }
      
      const requestBody = {
          model: 'gemma3:12b',
          messages: [{ role: 'user', content: prompt }],
          stream: false,
          format: 'json'
      };
      console.log(`[generateCharacterBioFlow] Sending request to proxy server at ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[generateCharacterBioFlow] Proxy API Error: ${response.status} ${response.statusText}`, { url, errorBody });
        throw new Error(`Proxy API request failed with status ${response.status}: ${errorBody}`);
      }
      
      const result = await response.json();
      console.log(`[generateCharacterBioFlow] Successfully received response from proxy.`);
      
      const parsedResult = GenerateCharacterBioOutputSchema.parse(JSON.parse(result.response));
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
