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
    .string()
    .optional(),
  imagePrompt: z.string().describe('A short, 2-4 word prompt for an image generator to create a visual for this scenario. e.g. "Pigeons in hats" or "Man with handlebar mustache"'),
});
export type GeneratePortlandScenarioOutput = z.infer<typeof GeneratePortlandScenarioOutputSchema>;

export async function generatePortlandScenario(
  input: GeneratePortlandScenarioInput
): Promise<GeneratePortlandScenarioOutput> {
  return generatePortlandScenarioFlow(input);
}

const promptTemplate = `You are a game master for The Portland Trail, a game that combines the Oregon Trail with Diablo II and modern hipster culture. Your job is to create quirky, random, and challenging scenarios for the player based on their current status and, most importantly, their location on the trail from San Francisco to Portland.

Player Status: {playerStatus}
Current Location: {location}

Create a scenario that is HIGHLY SPECIFIC to the current location: {location}. The scenario should feel like it could only happen there. Incorporate local landmarks, stereotypes, or cultural touchstones associated with that place. For example, a scenario in San Francisco might involve tech bros and sourdough, while a scenario in Ashland could involve the Shakespeare Festival.

Also, subtly weave in an unexpected element inspired by the dark fantasy world of Diablo II. This could be a strange item, a mysterious character, or an odd event that feels out of place.

The scenario should feel unique, unpredictable, and a bit weird. Ensure it's not a generic event that could happen anywhere.

Include a challenge the player must overcome, a potential reward, and a short prompt (2-4 words) for an image generator.

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
  "scenario": "description of the scenario",
  "challenge": "description of the challenge",
  "reward": "description of the reward",
  "diablo2Element": "description of the Diablo II element",
  "imagePrompt": "a short 2-4 word image prompt"
}
`;

// This flow now calls Ollama directly via fetch to avoid plugin issues.
const generatePortlandScenarioFlow = ai.defineFlow(
  {
    name: 'generatePortlandScenarioFlow',
    inputSchema: GeneratePortlandScenarioInputSchema,
    outputSchema: GeneratePortlandScenarioOutputSchema,
  },
  async ({ playerStatus, location }) => {
    const prompt = promptTemplate
      .replace('{playerStatus}', playerStatus)
      .replace('{location}', location)
      .replace('{location}', location); // second replace for the second template variable

    try {
      const response = await fetch('http://host.docker.internal:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemma:7b',
          prompt: prompt,
          stream: false,
          format: 'json', // Requesting JSON output format from Ollama
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Ollama API error response:', errorBody);
        throw new Error(`Ollama API request failed with status ${response.status}`);
      }
      
      const ollamaResponse = await response.json();
      
      let responseText = ollamaResponse.response;

      // Sometimes the model returns markdown with the JSON inside, so we extract it.
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }
      
      // The actual response from the model is a string inside the 'response' field.
      // We need to parse this string as JSON.
      const result = JSON.parse(responseText);
      
      // Validate the result against the Zod schema
      return GeneratePortlandScenarioOutputSchema.parse(result);

    } catch (error)
    {
        console.error("Error calling Ollama or parsing response:", error);
        // Provide a fallback scenario in case of an error
        return {
            scenario: "You encounter a glitch in the hipster matrix. A flock of identical pigeons, all wearing tiny fedoras, stares at you menacingly before dispersing.",
            challenge: "Question your reality",
            reward: "A fleeting sense of existential dread, which oddly increases your irony.",
            diablo2Element: "You feel as though you've just witnessed a 'Diablo Clone' event, but for birds.",
            imagePrompt: "pigeons wearing fedoras"
        }
    }
  }
);
