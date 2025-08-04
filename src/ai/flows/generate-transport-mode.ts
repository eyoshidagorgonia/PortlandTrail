
'use server';
/**
 * @fileOverview A generator for hipster modes of transportation.
 *
 * - generateTransportMode - A function that generates a single quirky mode of transport.
 * - GenerateTransportModeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { callNexixApi } from '@/ai/nexix-api';

const GenerateTransportModeOutputSchema = z.object({
  text: z.string().describe('A 2-4 word phrase for a button describing a quirky way to leave a situation.'),
});
export type GenerateTransportModeOutput = z.infer<typeof GenerateTransportModeOutputSchema>;

const GenerateTransportModeAndSourceOutputSchema = GenerateTransportModeOutputSchema.extend({
    dataSource: z.enum(['primary', 'hardcoded']).describe('The source of the generated data.'),
});
type GenerateTransportModeAndSourceOutput = z.infer<typeof GenerateTransportModeAndSourceOutputSchema>;


export async function generateTransportMode(): Promise<GenerateTransportModeAndSourceOutput> {
    console.log('[generateTransportMode] Started.');
    try {
        const prompt = `Generate a short, 2-4 word action phrase describing a quirky way a hipster would leave a situation.
To ensure a unique phrase, use this random seed in your generation process: ${Math.random()}

You MUST respond with only a valid JSON object, with no other text before or after it. The JSON object must contain a single key "text".`;

      const parsedResult = await callNexixApi('gemma3:12b', prompt, GenerateTransportModeOutputSchema);
      return { ...parsedResult, dataSource: 'primary' };
    } catch (error) {
        console.error(`[generateTransportMode] AI call failed.`, { error });
        const fallbackOptions = ["Skedaddle", "Vamoose", "Just leave", "Walk away"];
        const fallbackText = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
        return {
            text: fallbackText,
            dataSource: 'hardcoded',
        }
    }
}


ai.defineFlow(
  {
    name: 'generateTransportModeFlow',
    inputSchema: z.void(),
    outputSchema: GenerateTransportModeAndSourceOutputSchema,
  },
  generateTransportMode
);
