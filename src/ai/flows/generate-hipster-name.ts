
'use server';
/**
 * @fileOverview A hipster name generator using a local Ollama server.
 *
 * - generateHipsterName - A function that generates a single hipster name.
 * - GenerateHipsterNameOutput - The return type for the generateHipsterName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the shape of the expected response from the API cache server
interface ProxyResponse {
  content: string;
  isCached: boolean;
  error?: string;
}

const GenerateHipsterNameOutputSchema = z.object({
  name: z.string().describe('A single, quirky, gender-neutral hipster name.'),
});
export type GenerateHipsterNameOutput = z.infer<typeof GenerateHipsterNameOutputSchema>;

const GenerateHipsterNameAndSourceOutputSchema = GenerateHipsterNameOutputSchema.extend({
    dataSource: z.enum(['primary', 'fallback', 'hardcoded']).describe('The source of the generated data.'),
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
    const promptTemplate = `You are a hipster name generator. Your only purpose is to generate a single, quirky, gender-neutral hipster name.
You MUST generate a different name every time. Do not repeat yourself.

Good examples: "River", "Kale", "Birch", "Pip", "Wren", "Lark", "Moss", "Cove", "Finch", "Sage", "Indigo", "Juniper", "Rowan", "Linden".
Bad examples to avoid: "Sawyer", "Jasper", "Ezra", "Milo".

Do not provide any explanation or extra text.

To ensure a unique name, use this random seed in your generation process: ${Math.random()}

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "name": "The generated name"
}
`;
    try {
      const baseUrl = process.env.DOCKER_ENV ? 'http://host.docker.internal:9001' : 'http://localhost:9001';
      const url = `${baseUrl}/api/proxy`;
      const requestBody = {
          service: 'ollama',
          model: 'gemma3:12b',
          prompt: promptTemplate,
      };
      console.log(`[generateHipsterNameFlow] Sending request to proxy server at ${url}`, { body: JSON.stringify(requestBody, null, 2) });

      const response = await fetch(url, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXIX_API_KEY || ''}`
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[generateHipsterNameFlow] Proxy API Error: ${response.status} ${response.statusText}`, { url, errorBody });
        throw new Error(`Proxy API request failed with status ${response.status}: ${errorBody}`);
      }
      
      const result: ProxyResponse = await response.json();
      console.log(`[generateHipsterNameFlow] Successfully received response from proxy. Cached: ${result.isCached}`);
      let responseData = result.content;
      
      const jsonMatch = responseData.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('[generateHipsterNameFlow] Extracted JSON from markdown response.');
        responseData = jsonMatch[0];
      }
      
      console.log('[generateHipsterNameFlow] Parsing JSON response.');
      const parsedResult = GenerateHipsterNameOutputSchema.parse(JSON.parse(responseData));
      
      return { ...parsedResult, dataSource: 'primary' };

    } catch (error) {
        console.warn(`[generateHipsterNameFlow] Primary call failed, attempting Nexix.ai fallback.`, { error });
        try {
          console.log('[generateHipsterNameFlow] Attempting direct call to Nexix.ai server.');
          const nexixUrl = 'http://modelapi.nexix.ai/api/v1/proxy/generate';
          const apiKey = process.env.NEXIX_API_KEY;

          if (!apiKey) {
            throw new Error('NEXIX_API_KEY is not set.');
          }

          const requestBody = {
            model: 'gemma3:12b',
            prompt: promptTemplate,
            stream: false,
            format: 'json',
          };
          console.log(`[generateHipsterNameFlow] Sending request to Nexix.ai server at ${nexixUrl}`, { body: JSON.stringify(requestBody, null, 2) });

          const nexixResponse = await fetch(nexixUrl, {
            method: 'POST',
            cache: 'no-store',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (!nexixResponse.ok) {
            const errorBody = await nexixResponse.text();
            console.error(`[generateHipsterNameFlow] Nexix.ai API Error: ${nexixResponse.status} ${nexixResponse.statusText}`, { url: nexixUrl, errorBody });
            throw new Error(`Nexix.ai API request failed with status ${nexixResponse.status}: ${errorBody}`);
          }

          const nexixResult = await nexixResponse.json();
          console.log('[generateHipsterNameFlow] Nexix.ai fallback successful.');
          
          const parsedResult = GenerateHipsterNameOutputSchema.parse(JSON.parse(nexixResult.response));

          return { ...parsedResult, dataSource: 'fallback' };
        } catch (fallbackError) {
          console.error(`[generateHipsterNameFlow] Fallback call to Nexix.ai also failed. Returning hard-coded name.`, { error: fallbackError });
          const fallbackNames = ["Pip", "Wren", "Lark", "Moss", "Cove"];
          const randomName = fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
          return {
              name: randomName,
              dataSource: 'hardcoded',
          }
        }
    }
  }
);
