
'use server';
/**
 * @fileOverview A badge image generator for the Portland Trail game.
 *
 * - generateBadgeImage - A function that generates an image for a game badge.
 * - GenerateBadgeImageInput - The input type for the generateBadgeImage function.
 * - GenerateBadgeImageOutput - The return type for the generateBadgeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the shape of the expected response from the API cache server
interface ProxyResponse {
    content: string;
    isCached: boolean;
    error?: string;
  }

const GenerateBadgeImageInputSchema = z.object({
  prompt: z.string().describe('A short prompt describing the badge to generate.'),
});
export type GenerateBadgeImageInput = z.infer<typeof GenerateBadgeImageInputSchema>;

const GenerateBadgeImageOutputSchema = z.object({
  imageDataUri: z.string().describe("A generated image for the badge, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  dataSource: z.enum(['primary', 'fallback', 'hardcoded']).describe('The source of the generated data.'),
});
export type GenerateBadgeImageOutput = z.infer<typeof GenerateBadgeImageOutputSchema>;

// A stock of hardcoded fallback images for when all systems fail.
const FALLBACK_BADGES = [
    'https://placehold.co/64x64/E91E63/FFFFFF.png', // Pink
    'https://placehold.co/64x64/9C27B0/FFFFFF.png', // Purple
    'https://placehold.co/64x64/3F51B5/FFFFFF.png', // Indigo
    'https://placehold.co/64x64/FF9800/FFFFFF.png', // Orange
];

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
    console.log(`[generateBadgeImageFlow] Started for prompt: "${prompt}"`);
    const fullPrompt = `A small, circular, embroidered patch-style merit badge for a video game. The badge depicts: ${prompt}. The style should be slightly quirky and vintage, with a 16-bit pixel art aesthetic.`;
    console.log(`[generateBadgeImageFlow] Generated full prompt: "${fullPrompt}"`);
    try {
        const baseUrl = process.env.DOCKER_ENV ? 'http://host.docker.internal:9002' : 'http://localhost:9002';
        const url = `${baseUrl}/api/proxy`;
        const requestBody = {
            model: 'google-ai',
            prompt: fullPrompt,
        };
        console.log(`[generateBadgeImageFlow] Sending request to proxy server at ${url}`, { body: JSON.stringify(requestBody, null, 2) });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.API_CACHE_SERVER_KEY || ''}`
            },
            body: JSON.stringify(requestBody),
          });
          
          if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[generateBadgeImageFlow] Proxy API Error: ${response.status} ${response.statusText}`, { url, errorBody });
            throw new Error(`Proxy API request failed with status ${response.status}: ${errorBody}`);
          }
          
          const result: ProxyResponse = await response.json();
          console.log(`[generateBadgeImageFlow] Successfully received response from proxy. Cached: ${result.isCached}`);
          return { imageDataUri: result.content, dataSource: 'primary' };

    } catch (error) {
        console.warn(`[generateBadgeImageFlow] Primary call failed, attempting direct AI call as fallback.`, { error });
        try {
            console.log('[generateBadgeImageFlow] Attempting direct call to image generation model.');
            const {media} = await ai.generate({
                model: 'googleai/gemini-2.0-flash-preview-image-generation',
                prompt: fullPrompt,
                config: {
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            });
            console.log('[generateBadgeImageFlow] Direct AI call successful.');
            return {
                imageDataUri: media.url,
                dataSource: 'fallback',
            };
        } catch(fallbackError) {
            console.error(`[generateBadgeImageFlow] Direct AI call for badge image failed after primary failure.`, { error: fallbackError });
            console.log('[generateBadgeImageFlow] Returning hardcoded placeholder image.');
            const fallbackImage = FALLBACK_BADGES[Math.floor(Math.random() * FALLBACK_BADGES.length)];
            return { 
                imageDataUri: fallbackImage,
                dataSource: 'hardcoded',
            };
        }
    }
  }
);
