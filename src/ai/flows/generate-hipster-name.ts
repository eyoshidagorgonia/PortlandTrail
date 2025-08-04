
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
    console.log('[generateHipsterName] Started.');
    
    const prompt = `Generate a single, quirky, gender-neutral hipster name.
To ensure a unique name, use this random seed in your generation process: ${Math.random()}

You MUST respond with only a valid JSON object, with no other text before or after it. The JSON object must contain a single key "name".`;
  
    const parsedResult = await callNexixApi('gemma3:12b', prompt, GenerateHipsterNameOutputSchema, 1.5);
    return {
        ...parsedResult,
        dataSource: 'primary',
    };
}

ai.defineFlow(
  {
    name: 'generateHipsterNameFlow',
    inputSchema: z.void(),
    outputSchema: GenerateHipsterNameAndSourceOutputSchema,
  },
  generateHipsterName
);
