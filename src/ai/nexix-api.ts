
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
 * Extracts a JSON object from a string by finding the first '{' and the last '}'.
 * This is more robust than a simple regex for nested JSON.
 *
 * @param str The string to parse.
 * @returns The extracted JSON object as a string, or null if not found.
 */
function extractJson(str: string): string | null {
    if (!str || typeof str !== 'string') {
        return null;
    }

    const startIndex = str.indexOf('{');
    if (startIndex === -1) {
        return null;
    }

    let braceCount = 1;
    let endIndex = -1;

    for (let i = startIndex + 1; i < str.length; i++) {
        if (str[i] === '{') {
            braceCount++;
        } else if (str[i] === '}') {
            braceCount--;
        }

        if (braceCount === 0) {
            endIndex = i;
            break;
        }
    }

    if (endIndex === -1) {
        return null; // Unmatched braces
    }

    return str.substring(startIndex, endIndex + 1);
}


/**
 * Calls the Nexix.ai OpenAI-compatible chat completions endpoint.
 * It now handles parsing and Zod schema validation internally.
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

  if (!parsedResponse.success || parsedResponse.data.choices.length === 0 || !parsedResponse.data.choices[0].message.content) {
    console.error(`[callNexixApi] Invalid response structure from API.`, { result });
    throw new Error('Invalid response structure from Nexix API. Content is missing.');
  }
  
  const rawContent = parsedResponse.data.choices[0].message.content;
  console.log(`[callNexixApi] Successfully received response. Now extracting and parsing JSON.`);

  const jsonString = extractJson(rawContent);
  if (!jsonString) {
    console.error(`[callNexixApi] Failed to extract valid JSON from the API response content.`, { rawContent });
    throw new Error('Could not find a valid JSON object in the response.');
  }

  try {
    const data = JSON.parse(jsonString);
    return schema.parse(data);
  } catch (error) {
      console.error(`[callNexixApi] Failed to parse or validate the JSON content.`, { jsonString, error });
      if (error instanceof z.ZodError) {
        throw new Error(`Zod validation failed: ${error.issues.map(i => i.message).join(', ')}`);
      }
      throw new Error('Failed to parse the JSON response from the API.');
  }
}
