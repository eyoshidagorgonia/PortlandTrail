
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
  dataSource: z.enum(['primary', 'fallback', 'hardcoded']).describe('The source of the generated data.'),
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
    console.log(`[generateScenarioImageFlow] Started for prompt: "${prompt}"`);
    const fullPrompt = `A 16-bit pixel art image for a video game that combines Diablo II with hipster culture. The scene is: ${prompt}. The style should be dark and gritty, but with a quirky, ironic twist.`;
    console.log(`[generateScenarioImageFlow] Generated full prompt: "${fullPrompt}"`);
    
    try {
      const baseUrl = process.env.DOCKER_ENV ? 'http://host.docker.internal:9002' : 'http://localhost:9002';
      const url = `${baseUrl}/api/proxy`;
      const requestBody = {
          model: 'google-ai',
          prompt: fullPrompt,
      };
      console.log(`[generateScenarioImageFlow] Sending request to proxy server at ${url}`, { body: JSON.stringify(requestBody, null, 2) });

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
        console.error(`[generateScenarioImageFlow] Proxy API Error: ${response.status} ${response.statusText}`, { url, errorBody });
        throw new Error(`Proxy API request failed with status ${response.status}: ${errorBody}`);
      }

      const result: ProxyResponse = await response.json();
      console.log(`[generateScenarioImageFlow] Successfully received response from proxy. Cached: ${result.isCached}`);
      return { imageDataUri: result.content, dataSource: 'primary' };
      
    } catch (error) {
        console.warn(`[generateScenarioImageFlow] Primary call failed, attempting direct AI call as fallback.`, { error });
        try {
            console.log('[generateScenarioImageFlow] Attempting direct call to image generation model.');
            const {media} = await ai.generate({
                model: 'googleai/gemini-2.0-flash-preview-image-generation',
                prompt: fullPrompt,
                config: {
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            });
            console.log('[generateScenarioImageFlow] Direct AI call successful.');
            return {
                imageDataUri: media.url,
                dataSource: 'fallback',
            };
        } catch(fallbackError) {
            console.error(`[generateScenarioImageFlow] Direct AI call for scenario image failed after primary failure.`, { error: fallbackError });
            console.log('[generateScenarioImageFlow] Returning hardcoded placeholder image.');
            return { 
                imageDataUri: 'https://placehold.co/500x300.png',
                dataSource: 'hardcoded',
            };
        }
    }
  }
);
