
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
  ).min(1),
});

/**
 * Calls the Nexix.ai OpenAI-compatible chat completions endpoint.
 * It handles parsing and Zod schema validation internally.
 *
 * @param model - The model to use for the completion.
 * @param prompt - The user prompt to send to the model.
 * @param schema - The Zod schema to validate the response against.
 * @param temperature - The temperature for the generation. Defaults to 1.0.
 * @returns The parsed and validated data object.
 * @throws {Error} If the API key is not set, or if the call fails.
 */
export async function callNexixApi<T extends z.ZodType<any, any, any>>(
  model: string,
  prompt: string,
  schema: T,
  temperature: number = 1.0
): Promise<z.infer<T>> {
  const url = 'https://modelapi.nexix.ai/api/v1/chat/completions';
  const apiKey = process.env.NEXIX_API_KEY;

  if (!apiKey) {
    throw new Error('NEXIX_API_KEY environment variable is not set.');
  }
  
  console.log(`[callNexixApi] Sending request to ${url} with model ${model}`);

  const requestBody = {
    model: model,
    messages: [{ role: 'user', content: prompt }],
    temperature: temperature,
  };
  
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

  if (!parsedResponse.success) {
    console.error(`[callNexixApi] Invalid response structure from API.`, { result, issues: parsedResponse.error.issues });
    throw new Error('Invalid response structure from Nexix API.');
  }
  
  const content = parsedResponse.data.choices[0].message.content;
  console.log(`[callNexixApi] Successfully received response content. Now parsing...`);
  
  try {
    const data = JSON.parse(content);

    // Use .passthrough() to allow extra fields in the AI response without failing validation.
    return schema.passthrough().parse(data);
  } catch (error) {
      console.error(`[callNexixApi] Failed to parse or validate the JSON content.`, { content, error });
      if (error instanceof z.ZodError) {
        throw new Error(`Zod validation failed: ${error.issues.map(i => `${i.path.join('.')} - ${i.message}`).join(', ')}`);
      }
      throw new Error(`Failed to parse the JSON response from the API: ${ (error as Error).message }`);
  }
}
