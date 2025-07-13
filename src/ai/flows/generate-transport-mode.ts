
'use server';
/**
 * @fileOverview A generator for hipster modes of transportation.
 *
 * - generateTransportMode - A function that generates a single quirky mode of transport.
 * - GenerateTransportModeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

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
    const promptTemplate = `You are a creative writer for a hipster video game.
Your only job is to generate a short, 2-4 word action phrase describing a quirky way a hipster would leave a situation.
The phrase will be used as button text. It should be an action. You MUST generate a different phrase each time.

Good examples: "Skateboard away", "Ride off on a fixie", "Casually stroll away", "Jog ironically", "Unicycle to safety", "Drift away on a longboard", "Fade into the mist", "Catch a passing bird", "Summon a vintage scooter".

To ensure a unique phrase, use this random seed in your generation process: ${Math.random()}

Do not provide any explanation or extra text.

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "text": "The generated phrase."
}
`;
    try {
      const url = 'https://modelapi.nexix.ai/api/v1/chat/completions';
      const apiKey = process.env.NEXIX_API_KEY;

      if (!apiKey) {
        throw new Error('NEXIX_API_KEY is not set for generateTransportModeFlow.');
      }
      
      const requestBody = {
          model: 'gemma3:12b',
          messages: [{ role: 'user', content: promptTemplate }],
      };
      console.log(`[generateTransportModeFlow] Sending request to OpenAI-compatible endpoint at ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        // Instruct fetch to not cache this request, ensuring we get a new response every time.
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[generateTransportModeFlow] API Error: ${response.status} ${response.statusText}`, { url, errorBody });
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
      }

      const result = await response.json();
      console.log(`[generateTransportModeFlow] Successfully received response from endpoint.`);

      const transportContent = result.choices[0]?.message?.content;
      if (!transportContent) {
        throw new Error('Invalid response structure from API.');
      }

      const parsedResult = GenerateTransportModeOutputSchema.parse(JSON.parse(transportContent));
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
