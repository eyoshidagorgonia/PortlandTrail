
'use server';
/**
 * @fileOverview A loot generator for the Portland Trail game.
 *
 * - generateLoot - A function that generates a cache of items and potentially a badge.
 * - GenerateLootInput - The input type for the function.
 * - GenerateLootOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { callNexixApi } from '@/ai/nexix-api';
import { GenerateLootInputSchema, LootCacheSchema, GenerateLootOutputSchema } from '@/lib/types';
import type { GenerateLootInput, GenerateLootOutput } from '@/lib/types';

export async function generateLoot(input: GenerateLootInput): Promise<GenerateLootOutput> {
    return generateLootFlow(input);
}

const generateLootFlow = ai.defineFlow(
  {
    name: 'generateLootFlow',
    inputSchema: GenerateLootInputSchema,
    outputSchema: GenerateLootOutputSchema,
  },
  async (input: GenerateLootInput) => {
    console.log(`[generateLoot] Started for scenario: ${input.scenario}`);
    
    const prompt = `You are the Loot Master for "The Portland Trail," a quirky, dark, and ironic text-based RPG. Your job is to generate the contents of a loot chest that the player just opened.

**Player Status:** ${input.playerStatus}
**Triggering Event:** ${input.scenario}

**Instructions:**
1.  **Generate 1 to 3 Items**: Create a variety of items. The quality of items should be mostly "Thrifted", with "Artisanal" being uncommon, and "One-of-One" being very rare. Difficulty to attain better items should increase.
2.  **Item Properties**: Each item MUST have: \`name\`, \`type\` (one of: "Headwear", "Outerwear", "Accessory", "Footwear", "Eyewear"), \`quality\` (one of: "Thrifted", "Artisanal", "One-of-One"), \`flavorText\`, and \`modifiers\` (a JSON object of stat changes).
3.  **Generate an Optional Badge**: You have a small chance to ALSO include a special badge in the chest. If you do, the badge object MUST have three keys: 'badgeDescription' (string), 'badgeEmoji' (string), and 'isUber' (boolean). If you do not generate a badge, the 'badge' field in the output must be null.
4.  **JSON Format**: You MUST respond with only a valid JSON object, with no other text before or after it. The JSON object must contain a "loot" key (an array of item objects) and a "badge" key (either a badge object or null).

**Example Response (with badge):**
{
  "loot": [
    {
      "name": "Single-Origin Beanie",
      "type": "Headwear",
      "quality": "Artisanal",
      "flavorText": "It's not just a hat; it's a statement.",
      "modifiers": { "style": 5, "authenticity": 2 }
    }
  ],
  "badge": {
    "badgeDescription": "Found a hat in a box.",
    "badgeEmoji": "📦",
    "isUber": false
  }
}`;

    const parsedResult = await callNexixApi('gemma3:12b', prompt, LootCacheSchema);
    return { ...parsedResult, dataSource: 'primary' };
  }
);
