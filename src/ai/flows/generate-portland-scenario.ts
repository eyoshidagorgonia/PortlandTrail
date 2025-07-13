
'use server';
/**
 * @fileOverview A scenario generator for the Portland Trail game.
 *
 * - generatePortlandScenario - A function that generates a scenario based on Portland's hipster culture and Diablo II elements.
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

const promptTemplate = `You are a game master for The Portland Trail, a game that combines the Oregon Trail with Diablo II and modern hipster culture. Your job is to create quirky, random, and challenging scenarios for the player based on their current status and, most importantly, their location on the trail from San Francisco to Portland.

Player Status: {playerStatus}
Current Location: {location}

Create a scenario that is HIGHLY SPECIFIC to the current location: {location}. The scenario should feel like it could only happen there. Incorporate local landmarks, stereotypes, or cultural touchstones associated with that place. For example, a scenario in San Francisco might involve tech bros and sourdough, while a scenario in Ashland could involve the Shakespeare Festival.

Also, subtly weave in an unexpected element inspired by the dark fantasy world of Diablo II. This could be a strange item, a mysterious character, or an odd event that feels out of place.

Finally, you MUST create a merit badge for this scenario. The badge should be for encountering this unique situation.

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "scenario": "A description of the generated scenario.",
  "challenge": "A challenge the player must overcome in the scenario.",
  "reward": "A potential reward for overcoming the challenge.",
  "diablo2Element": "description of the Diablo II element",
  "imagePrompt": "A short, 2-4 word prompt for an image generator to create a visual for the main scenario.",
  "badgeDescription": "A short, witty description for the merit badge earned. This MUST be directly related to the scenario.",
  "badgeImagePrompt": "A 2-3 word prompt for an image generator to create the badge image. This prompt must visually describe the badge, which MUST be relevant to the scenario. For example, if the scenario is about pigeons in hats, the prompt could be 'pigeon wearing fedora'."
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
        .replace(new RegExp('{location}', 'g'), location);

    console.log(`[generatePortlandScenarioFlow] Generated prompt.`);

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
        const parsedResult = JSON.parse(responseData);
        return { ...GeneratePortlandScenarioOutputSchema.parse(parsedResult), dataSource: 'primary' };
    } catch (error) {
        console.error(`[generatePortlandScenarioFlow] Ollama call failed.`, { error });
        // Fallback to a hardcoded response if the agent fails
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
);
