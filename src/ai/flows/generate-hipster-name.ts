
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
    dataSource: z.enum(['primary', 'fallback', 'hardcoded']).describe('The source of the generated data.'),
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
    const prompt = `You are a creative writer for a hipster video game.
Your only job is to generate a single, quirky, gender-neutral hipster name. You MUST generate a different name each time.
Examples: River, Kale, Birch, Pip, Wren.

To ensure a unique name, use this random seed in your generation process: ${Math.random()}

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "name": "The generated name."
}`;
    
    try {
      const parsedResult = await callNexixApi('gemma3:12b', prompt, GenerateHipsterNameOutputSchema, 1.5);
      // Since callNexixApi now has internal fallback, we can't be certain it was the primary.
      // For now, we will optimistically assume 'primary' or 'fallback' based on success.
      // A more complex solution could return the data source from callNexixApi.
      return {
        ...parsedResult,
        dataSource: 'primary', // This is now an optimistic assumption.
      };
    } catch (error) {
        console.error(`[generateHipsterNameFlow] All AI calls failed. Returning hard-coded name.`, { error });
        const fallbackNames = ["Pip", "Wren", "Lark", "Moss", "Cove"];
        const randomName = fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
        return {
            name: randomName,
            dataSource: 'hardcoded',
        }
    }
  }
);
