
'use server';
/**
 * @fileOverview A character bio generator for the Portland Trail game.
 *
 * - generateCharacterBio - A function that generates a short character bio.
 * - GenerateCharacterBioInput - The input type for the generateCharacterBio function.
 * - GenerateCharacterBioOutput - The return type for the generateCharacterBio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the shape of the expected response from the API cache server
interface ProxyResponse {
    content: string;
    isCached: boolean;
    error?: string;
  }

const GenerateCharacterBioInputSchema = z.object({
  name: z.string().describe('The name of the character.'),
  job: z.string().describe('The job of the character.'),
  vibe: z.string().describe('The current vibe or mood of the character (e.g., "Peak Vibe", "Aesthetically Fading").'),
});
export type GenerateCharacterBioInput = z.infer<typeof GenerateCharacterBioInputSchema>;

const GenerateCharacterBioOutputSchema = z.object({
  bio: z.string().describe('A short, 1-2 sentence, quirky bio for the character in the third person.'),
});
export type GenerateCharacterBioOutput = z.infer<typeof GenerateCharacterBioOutputSchema>;

const GenerateCharacterBioAndSourceOutputSchema = GenerateCharacterBioOutputSchema.extend({
    dataSource: z.enum(['primary', 'fallback', 'hardcoded']).describe('The source of the generated data.'),
});
type GenerateCharacterBioAndSourceOutput = z.infer<typeof GenerateCharacterBioAndSourceOutputSchema>;

export async function generateCharacterBio(input: GenerateCharacterBioInput): Promise<GenerateCharacterBioAndSourceOutput> {
  return generateCharacterBioFlow(input);
}

const promptTemplate = `You are a character bio writer for a quirky video game.
You will be given a character's name, job, and current "vibe".
Based on this, write a short, 1-2 sentence bio for them in a witty, third-person voice.
The bio should capture a hipster or artisanal vibe and reflect their current state.

Character Name: {name}
Character Job: {job}
Current Vibe: {vibe}

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "bio": "The generated bio."
}
`;

const generateCharacterBioFlow = ai.defineFlow(
  {
    name: 'generateCharacterBioFlow',
    inputSchema: GenerateCharacterBioInputSchema,
    outputSchema: GenerateCharacterBioAndSourceOutputSchema,
  },
  async ({ name, job, vibe }) => {
    console.log(`[generateCharacterBioFlow] Started for character: ${name}, Job: ${job}, Vibe: ${vibe}`);
    const prompt = promptTemplate
      .replace('{name}', name)
      .replace('{job}', job)
      .replace('{vibe}', vibe);
    console.log(`[generateCharacterBioFlow] Generated prompt.`);

    try {
      const baseUrl = process.env.DOCKER_ENV ? 'http://host.docker.internal:9001' : 'http://localhost:9001';
      const url = `${baseUrl}/api/proxy`;
      const requestBody = {
          service: 'ollama',
          model: 'gemma3:12b',
          prompt: prompt,
      };
      console.log(`[generateCharacterBioFlow] Sending request to proxy server at ${url}`, { body: JSON.stringify(requestBody, null, 2) });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXIX_API_KEY || ''}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[generateCharacterBioFlow] Proxy API Error: ${response.status} ${response.statusText}`, { url, errorBody });
        throw new Error(`Proxy API request failed with status ${response.status}: ${errorBody}`);
      }
      
      const result: ProxyResponse = await response.json();
      console.log(`[generateCharacterBioFlow] Successfully received response from proxy. Cached: ${result.isCached}`);
      let responseData = result.content;
      
      const jsonMatch = responseData.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('[generateCharacterBioFlow] Extracted JSON from markdown response.');
        responseData = jsonMatch[0];
      }
      
      console.log('[generateCharacterBioFlow] Parsing JSON response.');
      const parsedResult = JSON.parse(responseData);
      return { ...GenerateCharacterBioOutputSchema.parse(parsedResult), dataSource: 'primary' };

    } catch (error) {
        console.warn(`[generateCharacterBioFlow] Primary call failed, attempting Nexix.ai fallback.`, { error });
        try {
            console.log('[generateCharacterBioFlow] Attempting direct call to Nexix.ai server.');
            const nexixUrl = 'http://modelapi.nexix.ai/api/v1/proxy/generate';
            const apiKey = process.env.NEXIX_API_KEY;
            
            if (!apiKey) {
              throw new Error('NEXIX_API_KEY is not set.');
            }

            const requestBody = {
                model: 'gemma3:12b',
                prompt: prompt,
                stream: false,
                format: 'json'
            };
            console.log(`[generateCharacterBioFlow] Sending request to Nexix.ai server at ${nexixUrl}`, { body: JSON.stringify(requestBody, null, 2) });

            const nexixResponse = await fetch(nexixUrl, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!nexixResponse.ok) {
                const errorBody = await nexixResponse.text();
                console.error(`[generateCharacterBioFlow] Nexix.ai API Error: ${nexixResponse.status} ${nexixResponse.statusText}`, { url: nexixUrl, errorBody });
                throw new Error(`Nexix.ai API request failed with status ${nexixResponse.status}: ${errorBody}`);
            }

            const nexixResult = await nexixResponse.json();
            console.log('[generateCharacterBioFlow] Nexix.ai fallback successful.');
            const parsedResult = GenerateCharacterBioOutputSchema.parse(JSON.parse(nexixResult.response));
            return { ...parsedResult, dataSource: 'fallback' };
        } catch(fallbackError) {
            console.error(`[generateCharacterBioFlow] Nexix.ai fallback failed. Returning hard-coded bio.`, { error: fallbackError });
            return {
                bio: "They believe their artisanal pickles can change the world, one jar at a time.",
                dataSource: 'hardcoded',
            }
        }
    }
  }
);
