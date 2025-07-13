
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
});
export type GeneratePortlandScenarioInput = z.infer<typeof GeneratePortlandScenarioInputSchema>;

const ScenarioSchema = z.object({
  scenario: z.string().describe('A description of the generated scenario.'),
  challenge: z.string().describe('A challenge the player must overcome in the scenario.'),
  reward: z.string().describe('A potential reward for overcoming the challenge.'),
  diablo2Element: z.string().optional().describe('The subtle Diablo II reference.'),
  imagePrompt: z
    .string()
    .describe(
      'A short, 2-4 word prompt for an image generator to create a visual for this scenario. e.g. "Pigeons in hats" or "Man with handlebar mustache"'
    ),
});

const BadgeSchema = z.object({
  badgeDescription: z.string().describe('A short, witty description for a merit badge earned by embracing this weird scenario.'),
  badgeImagePrompt: z
    .string()
    .describe('A 2-3 word prompt for an image generator to create a small, circular, embroidered patch-style badge for this scenario.'),
});

const GeneratePortlandScenarioOutputSchema = ScenarioSchema.extend({
  badge: BadgeSchema.optional(),
  dataSource: z.enum(['primary', 'fallback', 'hardcoded']).describe('The source of the generated data.'),
});
export type GeneratePortlandScenarioOutput = z.infer<typeof GeneratePortlandScenarioOutputSchema>;

const createMeritBadge = ai.defineTool(
  {
    name: 'createMeritBadge',
    description: 'Use this tool to award the player a merit badge when they encounter a particularly weird or noteworthy scenario. Only use it for things that are truly strange or representative of Portland culture.',
    inputSchema: z.object({
      description: z.string().describe('A short, witty description for the merit badge.'),
      imagePrompt: z.string().describe('A 2-3 word prompt for the badge image generator.'),
    }),
    outputSchema: BadgeSchema,
  },
  async (input) => {
    console.log('[createMeritBadge] Tool called with input:', input);
    return {
      badgeDescription: input.description,
      badgeImagePrompt: input.imagePrompt,
    };
  }
);

const agentPrompt = ai.definePrompt(
  {
    name: 'portlandScenarioAgent',
    input: {schema: GeneratePortlandScenarioInputSchema},
    output: {schema: ScenarioSchema},
    tools: [createMeritBadge],
    model: 'ollama/gemma3:12b',
    prompt: `You are a game master for The Portland Trail.
Your job is to create a quirky, random, and challenging scenario for the player based on their current status and location.
The scenario must be HIGHLY SPECIFIC to the current location. Incorporate local landmarks, stereotypes, or cultural touchstones.
Also, subtly weave in an unexpected element inspired by the dark fantasy world of Diablo II.
If the scenario you generate is weird enough, you may award the player a merit badge by using the createMeritBadge tool.

Player Status: {{{playerStatus}}}
Location: {{{location}}}
`,
  },
  async (input) => input
);

export async function generatePortlandScenario(
  input: GeneratePortlandScenarioInput
): Promise<GeneratePortlandScenarioOutput> {
  console.log('[generatePortlandScenario] Started with agentic Ollama flow.');
  try {
    const {output, toolRequests} = await agentPrompt(input);
    if (!output) {
        throw new Error("The AI agent did not return a valid scenario.");
    }

    const toolRequest = toolRequests[0];
    if (toolRequest && toolRequest.name === 'createMeritBadge') {
      console.log('[generatePortlandScenario] Agent requested a merit badge.');
      const badge = await createMeritBadge(toolRequest.input);
      return {
        ...output,
        badge,
        dataSource: 'primary',
      };
    }

    console.log('[generatePortlandScenario] Agent did not request a badge.');
    return {
      ...output,
      dataSource: 'primary',
    };
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
