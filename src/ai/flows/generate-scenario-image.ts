'use server';
/**
 * @fileOverview An image generator for scenarios in the Portland Trail game.
 *
 * - generateScenarioImage - A function that generates an image for a game scenario.
 * - GenerateScenarioImageInput - The input type for the generateScenarioImage function.
 * - GenerateScenarioImageOutput - The return type for the generateScenarioImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the shape of the expected response from the API cache server
interface CacheApiResponse {
  answer: string;
  wasCached: boolean;
  error?: string;
}

const GenerateScenarioImageInputSchema = z.object({
  prompt: z.string().describe('A short prompt describing the scene to generate.'),
});
export type GenerateScenarioImageInput = z.infer<typeof GenerateScenarioImageInputSchema>;

const GenerateScenarioImageOutputSchema = z.object({
  imageDataUri: z.string().describe("A generated image for the scenario, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  isFallback: z.boolean().optional().describe('Indicates if the returned data is a fallback due to an error.'),
});
export type GenerateScenarioImageOutput = z.infer<typeof GenerateScenarioImageOutputSchema>;

export async function generateScenarioImage(input: GenerateScenarioImageInput): Promise<GenerateScenarioImageOutput> {
  return generateScenarioImageFlow(input);
}

const generateScenarioImageFlow = ai.defineFlow(
  {
    name: 'generateScenarioImageFlow',
    inputSchema: GenerateScenarioImageInputSchema,
    outputSchema: GenerateScenarioImageOutputSchema,
  },
  async ({prompt}) => {
    try {
      const fullPrompt = `A 16-bit pixel art image for a video game that combines Diablo II with hipster culture. The scene is: ${prompt}. The style should be dark and gritty, but with a quirky, ironic twist.`;
      const cacheKey = `scenario-image-${prompt.replace(/\s+/g, '-')}`;
      const url = 'http://host.docker.internal:9002/api/cache';

      const response = await fetch(url, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_CACHE_SERVER_KEY}`,
        },
        body: JSON.stringify({
            query: fullPrompt,
            cacheKey: cacheKey
        }),
      });

      const data: CacheApiResponse = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || `API Error: ${response.status} - ${response.statusText}`;
        throw new Error(errorMessage);
      }

      if (data.answer) {
        return { imageDataUri: data.answer };
      }

      throw new Error("Invalid response format from cache server for scenario image generation.");
      
    } catch (error) {
        console.error("Error calling cache server for scenario image:", error);
        // Return a placeholder image on error
        return { 
            imageDataUri: 'https://placehold.co/500x300.png',
            isFallback: true,
        };
    }
  }
);
