
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
import { callNexixApi } from '@/ai/nexix-api';

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

const ConsequencesSchema = z.object({
    hunger: z.number().describe('The change in hunger. Can be positive or negative.'),
    style: z.number().describe('The change in style. Can be positive or negative.'),
    irony: z.number().describe('The change in irony. Can be positive or negative.'),
    authenticity: z.number().describe('The change in authenticity. Can be positive or negative.'),
    progress: z.number().describe('The change in progress towards Portland.'),
    coffee: z.number().describe('The change in coffee beans. Can be positive or negative.'),
    vinyls: z.number().describe('The change in vinyl records. Can be positive or negative.'),
    bikeHealth: z.number().describe('The change in bike health. Can be positive or negative.'),
});

const ChoiceSchema = z.object({
    text: z.string().describe("The text for the choice button, e.g., 'Embrace the weirdness'"),
    description: z.string().describe("A tooltip description for the choice."),
    consequences: ConsequencesSchema,
});

const GeneratePortlandScenarioOutputSchema = z.object({
  scenario: z.string().describe('A description of the generated scenario.'),
  challenge: z.string().describe('A challenge the player must overcome in the scenario.'),
  diablo2Element: z.string().optional().describe('The subtle Diablo II reference.'),
  avatarKaomoji: z.string().describe('A Japanese-style Kaomoji (e.g., (⌐■_■) or ┐(‘～` )┌) representing the player character.'),
  badge: BadgeSchema.optional(),
  choices: z.array(ChoiceSchema).describe("An array of 2-3 choices for the player."),
  dataSource: z.enum(['primary', 'hardcoded']).describe('The source of the generated data.'),
});
export type GeneratePortlandScenarioOutput = z.infer<typeof GeneratePortlandScenarioOutputSchema>;

// This is the schema we expect the proxied model to return
const OllamaResponseSchema = z.object({
  scenario: z.string(),
  challenge: z.string(),
  diablo2Element: z.string().optional(),
  avatarKaomoji: z.string(),
  shouldAwardBadge: z.boolean().describe("Whether the scenario is weird enough to award a merit badge."),
  badgeDescription: z.string().optional().describe("The badge description, if one is awarded."),
  badgeEmoji: z.string().optional().describe("A single emoji for the badge, if one is awarded."),
  choices: z.array(ChoiceSchema),
});

export async function generatePortlandScenario(
  input: GeneratePortlandScenarioInput
): Promise<GeneratePortlandScenarioOutput> {
  console.log('[generatePortlandScenario] Started with agent flow.');
  const prompt = `You are the Game Master for "The Portland Trail," a quirky text-based RPG.
Your job is to create a complete, self-contained scenario for the player, including balanced choices and consequences.

**Player Analysis & Consequence Generation:**
First, analyze the player's current status.
- If the player is struggling (e.g., low hunger, low bike health, low progress), generate choices with more generous rewards (positive outcomes) and less severe penalties. For example, the "avoid" choice should have minimal negative impact.
- If the player is doing well, you can create more challenging scenarios with higher risks and more nuanced rewards.
- The consequences you generate should be logical for the choice. For example, choosing to leave a scenario should always grant some progress.

**Scenario Generation:**
1.  **Scenario**: A quirky, random, and challenging scenario based on the player's status and location. It must be HIGHLY SPECIFIC to the location. Incorporate local landmarks, stereotypes, or cultural touchstones. Also, subtly weave in an unexpected element inspired by the dark fantasy world of Diablo II.
2.  **Avatar Kaomoji**: Generate a creative Japanese-style Kaomoji (e.g., (⌐■_■) or ┐(‘～\` )┌) that represents the player's character based on their name and job.
3.  **Choices and Consequences**: Create exactly TWO choices for the player.
    -   The first choice should be about EMBRACING the scenario (e.g., "Embrace the weirdness", "Investigate the sound").
    -   The second choice should be about AVOIDING or LEAVING the scenario (e.g., "Skateboard away," "Nope out of there"). Generate a quirky 2-4 word phrase for this.
    -   For EACH choice, generate a full set of consequences based on your player analysis.
4.  **Badge Decision**: Based on the scenario you generated, decide if it is weird or noteworthy enough to award the player a merit badge. Only award badges for things that are truly strange or representative of Portland culture. If you award a badge, you must also create a single emoji for it.

**Player Status:** ${input.playerStatus}
**Location:** ${input.location}
**Character:** Name: ${input.character.name}, Job: ${input.character.job}

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object must conform to this structure:
{
  "scenario": "A description of the generated scenario.",
  "challenge": "A challenge the player must overcome in the scenario.",
  "diablo2Element": "The subtle Diablo II reference.",
  "avatarKaomoji": "The generated Kaomoji for the player.",
  "choices": [
    {
      "text": "Text for the 'Embrace' choice",
      "description": "Tooltip for the 'Embrace' choice",
      "consequences": { "hunger": 0, "style": 5, "irony": 2, "authenticity": -2, "progress": 1, "coffee": 0, "vinyls": 0, "bikeHealth": 0 }
    },
    {
      "text": "Text for the 'Avoid' choice",
      "description": "Tooltip for the 'Avoid' choice",
      "consequences": { "hunger": -2, "style": -1, "irony": -1, "authenticity": 0, "progress": 4, "coffee": 0, "vinyls": 0, "bikeHealth": -5 }
    }
  ],
  "shouldAwardBadge": boolean,
  "badgeDescription": "A short, witty description for the merit badge (only if shouldAwardBadge is true).",
  "badgeEmoji": "A single emoji for the badge (only if shouldAwardBadge is true)."
}`;

  try {
    const apiResponse = await callNexixApi('gemma3:12b', prompt);
    const data = JSON.parse(apiResponse);
    const parsedResult = OllamaResponseSchema.parse(data);

      const output: GeneratePortlandScenarioOutput = {
        scenario: parsedResult.scenario,
        challenge: parsedResult.challenge,
        diablo2Element: parsedResult.diablo2Element,
        avatarKaomoji: parsedResult.avatarKaomoji,
        choices: parsedResult.choices,
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
      diablo2Element: "You feel as though you've just witnessed a 'Diablo Clone' event, but for birds.",
      avatarKaomoji: '(o_O;)',
      choices: [
        {
            text: 'Embrace the weirdness',
            description: "What's the worst that could happen?",
            consequences: { hunger: -2, style: 5, irony: 5, authenticity: -3, progress: 0, coffee: 0, vinyls: 0, bikeHealth: 0 },
        },
        {
            text: 'Skedaddle',
            description: 'This is too much. Time to leave.',
            consequences: { hunger: -1, style: -2, irony: 0, authenticity: 0, progress: 3, coffee: 0, vinyls: 0, bikeHealth: -5 },
        }
      ],
      badge: {
        badgeDescription: 'Fedorapocalypse Witness',
        badgeEmoji: '🐦',
      },
      dataSource: 'hardcoded',
    };
  }
}
