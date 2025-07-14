
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
    const prompt = `You are a creative writer for a hipster video game.
Your only job is to generate a single, quirky, gender-neutral hipster name.
Examples: River, Kale, Birch, Pip, Wren.

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "name": "The generated name."
}`;
    
    try {
      const apiResponse = await callNexixApi('deepseek-r1:8b', prompt, 1.5);
      
      let parsedResult;
      try {
        parsedResult = GenerateHipsterNameOutputSchema.parse(JSON.parse(apiResponse));
      } catch (e) {
        console.warn("[generateHipsterNameFlow] Failed to parse directly, attempting to unescape and parse again.", { error: e });
        const unescapedResponse = JSON.parse(apiResponse);
        parsedResult = GenerateHipsterNameOutputSchema.parse(JSON.parse(unescapedResponse));
      }

      return {
        ...parsedResult,
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
