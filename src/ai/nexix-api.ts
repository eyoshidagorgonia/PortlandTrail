
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
 * Extracts a JSON object from a string, even if it's embedded in other text.
 * For example, it can extract the JSON from "```json\n{...}\n```".
 *
 * @param str The string to parse.
 * @returns The extracted JSON object as a string, or null if not found.
 */
function extractJson(str: string): string | null {
    if (!str || typeof str !== 'string') {
        return null;
    }
    const match = str.match(/\{[\s\S]*\}/);
    return match ? match[0] : null;
}


/**
 * Calls the Nexix.ai OpenAI-compatible chat completions endpoint.
 * It now handles parsing and Zod schema validation internally.
 * It will try the primary model first, and if that fails, it will automatically
 * try a smaller, faster fallback model.
 *
 * @param primaryModel - The primary model to use for the completion.
 * @param prompt - The user prompt to send to the model.
 * @param schema - The Zod schema to validate the response against.
 * @param temperature - The temperature for the generation. Defaults to 1.0.
 * @returns The parsed and validated data object.
 * @throws {Error} If the API key is not set, or if both primary and fallback calls fail.
 */
export async function callNexixApi<T extends z.ZodType<any, any, any>>(
  primaryModel: string,
  prompt: string,
  schema: T,
  temperature: number = 1.0
): Promise<z.infer<T>> {
  const url = 'https://modelapi.nexix.ai/api/v1/chat/completions';
  const apiKey = process.env.NEXIX_API_KEY;
  const fallbackModel = "gemma:2b-instruct-q8_0";

  if (!apiKey) {
    throw new Error('NEXIX_API_KEY environment variable is not set.');
  }

  const tryModel = async (model: string, isFallback = false): Promise<z.infer<T>> => {
    const logPrefix = isFallback ? '[callNexixApi - Fallback]' : '[callNexixApi - Primary]';
    console.log(`${logPrefix} Sending request to ${url} with model ${model}`);

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
      console.error(`${logPrefix} API Error: ${response.status} ${response.statusText}`, { errorBody });
      throw new Error(`Nexix API request failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    const parsedResponse = NexixApiResponseSchema.safeParse(result);

    if (!parsedResponse.success || parsedResponse.data.choices.length === 0 || !parsedResponse.data.choices[0].message.content) {
      console.error(`${logPrefix} Invalid response structure from API.`, { result });
      throw new Error('Invalid response structure from Nexix API. Content is missing.');
    }
    
    const rawContent = parsedResponse.data.choices[0].message.content;
    console.log(`${logPrefix} Successfully received response. Now extracting and parsing JSON.`);

    const jsonString = extractJson(rawContent);
    if (!jsonString) {
      console.error(`${logPrefix} Failed to extract valid JSON from the API response content.`, { rawContent });
      throw new Error('Could not find a valid JSON object in the response.');
    }

    try {
      const data = JSON.parse(jsonString);
      return schema.parse(data);
    } catch (error) {
       console.error(`${logPrefix} Failed to parse or validate the JSON content.`, { jsonString, error });
       if (error instanceof z.ZodError) {
          throw new Error(`Zod validation failed: ${error.issues.map(i => i.message).join(', ')}`);
       }
       throw new Error('Failed to parse the JSON response from the API.');
    }
  }

  try {
    return await tryModel(primaryModel);
  } catch (primaryError) {
    console.warn(`[callNexixApi] Primary model '${primaryModel}' failed. Trying fallback model '${fallbackModel}'.`, { primaryError });
    try {
        return await tryModel(fallbackModel, true);
    } catch (fallbackError) {
        console.error(`[callNexixApi] Both primary and fallback models failed.`, { fallbackError });
        throw fallbackError; // Re-throw the fallback error after logging
    }
  }
}
