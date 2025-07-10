'use server';
/**
 * @fileOverview A generator for hipster modes of transportation.
 *
 * - generateTransportMode - A function that generates a single quirky mode of transport.
 * - GenerateTransportModeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

type CacheResponse = {
    source: 'cache' | 'model' | 'error';
    data?: { response: string };
    error?: string;
    details?: any;
}

const GenerateTransportModeOutputSchema = z.object({
  text: z.string().describe('A 2-4 word phrase for a button describing a quirky way to leave a situation.'),
  isFallback: z.boolean().optional().describe('Indicates if the returned data is a fallback due to an error.'),
});
export type GenerateTransportModeOutput = z.infer<typeof GenerateTransportModeOutputSchema>;

export async function generateTransportMode(): Promise<GenerateTransportModeOutput> {
  return generateTransportModeFlow();
}

const promptTemplate = `You are a creative writer for a hipster video game.
Your only job is to generate a short, 2-4 word action phrase describing a quirky way a hipster would leave a situation.
The phrase will be used as button text. It should be an action.

Good examples: "Skateboard away", "Ride off on a fixie", "Casually stroll away", "Jog ironically", "Unicycle to safety", "Drift away on a longboard".

Do not provide any explanation or extra text.

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "text": "The generated phrase."
}
`;

const generateTransportModeFlow = ai.defineFlow(
  {
    name: 'generateTransportModeFlow',
    inputSchema: z.void(),
    outputSchema: GenerateTransportModeOutputSchema,
  },
  async () => {
    try {
      const url = 'http://host.docker.internal:9002/api/cache';

      const response = await fetch(url, {
        method: 'POST',
        // Instruct fetch to not cache this request, ensuring we get a new response every time.
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            apiKey: process.env.API_CACHE_SERVER_KEY || '',
            model: 'ollama',
            prompt: promptTemplate,
            options: {
                ignoreCache: true,
            }
        }),
      });

      const result: CacheResponse = await response.json();

      if (!response.ok || result.source === 'error') {
        const errorMessage = result.error || `API Error: ${response.status} - ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      let responseText = result.data?.response;
      if (!responseText) {
        throw new Error("No response data from cache server for transport mode.");
      }

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }
      
      const parsedResult = JSON.parse(responseText);
      
      return GenerateTransportModeOutputSchema.parse(parsedResult);

    } catch (error) {
        console.error("Error calling cache server for transport mode generation:", error);
        const fallbackOptions = ["Skedaddle", "Vamoose", "Just leave", "Walk away"];
        const fallbackText = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
        return {
            text: fallbackText,
            isFallback: true,
        }
    }
  }
);
