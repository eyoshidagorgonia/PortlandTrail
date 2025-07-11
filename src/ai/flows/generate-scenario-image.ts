'use server';
/**
 * @fileOverview An image generator for scenarios in the Portland Trail game.
 *
 * - generateScenarioImage - A function that generates an image for a game scenario.
 * - GenerateScenarioImageInput - The input type for the generateScenarioImage function.
 * - GenerateScenarioImageOutput - The return type for the generateScenarioImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the shape of the expected response from the API cache server
type CacheResponse = {
    source: 'cache' | 'model' | 'error';
    data?: { response: string };
    error?: string;
    details?: any;
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
      const url = 'http://host.docker.internal:9001/api/cache';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            apiKey: process.env.API_CACHE_SERVER_KEY || '',
            model: 'google-ai',
            prompt: fullPrompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${response.statusText}`, errorText);
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const result: CacheResponse = await response.json();

      if (result.source === 'error') {
        const errorMessage = result.error || 'Unknown error from cache server';
        throw new Error(errorMessage);
      }

      if (result.data?.response) {
        return { imageDataUri: result.data.response };
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
