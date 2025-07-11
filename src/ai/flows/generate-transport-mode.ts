'use server';
/**
 * @fileOverview A generator for hipster modes of transportation.
 *
 * - generateTransportMode - A function that generates a single quirky mode of transport.
 * - GenerateTransportModeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

interface ProxyResponse {
    content: string;
    isCached: boolean;
    error?: string;
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
    console.log('[generateTransportModeFlow] Started.');
    try {
      const baseUrl = process.env.DOCKER_ENV ? 'http://host.docker.internal:9002' : 'http://localhost:9002';
      const url = `${baseUrl}/api/proxy`;
      console.log(`[generateTransportModeFlow] Sending request to proxy server at ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        // Instruct fetch to not cache this request, ensuring we get a new response every time.
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_CACHE_SERVER_KEY || ''}`
        },
        body: JSON.stringify({
            model: 'google-ai',
            prompt: promptTemplate,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[generateTransportModeFlow] Proxy API Error: ${response.status} ${response.statusText}`, { url, errorBody });
        throw new Error(`Proxy API request failed with status ${response.status}: ${errorBody}`);
      }

      const result: ProxyResponse = await response.json();
      console.log(`[generateTransportModeFlow] Successfully received response from proxy. Cached: ${result.isCached}`);
      let responseData = result.content;
      
      // Sometimes the model returns markdown with the JSON inside, so we extract it.
      const jsonMatch = responseData.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('[generateTransportModeFlow] Extracted JSON from markdown response.');
        responseData = jsonMatch[0];
      }
      
      console.log('[generateTransportModeFlow] Parsing JSON response.');
      const parsedResult = JSON.parse(responseData);
      return GenerateTransportModeOutputSchema.parse(parsedResult);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[generateTransportModeFlow] Failed to generate transport mode. Error: ${errorMessage}. Returning fallback.`);
        const fallbackOptions = ["Skedaddle", "Vamoose", "Just leave", "Walk away"];
        const fallbackText = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
        return {
            text: fallbackText,
            isFallback: true,
        }
    }
  }
);
