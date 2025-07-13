
'use server';
/**
 * @fileOverview An agentic scenario generator for the Portland Trail game.
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
  badgeDescription: z.string().optional().describe('A short, witty description for a merit badge earned by embracing this weird scenario.'),
  badgeImagePrompt: z.string().optional().describe('A 2-3 word prompt for an image generator to create a small, circular, embroidered patch-style badge for this scenario.'),
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

const createMeritBadge = ai.defineTool(
    {
      name: 'createMeritBadge',
      description: 'Use this tool to award the player a merit badge when they encounter a particularly unique, strange, or noteworthy scenario.',
      inputSchema: z.object({
        scenarioDescription: z.string().describe("A summary of the scenario that just occurred."),
      }),
      outputSchema: z.object({
        badgeDescription: z.string().describe('A short, witty description for the merit badge earned. This MUST be directly related to the scenario.'),
        badgeImagePrompt: z.string().describe("A 2-3 word prompt for an image generator to create the badge image. This prompt must visually describe the badge, which MUST be relevant to the scenario. For example, if the scenario is about pigeons in hats, the prompt could be 'pigeon wearing fedora'."),
      }),
    },
    async (input) => {
        // In a more complex agent, this tool could have its own logic or even call another LLM.
        // For now, we'll just return the structured data.
        return {
            badgeDescription: input.badgeDescription,
            badgeImagePrompt: input.badgeImagePrompt,
        };
    }
  );

const promptTemplate = `You are a game master for The Portland Trail, a game that combines the Oregon Trail with Diablo II and modern hipster culture. Your job is to create quirky, random, and challenging scenarios for the player based on their current status and, most importantly, their location on the trail from San Francisco to Portland.

Player Status: {playerStatus}
Current Location: {location}

Create a scenario that is HIGHLY SPECIFIC to the current location: {location}. The scenario should feel like it could only happen there. Incorporate local landmarks, stereotypes, or cultural touchstones associated with that place. For example, a scenario in San Francisco might involve tech bros and sourdough, while a scenario in Ashland could involve the Shakespeare Festival.

Also, subtly weave in an unexpected element inspired by the dark fantasy world of Diablo II. This could be a strange item, a mysterious character, or an odd event that feels out of place.

If the scenario you create is particularly noteworthy, strange, or achievement-worthy, you MUST use the \`createMeritBadge\` tool to award the player a badge. Otherwise, do not award a badge.

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "scenario": "A description of the generated scenario.",
  "challenge": "A challenge the player must overcome in the scenario.",
  "reward": "A potential reward for overcoming the challenge.",
  "diablo2Element": "description of the Diablo II element",
  "imagePrompt": "A short, 2-4 word prompt for an image generator to create a visual for the main scenario."
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
    
    // This is our agentic prompt. It uses the tools we provide.
    const agentPrompt = ai.definePrompt({
        name: 'portlandTrailAgentPrompt',
        tools: [createMeritBadge],
        prompt: promptTemplate
            .replace('{playerStatus}', playerStatus)
            .replace('{location}', location)
            .replace('{location}', location),
        output: {
            format: 'json',
            schema: GeneratePortlandScenarioOutputSchema.omit({ badgeDescription: true, badgeImagePrompt: true })
        }
    });

    try {
      console.log('[generatePortlandScenarioFlow] Calling agent prompt...');
      const llmResponse = await agentPrompt();
      const scenarioResult = llmResponse.output()!;
      
      const badgeToolRequest = llmResponse.toolRequest('createMeritBadge');

      if (badgeToolRequest) {
        console.log('[generatePortlandScenarioFlow] Agent requested to use createMeritBadge tool.');
        // If the LLM decided to call our tool, we can get the arguments it provided.
        const badgeDetails = badgeToolRequest.input;
        scenarioResult.badgeDescription = badgeDetails.badgeDescription;
        scenarioResult.badgeImagePrompt = badgeDetails.badgeImagePrompt;
      } else {
        console.log('[generatePortlandScenarioFlow] Agent did not request a badge.');
      }

      // We are simulating the 'primary' data source as we are not using the proxy for this flow anymore.
      // A more robust implementation might re-introduce the proxy/fallback logic here.
      return { ...scenarioResult, dataSource: 'primary' };

    } catch (error) {
        console.error(`[generatePortlandScenarioFlow] Agentic call failed.`, { error });
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
