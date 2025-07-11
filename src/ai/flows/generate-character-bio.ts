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

// Define the shape of the expected response from the API cache server
interface ProxyResponse {
    content: string;
    isCached: boolean;
    error?: string;
  }

const GenerateCharacterBioInputSchema = z.object({
  name: z.string().describe('The name of the character.'),
  job: z.string().describe('The job of the character.'),
  vibe: z.string().describe('The current vibe or mood of the character (e.g., "Peak Vibe", "Aesthetically Fading").'),
});
export type GenerateCharacterBioInput = z.infer<typeof GenerateCharacterBioInputSchema>;

const GenerateCharacterBioOutputSchema = z.object({
  bio: z.string().describe('A short, 1-2 sentence, quirky bio for the character in the third person.'),
  isFallback: z.boolean().optional().describe('Indicates if the returned data is a fallback due to an error.'),
});
export type GenerateCharacterBioOutput = z.infer<typeof GenerateCharacterBioOutputSchema>;

export async function generateCharacterBio(input: GenerateCharacterBioInput): Promise<GenerateCharacterBioOutput> {
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
    outputSchema: GenerateCharacterBioOutputSchema,
  },
  async ({ name, job, vibe }) => {
    const prompt = promptTemplate
      .replace('{name}', name)
      .replace('{job}', job)
      .replace('{vibe}', vibe);

    try {
      const baseUrl = process.env.DOCKER_ENV ? 'http://host.docker.internal:9002' : 'http://localhost:9002';
      const url = `${baseUrl}/api/proxy`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_CACHE_SERVER_KEY || ''}`
        },
        body: JSON.stringify({
            model: 'google-ai',
            prompt: prompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${response.statusText}`, errorText);
        throw new Error(errorText || `API Error: ${response.status}`);
      }
      
      const result: ProxyResponse = await response.json();
      let responseData = result.content;
      // Sometimes the model returns markdown with the JSON inside, so we extract it.
      const jsonMatch = responseData.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseData = jsonMatch[0];
      }
      
      const parsedResult = JSON.parse(responseData);
      return GenerateCharacterBioOutputSchema.parse(parsedResult);

    } catch (error) {
        console.error("Could not generate bio, using fallback.", error);
        return {
            bio: "They believe their artisanal pickles can change the world, one jar at a time.",
            isFallback: true,
        }
    }
  }
);
