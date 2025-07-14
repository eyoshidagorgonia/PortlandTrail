
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
    const prompt = `You are a hipster name generator. Your only purpose is to generate a single, quirky, gender-neutral hipster name.
You MUST generate a different name every time. Do not repeat yourself.

Good examples: "River", "Kale", "Birch", "Pip", "Wren", "Lark", "Moss", "Cove", "Finch", "Sage", "Indigo", "Juniper", "Rowan", "Linden".
Bad examples to avoid: "Sawyer", "Jasper", "Ezra", "Milo".

Do not provide any explanation or extra text.

To ensure a unique name, use this random seed in your generation process: ${Math.random()}

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "name": "The generated name"
}`;
    try {
      const url = 'https://modelapi.nexix.ai/api/v1/chat/completions';
      const apiKey = process.env.NEXIX_API_KEY;

      if (!apiKey) {
        throw new Error('NEXIX_API_KEY is not set for generateHipsterNameFlow.');
      }
      
      const requestBody = {
        model: 'gemma3:12b',
        messages: [{ role: 'user', content: prompt }],
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

      let nameContent = result.choices[0]?.message?.content;
      if (!nameContent) {
        throw new Error('Invalid response structure from API. Content is missing.');
      }

      // The AI sometimes returns the JSON as a string inside the content string.
      try {
        const parsedResult = GenerateHipsterNameOutputSchema.parse(JSON.parse(nameContent));
        return { ...parsedResult, dataSource: 'primary' };
      } catch (e) {
          console.log("[generateHipsterNameFlow] Failed to parse directly, checking for escaped JSON", e);
          // It might be a stringified JSON within a string.
          if (nameContent.startsWith('"') && nameContent.endsWith('"')) {
            nameContent = JSON.parse(nameContent);
          }
          const parsedResult = GenerateHipsterNameOutputSchema.parse(JSON.parse(nameContent));
          return { ...parsedResult, dataSource: 'primary' };
      }

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
