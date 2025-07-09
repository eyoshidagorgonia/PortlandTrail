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
interface CacheApiResponse {
  answer: string;
  wasCached: boolean;
  error?: string;
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
      // Create a unique cache key for each request to ensure a new name is generated.
      const cacheKey = `hipster-name-${Date.now()}-${Math.random()}`;
      const url = 'http://host.docker.internal:9002/api/cache';

      const response = await fetch(url, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_CACHE_SERVER_KEY}`,
        },
        body: JSON.stringify({
          query: promptTemplate,
          cacheKey: cacheKey,
        }),
      });
      
      const data: CacheApiResponse = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || `API Error: ${response.status} - ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      let responseText = data.answer;

      // Sometimes the model returns markdown with the JSON inside, so we extract it.
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }
      
      const result = JSON.parse(responseText);
      
      return GenerateHipsterNameOutputSchema.parse(result);

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
