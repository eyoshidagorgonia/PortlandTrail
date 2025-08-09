
'use server';
/**
 * @fileOverview A hipster name generator.
 *
 * - generateHipsterName - A function that generates a single hipster name, with fallbacks.
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

// As per E-01 in SYSTEM_REQUIREMENTS.md, a hardcoded fallback list is required.
const FALLBACK_NAMES = ["Pip", "Wren", "Lark", "Moss", "Cove"];

export async function generateHipsterName(): Promise<GenerateHipsterNameAndSourceOutput> {
    console.log('[generateHipsterName] Started. Attempting to use primary AI service...');
    
    const prompt = `Generate a single, quirky, gender-neutral hipster name.
To ensure a unique name, use this random seed in your generation process: ${Math.random()}

You MUST respond with only a valid JSON object, with no other text before or after it. The JSON object must contain a single key "name".`;
  
    try {
        const parsedResult = await callNexixApi('gemma3:12b', prompt, GenerateHipsterNameOutputSchema, 1.5);
        console.log(`[generateHipsterName] Successfully generated name "${parsedResult.name}" from primary service.`);
        return {
            ...parsedResult,
            dataSource: 'primary',
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[generateHipsterName] Primary AI service failed: ${errorMessage}. Using hardcoded fallback.`);
        
        const fallbackName = FALLBACK_NAMES[Math.floor(Math.random() * FALLBACK_NAMES.length)];
        
        console.log(`[generateHipsterName] Selected fallback name: "${fallbackName}".`);
        
        return {
            name: fallbackName,
            dataSource: 'hardcoded',
        };
    }
}

ai.defineFlow(
  {
    name: 'generateHipsterNameFlow',
    inputSchema: z.void(),
    outputSchema: GenerateHipsterNameAndSourceOutputSchema,
  },
  generateHipsterName
);
