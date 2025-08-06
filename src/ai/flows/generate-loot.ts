
'use server';
/**
 * @fileOverview A loot generator for the Portland Trail game.
 *
 * - generateLoot - A function that generates a cache of 1-3 loot items.
 * - GenerateLootInput - The input type for the function.
 * - GenerateLootOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { callNexixApi } from '@/ai/nexix-api';
import { GenerateLootInputSchema, GenerateLootOutputSchema, LootItemSchema } from '@/lib/types';
import type { GenerateLootInput, GenerateLootOutput } from '@/lib/types';

const OutputSchema = z.object({
  loot: z.array(LootItemSchema).min(1).max(3),
});

const GenerateLootAndSourceOutputSchema = GenerateLootOutputSchema.extend({
    dataSource: z.enum(['primary', 'hardcoded']).describe('The source of the generated data.'),
});
type GenerateLootAndSourceOutput = z.infer<typeof GenerateLootAndSourceOutputSchema>;

export async function generateLoot(input: GenerateLootInput): Promise<GenerateLootAndSourceOutput> {
    console.log(`[generateLoot] Started for scenario: ${input.scenario}`);
    
    const prompt = `You are the Loot Master for "The Portland Trail," a quirky, dark, and ironic text-based RPG. Your job is to generate a cache of 1 to 3 thematically appropriate items.

**Player Status:** ${input.playerStatus}
**Triggering Event:** ${input.scenario}

**Instructions:**
1.  **Generate 1 to 3 Items**: Create a variety of items.
2.  **Item Properties**: Each item MUST have the following properties:
    *   \`name\`: A quirky, thematic name (e.g., "Infinity Scarf of Inscrutability").
    *   \`type\`: The equipment slot. Must be one of: "Headwear", "Outerwear", "Accessory", "Footwear", "Eyewear".
    *   \`quality\`: The item's quality tier. Must be one of: "Thrifted", "Artisanal", "One-of-One".
    *   \`flavorText\`: A short, ironic description.
    *   \`modifiers\`: A JSON object of stat changes. All stats are optional. Use negative numbers for penalties. Example: \`{ "style": 10, "authenticity": -5 }\`.
3.  **JSON Format**: You MUST respond with only a valid JSON object, with no other text before or after it. The JSON object must contain a single key "loot" which is an array of item objects.

**Example Item:**
{
  "name": "Single-Origin Beanie",
  "type": "Headwear",
  "quality": "Artisanal",
  "flavorText": "It's not just a hat; it's a statement about ethical alpaca farming.",
  "modifiers": {
    "style": 5,
    "authenticity": 2
  }
}`;

    const parsedResult = await callNexixApi('gemma3:12b', prompt, OutputSchema);
    return { ...parsedResult, dataSource: 'primary' };
}

ai.defineFlow(
  {
    name: 'generateLootFlow',
    inputSchema: GenerateLootInputSchema,
    outputSchema: GenerateLootAndSourceOutputSchema,
  },
  generateLoot
);
