
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

const GeneratePortlandScenarioInputSchema = z.object({
  playerStatus: z
    .string()
    .describe('The current status of the player, including hunger, style, vinyl collection, irony, and authenticity.'),
  location: z.string().describe('The current location of the player on the trail.'),
  character: z.object({
    name: z.string(),
    job: z.string(),
  }),
});
export type GeneratePortlandScenarioInput = z.infer<typeof GeneratePortlandScenarioInputSchema>;

const BadgeSchema = z.object({
  badgeDescription: z.string().describe('A short, witty description for a merit badge earned by embracing this weird scenario.'),
  badgeEmoji: z.string().describe('A single emoji that represents the badge.'),
});

const GeneratePortlandScenarioOutputSchema = z.object({
  scenario: z.string().describe('A description of the generated scenario.'),
  challenge: z.string().describe('A challenge the player must overcome in the scenario.'),
  reward: z.string().describe('A potential reward for overcoming the challenge.'),
  diablo2Element: z.string().optional().describe('The subtle Diablo II reference.'),
  asciiArt: z.string().describe('Quirky, multi-line ASCII art depicting the scene. It should be wrapped in a code block.'),
  avatarKaomoji: z.string().describe('A Japanese-style Kaomoji (e.g., (⌐■_■) or ┐(‘～` )┌) representing the player character.'),
  badge: BadgeSchema.optional(),
  dataSource: z.enum(['primary', 'hardcoded']).describe('The source of the generated data.'),
});
export type GeneratePortlandScenarioOutput = z.infer<typeof GeneratePortlandScenarioOutputSchema>;

// This is the schema we expect the proxied model to return
const OllamaResponseSchema = z.object({
  scenario: z.string(),
  challenge: z.string(),
  reward: z.string(),
  diablo2Element: z.string().optional(),
  asciiArt: z.string(),
  avatarKaomoji: z.string(),
  shouldAwardBadge: z.boolean().describe("Whether the scenario is weird enough to award a merit badge."),
  badgeDescription: z.string().optional().describe("The badge description, if one is awarded."),
  badgeEmoji: z.string().optional().describe("A single emoji for the badge, if one is awarded."),
});

export async function generatePortlandScenario(
  input: GeneratePortlandScenarioInput
): Promise<GeneratePortlandScenarioOutput> {
  console.log('[generatePortlandScenario] Started with agent flow.');
  const prompt = `You are the Game Master for "The Portland Trail," a quirky text-based RPG.
Your job is to create a complete, self-contained scenario for the player.

You must generate:
1.  **Scenario**: A quirky, random, and challenging scenario based on the player's status and location. It must be HIGHLY SPECIFIC to the location. Incorporate local landmarks, stereotypes, or cultural touchstones. Also, subtly weave in an unexpected element inspired by the dark fantasy world of Diablo II.
2.  **ASCII Art**: Create a piece of multi-line ASCII art that visually represents the scenario. Keep it simple and contained within about 5-7 lines.
3.  **Avatar Kaomoji**: Generate a creative Japanese-style Kaomoji (e.g., (⌐■_■) or ┐(‘～\` )┌) that represents the player's character based on their name and job.
4.  **Badge Decision**: Based on the scenario you generated, decide if it is weird or noteworthy enough to award the player a merit badge. Only award badges for things that are truly strange or representative of Portland culture. If you award a badge, you must also create a single emoji for it.

Player Status: ${input.playerStatus}
Location: ${input.location}
Character: Name: ${input.character.name}, Job: ${input.character.job}

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "scenario": "A description of the generated scenario.",
  "challenge": "A challenge the player must overcome in the scenario.",
  "reward": "A potential reward for overcoming the challenge.",
  "diablo2Element": "The subtle Diablo II reference.",
  "asciiArt": "The multi-line ASCII art for the scene.",
  "avatarKaomoji": "The generated Kaomoji for the player.",
  "shouldAwardBadge": boolean,
  "badgeDescription": "A short, witty description for the merit badge (only if shouldAwardBadge is true).",
  "badgeEmoji": "A single emoji for the badge (only if shouldAwardBadge is true)."
}`;

  try {
    const url = 'https://modelapi.nexix.ai/api/v1/chat/completions';
    const apiKey = process.env.NEXIX_API_KEY;

    if (!apiKey) {
      throw new Error('NEXIX_API_KEY is not set for generatePortlandScenario.');
    }
    
    const requestBody = {
        model: 'gemma3:12b',
        messages: [{ role: 'user', content: prompt }],
    };
    console.log(`[generatePortlandScenario] Sending request to OpenAI-compatible endpoint at ${url}`);
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[generatePortlandScenario] API Error: ${response.status} ${response.statusText}`, { url, errorBody });
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
      }

      const result = await response.json();
      console.log(`[generatePortlandScenario] Successfully received response from endpoint.`);
      
      const scenarioContent = result.choices[0]?.message?.content;
      if (!scenarioContent) {
        throw new Error('Invalid response structure from API. Content is missing.');
      }
      
      const parsedResult = OllamaResponseSchema.parse(JSON.parse(scenarioContent));

      const output: GeneratePortlandScenarioOutput = {
        scenario: parsedResult.scenario,
        challenge: parsedResult.challenge,
        reward: parsedResult.reward,
        diablo2Element: parsedResult.diablo2Element,
        asciiArt: parsedResult.asciiArt,
        avatarKaomoji: parsedResult.avatarKaomoji,
        dataSource: 'primary'
      };

      if (parsedResult.shouldAwardBadge && parsedResult.badgeDescription && parsedResult.badgeEmoji) {
        console.log('[generatePortlandScenario] Model decided to award a badge.');
        output.badge = {
            badgeDescription: parsedResult.badgeDescription,
            badgeEmoji: parsedResult.badgeEmoji,
        };
      } else {
        console.log('[generatePortlandScenario] Model did not award a badge.');
      }
      
      return output;

  } catch (error) {
    console.error(`[generatePortlandScenario] Agent call failed. Returning hard-coded scenario.`, {error});
    return {
      scenario:
        "You encounter a glitch in the hipster matrix. A flock of identical pigeons, all wearing tiny fedoras, stares at you menacingly before dispersing.",
      challenge: 'Question your reality',
      reward: "A fleeting sense of existential dread, which oddly increases your irony.",
      diablo2Element: "You feel as though you've just witnessed a 'Diablo Clone' event, but for birds.",
      asciiArt: `
      ( o)>  ( o)>  ( o)>
      /(_)\\  /(_)\\  /(_)\\
      `,
      avatarKaomoji: '(o_O;)',
      badge: {
        badgeDescription: 'Fedorapocalypse Witness',
        badgeEmoji: '🐦',
      },
      dataSource: 'hardcoded',
    };
  }
}
