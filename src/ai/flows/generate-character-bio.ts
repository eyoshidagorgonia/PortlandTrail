'use server';
/**
 * @fileOverview A character bio generator for the Portland Trail game.
 *
 * - generateCharacterBio - A function that generates a short character bio.
 * - GenerateCharacterBioInput - The input type for the generateCharacterBio function.
 * - GenerateCharacterBioOutput - The return type for the generateCharacterBio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCharacterBioInputSchema = z.object({
  name: z.string().describe('The name of the character.'),
  job: z.string().describe('The job of the character.'),
});
export type GenerateCharacterBioInput = z.infer<typeof GenerateCharacterBioInputSchema>;

const GenerateCharacterBioOutputSchema = z.object({
  bio: z.string().describe('A short, 1-2 sentence, quirky bio for the character in the third person.'),
});
export type GenerateCharacterBioOutput = z.infer<typeof GenerateCharacterBioOutputSchema>;

export async function generateCharacterBio(input: GenerateCharacterBioInput): Promise<GenerateCharacterBioOutput> {
  return generateCharacterBioFlow(input);
}

const promptTemplate = `You are a character bio writer for a quirky video game.
You will be given a character's name and job.
Based on this, write a short, 1-2 sentence bio for them in a witty, third-person voice.
The bio should capture a hipster or artisanal vibe. Do not use the character's name in the bio.

Character Name: {name}
Character Job: {job}

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "bio": "The generated bio."
}
`;

const generateCharacterBioFlow = ai.defineFlow(
  {
    name: 'generateCharacterBioFlow',
    inputSchema: GenerateCharacterBioInputSchema,
    outputSchema: GenerateCharacterBioOutputSchema,
  },
  async ({ name, job }) => {
    const prompt = promptTemplate
      .replace('{name}', name)
      .replace('{job}', job);

    try {
      const response = await fetch('http://host.docker.internal:11434/api/generate', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3:latest',
          prompt: prompt,
          stream: false,
          format: 'json',
          options: {
            seed: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
          }
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Ollama API error response:', errorBody);
        throw new Error(`Ollama API request failed with status ${response.status}`);
      }
      
      const ollamaResponse = await response.json();
      let responseText = ollamaResponse.response;

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }
      
      const result = JSON.parse(responseText);
      
      return GenerateCharacterBioOutputSchema.parse(result);

    } catch (error) {
        console.error("Error calling Ollama for bio generation.", error);
        // Provide a fallback bio
        return {
            bio: "They believe their artisanal pickles can change the world, one jar at a time."
        }
    }
  }
);
