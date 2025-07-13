
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

const BadgeSchema = z.object({
  badgeDescription: z.string().describe('A short, witty description for a merit badge earned by embracing this weird scenario.'),
  badgeImagePrompt: z
    .string()
    .describe('A 2-3 word prompt for an image generator to create a small, circular, embroidered patch-style badge for this scenario.'),
});

const GeneratePortlandScenarioOutputSchema = z.object({
  scenario: z.string().describe('A description of the generated scenario.'),
  challenge: z.string().describe('A challenge the player must overcome in the scenario.'),
  reward: z.string().describe('A potential reward for overcoming the challenge.'),
  diablo2Element: z.string().optional().describe('The subtle Diablo II reference.'),
  imagePrompt: z
    .string()
    .describe(
      'A short, 2-4 word prompt for an image generator to create a visual for this scenario. e.g. "Pigeons in hats" or "Man with handlebar mustache"'
    ),
  badge: BadgeSchema.optional(),
  dataSource: z.enum(['primary', 'fallback', 'hardcoded']).describe('The source of the generated data.'),
});
export type GeneratePortlandScenarioOutput = z.infer<typeof GeneratePortlandScenarioOutputSchema>;

// This is the schema we expect the proxied model to return
const OllamaResponseSchema = z.object({
  scenario: z.string(),
  challenge: z.string(),
  reward: z.string(),
  diablo2Element: z.string().optional(),
  imagePrompt: z.string(),
  shouldAwardBadge: z.boolean().describe("Whether the scenario is weird enough to award a merit badge."),
  badgeDescription: z.string().optional().describe("The badge description, if one is awarded."),
  badgeImagePrompt: z.string().optional().describe("The badge image prompt, if one is awarded."),
});

const promptTemplate = `You are a game master for The Portland Trail.
Your job is to create a quirky, random, and challenging scenario for the player based on their current status and location.
The scenario must be HIGHLY SPECIFIC to the current location. Incorporate local landmarks, stereotypes, or cultural touchstones.
Also, subtly weave in an unexpected element inspired by the dark fantasy world of Diablo II.
Based on the scenario you generate, decide if it is weird or noteworthy enough to award the player a merit badge. Only award badges for things that are truly strange or representative of Portland culture.

Player Status: {playerStatus}
Location: {location}

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "scenario": "A description of the generated scenario.",
  "challenge": "A challenge the player must overcome in the scenario.",
  "reward": "A potential reward for overcoming the challenge.",
  "diablo2Element": "The subtle Diablo II reference.",
  "imagePrompt": "A short, 2-4 word prompt for an image generator.",
  "shouldAwardBadge": boolean,
  "badgeDescription": "A short, witty description for the merit badge (only if shouldAwardBadge is true).",
  "badgeImagePrompt": "A 2-3 word prompt for the badge image generator (only if shouldAwardBadge is true)."
}
`;


export async function generatePortlandScenario(
  input: GeneratePortlandScenarioInput
): Promise<GeneratePortlandScenarioOutput> {
  console.log('[generatePortlandScenario] Started with Ollama flow.');
  const prompt = promptTemplate
      .replace('{playerStatus}', input.playerStatus)
      .replace('{location}', input.location);

  try {
    const url = 'http://modelapi.nexix.ai/api/proxy';
    const requestBody = {
        service: 'ollama',
        model: 'gemma3:12b',
        prompt: prompt,
    };
    console.log(`[generatePortlandScenario] Sending request to proxy server at ${url}`, { body: JSON.stringify(requestBody, null, 2) });
    
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
        console.error(`[generatePortlandScenario] Proxy API Error: ${response.status} ${response.statusText}`, { url, errorBody });
        throw new Error(`Proxy API request failed with status ${response.status}: ${errorBody}`);
      }

      const result: ProxyResponse = await response.json();
      console.log(`[generatePortlandScenario] Successfully received response from proxy. Cached: ${result.isCached}`);
      let responseData = result.content;
      
      const jsonMatch = responseData.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('[generatePortlandScenario] Extracted JSON from markdown response.');
        responseData = jsonMatch[0];
      }
      
      console.log('[generatePortlandScenario] Parsing JSON response from Ollama.');
      const parsedResult = OllamaResponseSchema.parse(JSON.parse(responseData));

      const output: GeneratePortlandScenarioOutput = {
        scenario: parsedResult.scenario,
        challenge: parsedResult.challenge,
        reward: parsedResult.reward,
        diablo2Element: parsedResult.diablo2Element,
        imagePrompt: parsedResult.imagePrompt,
        dataSource: 'primary'
      };

      if (parsedResult.shouldAwardBadge && parsedResult.badgeDescription && parsedResult.badgeImagePrompt) {
        console.log('[generatePortlandScenario] Model decided to award a badge.');
        output.badge = {
            badgeDescription: parsedResult.badgeDescription,
            badgeImagePrompt: parsedResult.badgeImagePrompt
        };
      } else {
        console.log('[generatePortlandScenario] Model did not award a badge.');
      }
      
      return output;

  } catch (error) {
    console.error(`[generatePortlandScenario] Ollama agent call failed. Returning hard-coded scenario.`, {error});
    return {
      scenario:
        "You encounter a glitch in the hipster matrix. A flock of identical pigeons, all wearing tiny fedoras, stares at you menacingly before dispersing.",
      challenge: 'Question your reality',
      reward: "A fleeting sense of existential dread, which oddly increases your irony.",
      diablo2Element: "You feel as though you've just witnessed a 'Diablo Clone' event, but for birds.",
      imagePrompt: 'pigeons wearing fedoras',
      badge: {
        badgeDescription: 'Fedorapocalypse Witness',
        badgeImagePrompt: 'pigeon wearing fedora',
      },
      dataSource: 'hardcoded',
    };
  }
}
