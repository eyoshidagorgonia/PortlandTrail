
'use server';
/**
 * @fileOverview A dedicated module for interacting with the Nexix.ai API.
 */

import { z } from 'zod';

// Schema for a successful API response
const NexixApiResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string(),
      }),
    })
  ),
});

/**
 * Calls the Nexix.ai OpenAI-compatible chat completions endpoint.
 *
 * @param model - The model to use for the completion.
 * @param prompt - The user prompt to send to the model.
 * @param temperature - The temperature for the generation.
 * @returns The content string from the first choice in the response.
 * @throws {Error} If the API key is not set.
 * @throws {Error} If the API call fails or returns a non-ok status.
 * @throws {Error} If the response format is invalid.
 */
export async function callNexixApi(
  model: string,
  prompt: string,
  temperature: number = 1.0
): Promise<string> {
  const url = 'https://modelapi.nexix.ai/api/v1/chat/completions';
  const apiKey = process.env.NEXIX_API_KEY;

  if (!apiKey) {
    throw new Error('NEXIX_API_KEY environment variable is not set.');
  }

  const requestBody = {
    model: model,
    messages: [{ role: 'user', content: prompt }],
    temperature: temperature,
  };

  console.log(`[callNexixApi] Sending request to ${url} with model ${model}`);
  
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
    console.error(`[callNexixApi] API Error: ${response.status} ${response.statusText}`, { errorBody });
    throw new Error(`Nexix API request failed with status ${response.status}: ${errorBody}`);
  }

  const result = await response.json();
  const parsedResponse = NexixApiResponseSchema.safeParse(result);

  if (!parsedResponse.success || parsedResponse.data.choices.length === 0 || !parsedResponse.data.choices[0].message.content) {
    console.error('[callNexixApi] Invalid response structure from API.', { result });
    throw new Error('Invalid response structure from Nexix API. Content is missing.');
  }
  
  console.log(`[callNexixApi] Successfully received and parsed response.`);
  return parsedResponse.data.choices[0].message.content;
}
