'use server';
/**
 * @fileOverview A badge image generator for the Portland Trail game.
 *
 * - generateBadgeImage - A function that generates an image for a game badge.
 * - GenerateBadgeImageInput - The input type for the generateBadgeImage function.
 * - GenerateBadgeImageOutput - The return type for the generateBadgeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the shape of the expected response from the API cache server
type CacheResponse = {
    source: 'cache' | 'model' | 'error';
    data?: { response: string };
    error?: string;
    details?: any;
}

const GenerateBadgeImageInputSchema = z.object({
  prompt: z.string().describe('A short prompt describing the badge to generate.'),
});
export type GenerateBadgeImageInput = z.infer<typeof GenerateBadgeImageInputSchema>;

const GenerateBadgeImageOutputSchema = z.object({
  imageDataUri: z.string().describe("A generated image for the badge, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  isFallback: z.boolean().optional().describe('Indicates if the returned data is a fallback due to an error.'),
});
export type GenerateBadgeImageOutput = z.infer<typeof GenerateBadgeImageOutputSchema>;

export async function generateBadgeImage(input: GenerateBadgeImageInput): Promise<GenerateBadgeImageOutput> {
  return generateBadgeImageFlow(input);
}

const generateBadgeImageFlow = ai.defineFlow(
  {
    name: 'generateBadgeImageFlow',
    inputSchema: GenerateBadgeImageInputSchema,
    outputSchema: GenerateBadgeImageOutputSchema,
  },
  async ({prompt}) => {
    try {
        const fullPrompt = `A small, circular, embroidered patch-style merit badge for a video game. The badge depicts: ${prompt}. The style should be slightly quirky and vintage, with a 16-bit pixel art aesthetic.`;
        const url = 'http://host.docker.internal:9002/api/cache';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain',
              'x-api-key': process.env.API_CACHE_SERVER_KEY || '',
              'x-cache-model': 'google-ai',
            },
            body: fullPrompt,
          });
          
          const result: CacheResponse = await response.json();

          if (!response.ok || result.source === 'error') {
            const errorMessage = result.error || `API Error: ${response.status} - ${response.statusText}`;
            throw new Error(errorMessage);
          }

          if (result.data?.response) {
            return { imageDataUri: result.data.response };
          }

          throw new Error("Invalid response format from cache server for badge image generation.");

    } catch (error) {
        console.error("Error calling cache server for badge image:", error);
        // Return a placeholder image on error
        return { 
            imageDataUri: 'https://placehold.co/64x64.png',
            isFallback: true,
        };
    }
  }
);
