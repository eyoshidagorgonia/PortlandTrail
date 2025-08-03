
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
    .describe('The current status of the player, including health, style, vinyl collection, irony, and authenticity.'),
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
  isUber: z.boolean().optional().describe('Whether this is a powerful, rare "Uber" badge.'),
});

const ConsequencesSchema = z.object({
    health: z.number().describe('The change in health. Can be positive or negative.'),
    style: z.number().describe('The change in style. Can be positive or negative.'),
    irony: z.number().describe('The change in irony. Can be positive or negative.'),
    authenticity: z.number().describe('The change in authenticity. Can be positive or negative.'),
    vibes: z.number().describe('The change in vibes. Can be positive or negative.'),
    progress: z.number().describe('The change in progress towards Portland.'),
    coffee: z.number().describe('The change in coffee beans. Can be positive or negative.'),
    vinyls: z.number().describe('The change in vinyl records. Can be positive or negative.'),
    stamina: z.number().describe('The change in bike stamina. Can be positive or negative.'),
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
  dataSource: z.enum(['primary', 'fallback', 'hardcoded']).describe('The source of the generated data.'),
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
  summonChoice: ChoiceSchema.extend({
      summonSuccess: z.boolean().describe("Whether the hipster summoning was successful."),
      uberBadge: BadgeSchema.optional().describe("The Uber badge details if summoning was successful."),
  }),
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
- If the player is struggling, generate choices with more generous rewards and less severe penalties. The "avoid" choice should have minimal negative impact.
- If the player is doing well, you can create more challenging scenarios.
- The consequences you generate should be logical. For example, choosing to leave a scenario should always grant some progress.

**Scenario Generation:**
1.  **Scenario**: A quirky, random, and challenging scenario based on the player's status and location. It must be HIGHLY SPECIFIC to the location. Incorporate local landmarks, stereotypes, or cultural touchstones. Also, subtly weave in an unexpected element inspired by the dark fantasy world of Diablo II.
2.  **Avatar Kaomoji**: Generate a creative Japanese-style Kaomoji (e.g., (⌐■_■) or ┐(‘～\` )┌) that represents the player's character based on their name and job.
3.  **Standard Choices**: Create exactly TWO standard choices for the player.
    -   The first choice should be about EMBRACING the scenario.
    -   The second choice should be about AVOIDING or LEAVING the scenario.
    -   For EACH choice, generate a full set of consequences based on your player analysis.
4.  **Badge Decision**: Decide if the "Embrace" choice is weird enough to award a standard merit badge.
5.  **"Summon Hipsters" Choice (High-Risk/High-Reward)**: Create a THIRD choice called "Summon Hipsters". This is a gamble.
    -   Randomly decide if the summoning is a SUCCESS or a FAILURE.
    -   **If SUCCESS**: The player overcomes the challenge spectacularly. The consequences should be highly beneficial (e.g., large gains in stats, resources, and progress). You MUST also award a special "Uber" Badge. Uber badges are powerful and rare. Create a suitably epic description and emoji for it.
    -   **If FAILURE**: The summoning goes horribly wrong. You must choose one of the following "Misidentified Hipster Archetypes" to be the cause of the failure. The consequences MUST be DEVASTATING (e.g., health -50, style -20, massive resource loss). The archetype chosen will determine the flavor of the failure text.
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

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object must conform to this structure:
{
  "scenario": "A description of the generated scenario.",
  "challenge": "A challenge the player must overcome in the scenario.",
  "diablo2Element": "The subtle Diablo II reference.",
  "avatarKaomoji": "The generated Kaomoji for the player.",
  "choices": [
    { "text": "Embrace", "description": "...", "consequences": { ... } },
    { "text": "Avoid", "description": "...", "consequences": { ... } }
  ],
  "summonChoice": {
      "text": "Summon Hipsters",
      "description": "Call upon the local cognoscenti for aid. What could go wrong?",
      "summonSuccess": boolean,
      "consequences": { ... }, // Consequences for success or failure
      "uberBadge": { "badgeDescription": "...", "badgeEmoji": "...", "isUber": true } // Only if summonSuccess is true
  },
  "shouldAwardBadge": boolean, // For the standard "Embrace" choice
  "badgeDescription": "Description for the standard badge (if awarded).",
  "badgeEmoji": "Emoji for the standard badge (if awarded)."
}`;

  try {
    const parsedResult = await callNexixApi('gemma3:12b', prompt, OllamaResponseSchema);

    // Combine the standard choices with the special summon choice
    const allChoices = [...parsedResult.choices, parsedResult.summonChoice];

    const output: GeneratePortlandScenarioOutput = {
      scenario: parsedResult.scenario,
      challenge: parsedResult.challenge,
      diablo2Element: parsedResult.diablo2Element,
      avatarKaomoji: parsedResult.avatarKaomoji,
      choices: allChoices,
      dataSource: 'primary'
    };

    // Handle the Uber badge from the summon choice
    if (parsedResult.summonChoice.summonSuccess && parsedResult.summonChoice.uberBadge) {
        console.log('[generatePortlandScenario] Model decided to award an UBER badge.');
        // The badge is attached to the choice's consequences now.
        // We find the choice in the final array and add the badge to its consequences.
        const summonChoiceInOutput = output.choices.find(c => c.text === "Summon Hipsters");
        if (summonChoiceInOutput) {
            (summonChoiceInOutput.consequences as any).badge = parsedResult.summonChoice.uberBadge;
        }
    }
    // Handle the standard badge from the embrace choice
    else if (parsedResult.shouldAwardBadge && parsedResult.badgeDescription && parsedResult.badgeEmoji) {
      console.log('[generatePortlandScenario] Model decided to award a standard badge.');
      // Attach the standard badge to the first choice ('Embrace')
      if (output.choices.length > 0) {
        (output.choices[0].consequences as any).badge = {
            badgeDescription: parsedResult.badgeDescription,
            badgeEmoji: parsedResult.badgeEmoji,
            isUber: false
        };
      }
    } else {
      console.log('[generatePortlandScenario] Model did not award any badge.');
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
            consequences: { health: -2, style: 5, irony: 5, authenticity: -3, vibes: 10, progress: 0, coffee: 0, vinyls: 0, stamina: 0 },
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
      badge: {
        badgeDescription: 'Fedorapocalypse Witness',
        badgeEmoji: '🐦',
      },
      dataSource: 'hardcoded',
    };
  }
}

    