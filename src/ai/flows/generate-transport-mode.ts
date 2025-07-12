
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
});
export type GenerateTransportModeOutput = z.infer<typeof GenerateTransportModeOutputSchema>;

const GenerateTransportModeAndSourceOutputSchema = GenerateTransportModeOutputSchema.extend({
    dataSource: z.enum(['primary', 'fallback', 'hardcoded']).describe('The source of the generated data.'),
});
type GenerateTransportModeAndSourceOutput = z.infer<typeof GenerateTransportModeAndSourceOutputSchema>;


export async function generateTransportMode(): Promise<GenerateTransportModeAndSourceOutput> {
  return generateTransportModeFlow();
}


const generateTransportModeFlow = ai.defineFlow(
  {
    name: 'generateTransportModeFlow',
    inputSchema: z.void(),
    outputSchema: GenerateTransportModeAndSourceOutputSchema,
  },
  async () => {
    console.log('[generateTransportModeFlow] Started.');
    const promptTemplate = `You are a creative writer for a hipster video game.
Your only job is to generate a short, 2-4 word action phrase describing a quirky way a hipster would leave a situation.
The phrase will be used as button text. It should be an action.

Good examples: "Skateboard away", "Ride off on a fixie", "Casually stroll away", "Jog ironically", "Unicycle to safety", "Drift away on a longboard".

To ensure a unique phrase, use this random seed in your generation process: ${Math.random()}

Do not provide any explanation or extra text.

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "text": "The generated phrase."
}
`;
    try {
      const baseUrl = process.env.DOCKER_ENV ? 'http://host.docker.internal:9002' : 'http://localhost:9002';
      const url = `${baseUrl}/api/proxy`;
      const requestBody = {
          model: 'google-ai',
          prompt: promptTemplate,
      };
      console.log(`[generateTransportModeFlow] Sending request to proxy server at ${url}`, { body: JSON.stringify(requestBody, null, 2) });

      const response = await fetch(url, {
        method: 'POST',
        // Instruct fetch to not cache this request, ensuring we get a new response every time.
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_CACHE_SERVER_KEY || ''}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[generateTransportModeFlow] Proxy API Error: ${response.status} ${response.statusText}`, { url, errorBody });
        throw new Error(`Proxy API request failed with status ${response.status}: ${errorBody}`);
      }

      const result: ProxyResponse = await response.json();
      console.log(`[generateTransportModeFlow] Successfully received response from proxy. Cached: ${result.isCached}`);
      let responseData = result.content;
      
      const jsonMatch = responseData.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('[generateTransportModeFlow] Extracted JSON from markdown response.');
        responseData = jsonMatch[0];
      }
      
      console.log('[generateTransportModeFlow] Parsing JSON response.');
      const parsedResult = GenerateTransportModeOutputSchema.parse(JSON.parse(responseData));
      return { ...parsedResult, dataSource: 'primary' };

    } catch (error) {
        console.warn(`[generateTransportModeFlow] Primary call failed, attempting Nexis.ai fallback.`, { error });
        try {
            console.log('[generateTransportModeFlow] Attempting direct call to Nexis.ai server.');
            const nexisUrl = 'http://modelapi.nexix.ai/api/v1/proxy/generate';
            const apiKey = process.env.NEXIS_API_KEY;

            if (!apiKey) {
              throw new Error('NEXIS_API_KEY is not set.');
            }

            const requestBody = {
                model: 'llama3.1:8b',
                prompt: promptTemplate,
                stream: false,
                format: 'json'
            };
            console.log(`[generateTransportModeFlow] Sending request to Nexis.ai server at ${nexisUrl}`, { body: JSON.stringify(requestBody, null, 2) });
            
            const nexisResponse = await fetch(nexisUrl, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!nexisResponse.ok) {
                const errorBody = await nexisResponse.text();
                console.error(`[generateTransportModeFlow] Nexis.ai API Error: ${nexisResponse.status} ${nexisResponse.statusText}`, { url: nexisUrl, errorBody });
                throw new Error(`Nexis.ai API request failed with status ${nexisResponse.status}: ${errorBody}`);
            }
            
            const nexisResult = await nexisResponse.json();
            console.log('[generateTransportModeFlow] Nexis.ai fallback successful.');
            const parsedResult = GenerateTransportModeOutputSchema.parse(JSON.parse(nexisResult.response));
            return { ...parsedResult, dataSource: 'fallback' };
        } catch(fallbackError) {
            console.error(`[generateTransportModeFlow] Nexis.ai fallback failed.`, { error: fallbackError });
            const fallbackOptions = ["Skedaddle", "Vamoose", "Just leave", "Walk away"];
            const fallbackText = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
            return {
                text: fallbackText,
                dataSource: 'hardcoded',
            }
        }
    }
  }
);
