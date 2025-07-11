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
interface ProxyResponse {
    content: string;
    isCached: boolean;
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
            prompt: fullPrompt,
        }),
      });

      const result: ProxyResponse = await response.json();

      if (!response.ok) {
        console.error(`API Error: ${response.status} - ${response.statusText}`, result.error);
        throw new Error(result.error || `API Error: ${response.status}`);
      }

      return { imageDataUri: result.content };
      
    } catch (error) {
        console.error("Error calling proxy server for scenario image:", error);
        // Return a placeholder image on error
        return { 
            imageDataUri: 'https://placehold.co/500x300.png',
            isFallback: true,
        };
    }
  }
);
