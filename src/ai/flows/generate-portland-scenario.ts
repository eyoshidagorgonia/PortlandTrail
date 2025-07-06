'use server';
/**
 * @fileOverview A scenario generator for the Portland Trail game.
 *
 * - generatePortlandScenario - A function that generates a scenario based on Portland's hipster culture and Diablo II elements.
 * - GeneratePortlandScenarioInput - The input type for the generatePortlandScenario function.
 * - GeneratePortlandScenarioOutput - The return type for the generatePortlandScenario function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
    .string() /* .describe('A Diablo II element integrated into the scenario.') */
    .optional(),
});
export type GeneratePortlandScenarioOutput = z.infer<typeof GeneratePortlandScenarioOutputSchema>;

export async function generatePortlandScenario(
  input: GeneratePortlandScenarioInput
): Promise<GeneratePortlandScenarioOutput> {
  return generatePortlandScenarioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePortlandScenarioPrompt',
  input: {schema: GeneratePortlandScenarioInputSchema},
  output: {schema: GeneratePortlandScenarioOutputSchema},
  prompt: `You are a game master for The Portland Trail, a game that combines the Oregon Trail with Diablo II and hipster culture. Your job is to create quirky and challenging scenarios for the player based on their current status and location.

Player Status: {{{playerStatus}}}
Current Location: {{{location}}}

Create a scenario that incorporates elements of Portland's hipster culture, \"Keep Portland Weird,\" and unexpected Diablo II-style events. Include a challenge the player must overcome and a potential reward. The Diablo II element should be subtle and unexpected. The scenario should feel unique and unpredictable.

Format your response as a JSON object:
{
  "scenario": "description of the scenario",
  "challenge": "description of the challenge",
  "reward": "description of the reward",
  "diablo2Element": "description of the Diablo II element" // Optional
}
`,
});

const generatePortlandScenarioFlow = ai.defineFlow(
  {
    name: 'generatePortlandScenarioFlow',
    inputSchema: GeneratePortlandScenarioInputSchema,
    outputSchema: GeneratePortlandScenarioOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
