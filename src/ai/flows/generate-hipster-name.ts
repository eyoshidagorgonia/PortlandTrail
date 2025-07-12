
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
  name: z.string().describe('A single, quirky, gender-neutral hipster name.').optional(),
  fallbackNames: z.array(z.string()).optional().describe('An array of fallback names if generation fails.'),
  isFallback: z.boolean().optional().describe('Indicates if the returned data is a fallback due to an error.'),
});
export type GenerateHipsterNameOutput = z.infer<typeof GenerateHipsterNameOutputSchema>;

export async function generateHipsterName(): Promise<GenerateHipsterNameOutput> {
  return generateHipsterNameFlow();
}

const promptTemplate = `You are a hipster name generator. Your only purpose is to generate a single, quirky, gender-neutral hipster name.
You MUST generate a different name every time. Do not repeat yourself.

Good examples: "River", "Kale", "Birch", "Pip", "Wren", "Lark", "Moss", "Cove", "Finch", "Sage".

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
    console.log('[generateHipsterNameFlow] Started.');
    try {
      const baseUrl = process.env.DOCKER_ENV ? 'http://host.docker.internal:9002' : 'http://localhost:9002';
      const url = `${baseUrl}/api/proxy`;
      const requestBody = {
          model: 'google-ai',
          prompt: promptTemplate,
      };
      console.log(`[generateHipsterNameFlow] Sending request to proxy server at ${url}`, { body: JSON.stringify(requestBody, null, 2) });

      const response = await fetch(url, {
        method: 'POST',
        // Instruct fetch to not cache this request, ensuring we get a new name every time.
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_CACHE_SERVER_KEY || ''}`
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
      
      // Sometimes the model returns markdown with the JSON inside, so we extract it.
      const jsonMatch = responseData.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('[generateHipsterNameFlow] Extracted JSON from markdown response.');
        responseData = jsonMatch[0];
      }
      
      console.log('[generateHipsterNameFlow] Parsing JSON response.');
      const parsedResult = JSON.parse(responseData);
      
      return GenerateHipsterNameOutputSchema.parse(parsedResult);

    } catch (error) {
        console.warn(`[generateHipsterNameFlow] Primary call failed, attempting Nexis.ai fallback.`, { error });
        try {
          console.log('[generateHipsterNameFlow] Attempting direct call to Nexis.ai server.');
          const nexisUrl = 'http://modelapi.nexix.ai/api/generate';
          const apiKey = process.env.NEXIS_API_KEY;

          if (!apiKey) {
            throw new Error('NEXIS_API_KEY is not set.');
          }

          const requestBody = {
            model: 'llama3.1:8b',
            prompt: promptTemplate,
            stream: false,
            format: 'json',
          };
          console.log(`[generateHipsterNameFlow] Sending request to Nexis.ai server at ${nexisUrl}`, { body: JSON.stringify(requestBody, null, 2) });

          const nexisResponse = await fetch(nexisUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (!nexisResponse.ok) {
            const errorBody = await nexisResponse.text();
            console.error(`[generateHipsterNameFlow] Nexis.ai API Error: ${nexisResponse.status} ${nexisResponse.statusText}`, { url: nexisUrl, errorBody });
            throw new Error(`Nexis.ai API request failed with status ${nexisResponse.status}: ${errorBody}`);
          }

          const nexisResult = await nexisResponse.json();
          console.log('[generateHipsterNameFlow] Nexis.ai fallback successful.');
          const parsedResult = JSON.parse(nexisResult.response);

          return {
            ...GenerateHipsterNameOutputSchema.parse(parsedResult),
            isFallback: true,
          };
        } catch (fallbackError) {
          console.error(`[generateHipsterNameFlow] Nexis.ai fallback failed. Returning hard-coded fallback.`, { error: fallbackError });
          const fallbackNames = ["Pip", "Wren", "Lark", "Moss", "Cove"];
          return {
              fallbackNames: fallbackNames,
              isFallback: true,
          }
        }
    }
  }
);
