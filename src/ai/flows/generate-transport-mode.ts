
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
    const prompt = `You are a creative writer for a hipster video game.
Your only job is to generate a short, 2-4 word action phrase describing a quirky way a hipster would leave a situation.
The phrase will be used as button text. It should be an action. You MUST generate a different phrase each time.

Good examples: "Skateboard away", "Ride off on a fixie", "Casually stroll away", "Jog ironically", "Unicycle to safety", "Drift away on a longboard", "Fade into the mist", "Catch a passing bird", "Summon a vintage scooter".

To ensure a unique phrase, use this random seed in your generation process: ${Math.random()}

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "text": "The generated phrase."
}`;
    try {
      const parsedResult = await callNexixApi('gemma3:12b', prompt, GenerateTransportModeOutputSchema);
      return { ...parsedResult, dataSource: 'primary' };

    } catch (error) {
        console.error(`[generateTransportModeFlow] Call failed.`, { error });
        const fallbackOptions = ["Skedaddle", "Vamoose", "Just leave", "Walk away"];
        const fallbackText = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
        return {
            text: fallbackText,
            dataSource: 'hardcoded',
        }
    }
  }
);
