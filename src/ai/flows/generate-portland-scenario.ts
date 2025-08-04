
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
import { ChoiceSchema } from '@/lib/types';

const GeneratePortlandScenarioInputSchema = z.object({
  playerStatus: z
    .string()
    .describe('The current status of the player, including health, style, vinyl collection, irony, and authenticity.'),
  location: z.string().describe('The current location of the player on the trail.'),
  character: z.object({
    name: z.string(),
    job: z.string(),
  }),
});
export type GeneratePortlandScenarioInput = z.infer<typeof GeneratePortlandScenarioInputSchema>;

const GeneratePortlandScenarioOutputSchema = z.object({
  scenario: z.string().describe('A description of the generated scenario.'),
  challenge: z.string().describe('A challenge the player must overcome in the scenario.'),
  diablo2Element: z.string().optional().describe('The subtle Diablo II reference.'),
  avatarKaomoji: z.string().describe('A Japanese-style Kaomoji (e.g., (⌐■_■) or ┐(‘～` )┌) representing the player character.'),
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
  choices: z.array(ChoiceSchema),
});

export async function generatePortlandScenario(
  input: GeneratePortlandScenarioInput
): Promise<GeneratePortlandScenarioOutput> {
  console.log('[generatePortlandScenario] Started with agent flow.');
  
  let result;
  let dataSource: 'primary' | 'hardcoded' = 'primary';

  try {
        const prompt = `You are the Game Master for "The Portland Trail," a quirky text-based RPG.
Your job is to create a complete, self-contained scenario for the player, including balanced choices and consequences.

**Player Analysis & Consequence Generation:**
First, analyze the player's current status.
- If the player is struggling, generate choices with more generous rewards and less severe penalties. The "avoid" choice should have minimal negative impact.
- If the player is doing well, you can create more challenging scenarios.
- The consequences you generate should be logical. For example, choosing to leave a scenario should always grant some progress.
- The consequences for each choice must include all required fields: health, style, irony, authenticity, vibes, progress, coffee, vinyls, stamina.

**Scenario Generation & Choices:**
1.  **Scenario & Challenge**: A quirky, random scenario based on the player's status and location. It must be HIGHLY SPECIFIC to the location. Incorporate local landmarks or stereotypes. Subtly weave in an unexpected element inspired by the dark fantasy world of Diablo II.
2.  **Avatar Kaomoji**: Generate a creative Japanese-style Kaomoji (e.g., (⌐■_■) or ┐(‘～\` )┌) that represents the player's character based on their name and job.
3.  **Standard Choices (2 total)**:
    -   Choice 1: About EMBRACING the scenario. Decide if this is weird enough to award a standard merit badge. If so, add a 'badge' object to its consequences.
    -   Choice 2: About AVOIDING or LEAVING the scenario.
    -   For EACH choice, generate a full set of balanced consequences.
4.  **"Summon Hipsters" Choice (1 total)**:
    -   This is a HIGH-RISK/HIGH-REWARD choice.
    -   Randomly decide if the summoning is a SUCCESS or a FAILURE.
    -   **If SUCCESS**: The player overcomes the challenge spectacularly. Consequences should be highly beneficial. You MUST award a special "Uber" Badge by adding a 'badge' object to its consequences with 'isUber' set to true. Create a suitably epic description and emoji for it.
    -   **If FAILURE**: The summoning goes horribly wrong. Choose a "Misidentified Hipster Archetype" to be the cause. Consequences MUST be DEVASTATING (e.g., health -50, massive resource loss).
        -   **Hipster Misidentification Chart**:
            -   Lawful Good: Art Student (Politely causes immense collateral damage)
            -   Neutral Good: Barista (Spills scalding, ethically-sourced coffee everywhere)
            -   Chaotic Good: Obscure Band Member (Their "art" is just noise, causing psychic damage)
            -   Lawful Neutral: Normcore Minimalist (So boring it drains the life out of the scene)
            -   True Neutral: Photographer (Their flash photography reveals a terrible truth)
            -   Chaotic Neutral: The Actual Hipster (Unpredictable, ironic, makes things worse on purpose)
            -   Lawful Evil: Lumberjack (Methodically dismantles the entire scene)
            -   Neutral Evil: Wizard/Druid (Casts a dark, inconvenient curse on the player)
            -   Chaotic Evil: Homeless (Mistaken) (A grim, reality-check that shatters the player's ironic detachment)
    -   The "text" and "description" for this choice should reflect the risk.

**Player Status:** ${input.playerStatus}
**Location:** ${input.location}
**Character:** Name: ${input.character.name}, Job: ${input.character.job}

You MUST respond with a valid JSON object only, with no other text before or after it.`;

    result = await callNexixApi('gemma3:12b', prompt, OllamaResponseSchema);
  } catch (error) {
    console.error(`[generatePortlandScenario] AI call failed. Returning hard-coded scenario.`, { error });
    dataSource = 'hardcoded';
    result = {
        scenario: "You encounter a glitch in the hipster matrix. A flock of identical pigeons, all wearing tiny fedoras, stares at you menacingly before dispersing.",
        challenge: 'Question your reality',
        diablo2Element: "You feel as though you've just witnessed a 'Diablo Clone' event, but for birds.",
        avatarKaomoji: '(o_O;)',
        choices: [
            {
                text: 'Embrace the weirdness',
                description: "What's the worst that could happen?",
                consequences: { health: -2, style: 5, irony: 5, authenticity: -3, vibes: 10, progress: 0, coffee: 0, vinyls: 0, stamina: 0, badge: { badgeDescription: 'Fedorapocalypse Witness', badgeEmoji: '🐦', isUber: false } },
            },
            {
                text: 'Skedaddle',
                description: 'This is too much. Time to leave.',
                consequences: { health: -1, style: -2, irony: 0, authenticity: 0, vibes: -5, progress: 3, coffee: 0, vinyls: 0, stamina: -5 },
            },
            {
                text: 'Summon Hipsters',
                description: 'Call upon the local cognoscenti for aid. What could go wrong?',
                consequences: { health: -50, style: -20, irony: -20, authenticity: -20, vibes: -50, progress: 0, coffee: -10, vinyls: -2, stamina: -50 },
            }
        ],
    };
  }

  const output: GeneratePortlandScenarioOutput = {
    ...result,
    dataSource: dataSource,
  };

  // Log badge decisions for debugging, only if not hardcoded
  if (dataSource !== 'hardcoded') {
    const embraceChoice = output.choices.find(c => c.text.toLowerCase().includes('embrace'));
    if (embraceChoice && (embraceChoice.consequences as any).badge) {
        console.log('[generatePortlandScenario] Model decided to award a standard badge.');
    }
    const summonChoice = output.choices.find(c => c.text.toLowerCase().includes('summon'));
    if (summonChoice && (summonChoice.consequences as any).badge) {
        console.log('[generatePortlandScenario] Model decided to award an UBER badge.');
    }
  }
  
  return output;
}

ai.defineFlow(
  {
    name: 'generatePortlandScenarioFlow',
    inputSchema: GeneratePortlandScenarioInputSchema,
    outputSchema: GeneratePortlandScenarioOutputSchema,
  },
  generatePortlandScenario
);
