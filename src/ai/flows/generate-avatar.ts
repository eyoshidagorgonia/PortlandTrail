'use server';
/**
 * @fileOverview An avatar generator for the Portland Trail game.
 *
 * - generateAvatar - A function that generates a player avatar.
 * - GenerateAvatarInput - The input type for the generateAvatar function.
 * - GenerateAvatarOutput - The return type for the generateAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the shape of the expected response from the API cache server
interface ProxyResponse {
    content: string;
    isCached: boolean;
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
        const errorBody = await response.text();
        console.error(`[generateAvatarFlow] Proxy API Error: ${response.status} ${response.statusText}`, { url, errorBody });
        throw new Error(`Proxy API request failed with status ${response.status}: ${errorBody}`);
      }
      
      const result: ProxyResponse = await response.json();
      return { avatarDataUri: result.content };

    } catch (error) {
        console.warn(`[generateAvatarFlow] Proxy call failed, attempting direct AI call. Error: ${error instanceof Error ? error.message : String(error)}`);
        try {
            const {media} = await ai.generate({
                model: 'googleai/gemini-2.0-flash-preview-image-generation',
                prompt: prompt,
                config: {
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            });
            return {
                avatarDataUri: media.url,
                isFallback: true,
            };
        } catch(fallbackError) {
            console.error(`[generateAvatarFlow] Direct AI call for avatar failed after proxy failure. Error: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
            return { 
                avatarDataUri: 'https://placehold.co/128x128.png',
                isFallback: true,
            };
        }
    }
  }
);
