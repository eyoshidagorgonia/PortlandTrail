'use server';
/**
 * @fileOverview An avatar generator for the Portland Trail game.
 *
 * - generateAvatar - A function that generates a player avatar.
 * - GenerateAvatarInput - The input type for the generateAvatar function.
 * - GenerateAvatarOutput - The return type for the generateAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the shape of the expected response from the API cache server
interface CacheApiResponse {
  answer: string;
  wasCached: boolean;
  error?: string;
}

const GenerateAvatarInputSchema = z.object({
  name: z.string().describe('The name of the character.'),
  job: z.string().describe('The job of the character.'),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  avatarDataUri: z.string().describe("A generated avatar image for the character, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  isFallback: z.boolean().optional().describe('Indicates if the returned data is a fallback due to an error.'),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(input: GenerateAvatarInput): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input);
}

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async ({name, job}) => {
    const prompt = `Generate a quirky, 16-bit pixel art portrait of a hipster character for a video game. The character's name is ${name} and they are a ${job}. The background should be a simple, single color.`;
    try {
      const cacheKey = `avatar-${name.replace(/\s+/g, '-')}-${job.replace(/\s+/g, '-')}`;
      const url = 'http://host.docker.internal:9002/api/cache';

      const response = await fetch(url, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_CACHE_SERVER_KEY}`,
        },
        body: JSON.stringify({
          query: prompt,
          cacheKey: cacheKey
        }),
      });

      const data: CacheApiResponse = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error || `API Error: ${response.status} - ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      if (data.answer) {
        return { avatarDataUri: data.answer };
      }
      
      throw new Error("Invalid response format from cache server for avatar generation.");

    } catch (error) {
        console.error("Error calling cache server for avatar generation:", error);
        return { 
            avatarDataUri: 'https://placehold.co/128x128.png',
            isFallback: true,
        };
    }
  }
);
