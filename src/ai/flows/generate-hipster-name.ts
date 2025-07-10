'use server';
/**
 * @fileOverview A hipster name generator using a local Ollama server.
 *
 * - generateHipsterName - A function that generates a single hipster name.
 * - GenerateHipsterNameOutput - The return type for the generateHipsterName function.
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

const GenerateHipsterNameOutputSchema = z.object({
  name: z.string().describe('A single, quirky, gender-neutral hipster name.'),
  isFallback: z.boolean().optional().describe('Indicates if the returned data is a fallback due to an error.'),
});
export type GenerateHipsterNameOutput = z.infer<typeof GenerateHipsterNameOutputSchema>;

export async function generateHipsterName(): Promise<GenerateHipsterNameOutput> {
  return generateHipsterNameFlow();
}

const promptTemplate = `You are a hipster name generator. Your only purpose is to generate a single, quirky, gender-neutral hipster name.
You MUST generate a different name every time. Do not repeat yourself.

Good examples: "River", "Kale", "Birch", "Pip", "Wren", "Lark", "Moss", "Cove", "Finch", "Sage".

Do not provide any explanation or extra text.

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "name": "The generated name"
}
`;

const generateHipsterNameFlow = ai.defineFlow(
  {
    name: 'generateHipsterNameFlow',
    inputSchema: z.void(),
    outputSchema: GenerateHipsterNameOutputSchema,
  },
  async () => {
    try {
      const url = 'http://host.docker.internal:9002/api/cache';

      const response = await fetch(url, {
        method: 'POST',
        // Instruct fetch to not cache this request, ensuring we get a new name every time.
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.API_CACHE_SERVER_KEY || '',
        },
        body: JSON.stringify({
            model: 'ollama',
            prompt: promptTemplate,
        }),
      });
      
      const result: CacheResponse = await response.json();

      if (!response.ok || result.source === 'error') {
        const errorMessage = result.error || `API Error: ${response.status} - ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      let responseText = result.data?.response;
      if (!responseText) {
        throw new Error("No response data from cache server.");
      }

      // Sometimes the model returns markdown with the JSON inside, so we extract it.
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }
      
      const parsedResult = JSON.parse(responseText);
      
      return GenerateHipsterNameOutputSchema.parse(parsedResult);

    } catch (error) {
        console.error("Error calling cache server for name generation:", error);
        // Provide a random fallback name from a predefined list
        const fallbackNames = ["Pip", "Wren", "Lark", "Moss", "Cove"];
        const fallbackName = fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
        return {
            name: fallbackName,
            isFallback: true,
        }
    }
  }
);
