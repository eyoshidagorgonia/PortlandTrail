
'use server';
/**
 * @fileOverview A hipster name generator using a local Ollama server.
 *
 * - generateHipsterName - A function that generates a single hipster name.
 * - GenerateHipsterNameOutput - The return type for the generateHipsterName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateHipsterNameOutputSchema = z.object({
  name: z.string().describe('A single, quirky, gender-neutral hipster name.'),
});
export type GenerateHipsterNameOutput = z.infer<typeof GenerateHipsterNameOutputSchema>;

const GenerateHipsterNameAndSourceOutputSchema = GenerateHipsterNameOutputSchema.extend({
    dataSource: z.enum(['primary', 'hardcoded']).describe('The source of the generated data.'),
});
type GenerateHipsterNameAndSourceOutput = z.infer<typeof GenerateHipsterNameAndSourceOutputSchema>;


export async function generateHipsterName(): Promise<GenerateHipsterNameAndSourceOutput> {
  return generateHipsterNameFlow();
}

const generateHipsterNameFlow = ai.defineFlow(
  {
    name: 'generateHipsterNameFlow',
    inputSchema: z.void(),
    outputSchema: GenerateHipsterNameAndSourceOutputSchema,
  },
  async () => {
    console.log('[generateHipsterNameFlow] Started.');
    const prompt = `Generate a single, quirky, gender-neutral hipster name. Examples: River, Kale, Birch, Pip, Wren. Do not include any other text or punctuation. Just the name.`;
    
    try {
      const url = 'https://modelapi.nexix.ai/api/v1/chat/completions';
      const apiKey = process.env.NEXIX_API_KEY;

      if (!apiKey) {
        throw new Error('NEXIX_API_KEY is not set for generateHipsterNameFlow.');
      }
      
      const requestBody = {
        model: 'gemma:2b', // Using a smaller model for this simple task.
        messages: [{ role: 'user', content: prompt }],
        temperature: 1.5, // Increase creativity
      };
      console.log(`[generateHipsterNameFlow] Sending request to OpenAI-compatible endpoint at ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[generateHipsterNameFlow] API Error: ${response.status} ${response.statusText}`, { url, errorBody });
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
      }
      
      const result = await response.json();
      console.log(`[generateHipsterNameFlow] Successfully received response from endpoint.`);

      const nameContent = result.choices[0]?.message?.content;
      if (!nameContent) {
        throw new Error('Invalid response structure from API. Content is missing.');
      }

      // Clean up the response to get just the name.
      const cleanedName = nameContent.trim().replace(/["\.]/g, '');

      return {
        name: cleanedName,
        dataSource: 'primary',
      };

    } catch (error) {
        console.error(`[generateHipsterNameFlow] Call failed. Returning hard-coded name.`, { error });
        const fallbackNames = ["Pip", "Wren", "Lark", "Moss", "Cove"];
        const randomName = fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
        return {
            name: randomName,
            dataSource: 'hardcoded',
        }
    }
  }
);
