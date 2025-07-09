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
      const response = await fetch('http://host.docker.internal:9002/api/generate', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_CACHE_SERVER_KEY}`,
        },
        body: JSON.stringify({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: `A 16-bit pixel art image for a video game that combines Diablo II with hipster culture. The scene is: ${prompt}. The style should be dark and gritty, but with a quirky, ironic twist.`,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('API Cache server error response:', errorBody);
        throw new Error(`API Cache server request failed with status ${response.status}`);
      }

      const result = await response.json();
      return GenerateScenarioImageOutputSchema.parse(result);
    } catch (error) {
        console.error("Error generating scenario image:", error);
        // Return a placeholder image on error
        return { 
            imageDataUri: 'https://placehold.co/500x300.png',
            isFallback: true,
        };
    }
  }
);
