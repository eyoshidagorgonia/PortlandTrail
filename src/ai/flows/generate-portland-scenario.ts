
'use server';
/**
 * @fileOverview An agentic scenario generator for the Portland Trail game.
 *
 * - generatePortlandScenario - A function that uses an AI agent to generate a scenario.
 * - GeneratePortlandScenarioInput - The input type for the generatePortlandScenario function.
 * - GeneratePortlandScenarioOutput - The return type for the generatePortlandScenario function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the shape of the expected response from the API cache server
interface ProxyResponse {
    content: string;
    isCached: boolean;
    error?: string;
  }

const GeneratePortlandScenarioInputSchema = z.object({
  playerStatus: z
    .string()
    .describe('The current status of the player, including hunger, style, vinyl collection, irony, and authenticity.'),
  location: z.string().describe('The current location of the player on the trail.'),
});
export type GeneratePortlandScenarioInput = z.infer<typeof GeneratePortlandScenarioInputSchema>;

const GeneratePortlandScenarioOutputSchema = z.object({
    scenario: z.string().describe('A description of the generated scenario.'),
    challenge: z.string().describe('A challenge the player must overcome in the scenario.'),
    reward: z.string().describe('A potential reward for overcoming the challenge.'),
    diablo2Element: z
      .string()
      .optional(),
    imagePrompt: z.string().describe('A short, 2-4 word prompt for an image generator to create a visual for this scenario. e.g. "Pigeons in hats" or "Man with handlebar mustache"'),
    badgeDescription: z.string().describe('A short, witty description for a merit badge earned by embracing this weird scenario.'),
    badgeImagePrompt: z.string().describe('A 2-3 word prompt for an image generator to create a small, circular, embroidered patch-style badge for this scenario.'),
});
export type GeneratePortlandScenarioOutput = z.infer<typeof GeneratePortlandScenarioOutputSchema>;

const GeneratePortlandScenarioAndSourceOutputSchema = GeneratePortlandScenarioOutputSchema.extend({
    dataSource: z.enum(['primary', 'fallback', 'hardcoded']).describe('The source of the generated data.'),
});
type GeneratePortlandScenarioAndSourceOutput = z.infer<typeof GeneratePortlandScenarioAndSourceOutputSchema>;

export async function generatePortlandScenario(
  input: GeneratePortlandScenarioInput
): Promise<GeneratePortlandScenarioAndSourceOutput> {
  return generatePortlandScenarioFlow(input);
}

const promptTemplate = `You are a game master for The Portland Trail.
Your job is to create a quirky, random, and challenging scenario for the player based on their current status and location.
The scenario must be HIGHLY SPECIFIC to the current location. Incorporate local landmarks, stereotypes, or cultural touchstones.
Also, subtly weave in an unexpected element inspired by the dark fantasy world of Diablo II.
Finally, you must create a merit badge for completing the scenario.

Player Status: {playerStatus}
Location: {location}

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object must conform to this structure:
{
  "scenario": "A description of the generated scenario.",
  "challenge": "A challenge the player must overcome.",
  "reward": "A potential reward for overcoming the challenge.",
  "diablo2Element": "The subtle Diablo II reference.",
  "imagePrompt": "A 2-4 word prompt for an image generator.",
  "badgeDescription": "A witty description for the merit badge.",
  "badgeImagePrompt": "A 2-3 word prompt for the badge image."
}
`;

const generatePortlandScenarioFlow = ai.defineFlow(
  {
    name: 'generatePortlandScenarioFlow',
    inputSchema: GeneratePortlandScenarioInputSchema,
    outputSchema: GeneratePortlandScenarioAndSourceOutputSchema,
  },
  async ({ playerStatus, location }) => {
    console.log(`[generatePortlandScenarioFlow] Started for location: ${location}`);
    const prompt = promptTemplate
      .replace('{playerStatus}', playerStatus)
      .replace('{location}', location);

    try {
        const url = 'http://modelapi.nexix.ai/api/proxy';
        const requestBody = {
            service: 'ollama',
            model: 'gemma3:12b',
            prompt: prompt,
        };
        console.log(`[generatePortlandScenarioFlow] Sending request to proxy server at ${url}`, { body: JSON.stringify(requestBody, null, 2) });
  
        const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.NEXIS_API_KEY || ''}`
          },
          body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`[generatePortlandScenarioFlow] Proxy API Error: ${response.status} ${response.statusText}`, { url, errorBody });
          throw new Error(`Proxy API request failed with status ${response.status}: ${errorBody}`);
        }
        
        const result: ProxyResponse = await response.json();
        console.log(`[generatePortlandScenarioFlow] Successfully received response from proxy. Cached: ${result.isCached}`);
        let responseData = result.content;
        
        const jsonMatch = responseData.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log('[generatePortlandScenarioFlow] Extracted JSON from markdown response.');
          responseData = jsonMatch[0];
        }
        
        console.log('[generatePortlandScenarioFlow] Parsing JSON response.');
        const parsedResult = GeneratePortlandScenarioOutputSchema.parse(JSON.parse(responseData));
        return { ...parsedResult, dataSource: 'primary' };
    } catch (error) {
        console.warn(`[generatePortlandScenarioFlow] Primary call failed, attempting Nexis.ai fallback.`, { error });
        try {
            console.log('[generatePortlandScenarioFlow] Attempting direct call to Nexis.ai server.');
            const nexisUrl = 'http://modelapi.nexix.ai/api/v1/proxy/generate';
            const apiKey = process.env.NEXIS_API_KEY;

            if (!apiKey) {
              throw new Error('NEXIS_API_KEY is not set.');
            }

            const requestBody = {
                model: 'gemma3:12b',
                prompt: prompt,
                stream: false,
                format: 'json'
            };
            console.log(`[generatePortlandScenarioFlow] Sending request to Nexis.ai server at ${nexisUrl}`, { body: JSON.stringify(requestBody, null, 2) });
            
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
                console.error(`[generatePortlandScenarioFlow] Nexis.ai API Error: ${nexisResponse.status} ${nexisResponse.statusText}`, { url: nexisUrl, errorBody });
                throw new Error(`Nexis.ai API request failed with status ${nexisResponse.status}: ${errorBody}`);
            }
            
            const nexisResult = await nexisResponse.json();
            console.log('[generatePortlandScenarioFlow] Nexis.ai fallback successful.');
            const parsedResult = GeneratePortlandScenarioOutputSchema.parse(JSON.parse(nexisResult.response));
            return { ...parsedResult, dataSource: 'fallback' };
        } catch(fallbackError) {
            console.error(`[generatePortlandScenarioFlow] Fallback call failed. Returning hard-coded scenario.`, { error: fallbackError });
            return {
                scenario: "You encounter a glitch in the hipster matrix. A flock of identical pigeons, all wearing tiny fedoras, stares at you menacingly before dispersing.",
                challenge: "Question your reality",
                reward: "A fleeting sense of existential dread, which oddly increases your irony.",
                diablo2Element: "You feel as though you've just witnessed a 'Diablo Clone' event, but for birds.",
                imagePrompt: "pigeons wearing fedoras",
                badgeDescription: "Fedorapocalypse Witness",
                badgeImagePrompt: "pigeon wearing fedora",
                dataSource: 'hardcoded',
            }
        }
    }
  }
);
