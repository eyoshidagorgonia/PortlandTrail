'use server';
/**
 * @fileOverview A hipster name generator using a local Ollama server.
 *
 * - generateHipsterName - A function that generates a single hipster name.
 * - GenerateHipsterNameOutput - The return type for the generateHipsterName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHipsterNameOutputSchema = z.object({
  name: z.string().describe('A single, quirky, gender-neutral hipster name.'),
});
export type GenerateHipsterNameOutput = z.infer<typeof GenerateHipsterNameOutputSchema>;

export async function generateHipsterName(): Promise<GenerateHipsterNameOutput> {
  return generateHipsterNameFlow();
}

const promptTemplate = `You are a hipster name generator. Your only purpose is to generate a single, quirky, gender-neutral hipster name. Examples include "River", "Kale", "Birch", "Pip".

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
      const response = await fetch('http://host.docker.internal:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemma:7b',
          prompt: promptTemplate,
          stream: false,
          format: 'json',
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Ollama API error response:', errorBody);
        throw new Error(`Ollama API request failed with status ${response.status}`);
      }
      
      const ollamaResponse = await response.json();
      let responseText = ollamaResponse.response;

      // Sometimes the model returns markdown with the JSON inside, so we extract it.
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }
      
      const result = JSON.parse(responseText);
      
      return GenerateHipsterNameOutputSchema.parse(result);

    } catch (error) {
        console.error("Error calling Ollama for name generation. This is expected in the Studio preview environment, which cannot reach a local server.", error);
        // Provide a random fallback name from a predefined list
        const fallbackNames = ["Pip", "Wren", "Lark", "Moss", "Cove"];
        const fallbackName = fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
        return {
            name: fallbackName
        }
    }
  }
);
