
'use server';
/**
 * @fileOverview A hipster name generator using a local Ollama server.
 *
 * - generateHipsterName - A function that generates a single hipster name.
 * - GenerateHipsterNameOutput - The return type for the generateHipsterName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { callNexixApi } from '@/ai/nexix-api';

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
      const apiResponse = await callNexixApi('gemma:2b', prompt, 1.5);
      
      // Clean up the response to get just the name.
      const cleanedName = apiResponse.trim().replace(/["\.]/g, '');

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
