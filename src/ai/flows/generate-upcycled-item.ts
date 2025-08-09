
'use server';
/**
 * @fileOverview An item generator for the upcycling feature.
 *
 * - generateUpcycledItem - A function that generates a single, powerful or cursed item.
 * - GenerateUpcycledItemInput - The input type for the function.
 * - GenerateUpcycledItemOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { callNexixApi } from '@/ai/nexix-api';
import { LootItemSchema, GearQualityEnum, GenerateUpcycledItemInputSchema, GenerateUpcycledItemOutputSchema } from '@/lib/types';
import type { GenerateUpcycledItemInput, GenerateUpcycledItemOutput } from '@/lib/types';

function getNextQuality(quality: z.infer<typeof GearQualityEnum>): z.infer<typeof GearQualityEnum> {
    if (quality === 'Thrifted') return 'Artisanal';
    return 'One-of-One';
}

export async function generateUpcycledItem(input: GenerateUpcycledItemInput): Promise<GenerateUpcycledItemOutput> {
  return upcycleItemFlow(input);
}

const upcycleItemFlow = ai.defineFlow(
  {
    name: 'upcycleItemFlow',
    inputSchema: GenerateUpcycledItemInputSchema,
    outputSchema: GenerateUpcycledItemOutputSchema,
  },
  async ({ inputQuality, isBlessed }) => {
    console.log(`[upcycleItemFlow] Started. Input Quality: ${inputQuality}, Blessed: ${isBlessed}`);
    
    const outputQuality = getNextQuality(inputQuality);
    const outcomeDescription = isBlessed
        ? 'This item MUST be "blessed" - give it exceptionally powerful positive stat modifiers. It should feel like a legendary item.'
        : 'This item MUST be "cursed" - the negative stat modifiers MUST significantly outweigh any positive ones. It should be a risky, potentially detrimental item to equip.';

    const prompt = `You are the Upcycling Artisan for "The Portland Trail," a quirky, dark, and ironic text-based RPG. Your job is to forge a single new item from the remnants of three lesser items.

**Instructions:**
1.  **Generate a Single Item**: Create one new equipment piece.
2.  **Determine Output Quality**: The input items were of "${inputQuality}" quality. The new item MUST be of "${outputQuality}" quality.
3.  **Apply Outcome**: ${outcomeDescription}
4.  **Item Properties**: The item MUST have: \`name\`, \`type\` (one of: "Headwear", "Outerwear", "Accessory", "Footwear", "Eyewear"), \`quality\` (must be "${outputQuality}"), \`flavorText\`, and \`modifiers\` (a JSON object of stat changes reflecting the blessed/cursed outcome).
5.  **JSON Format**: You MUST respond with only a valid JSON object, with no other text before or after it. The JSON object must contain a single key "item" which is the generated item object.

**Example Response (Cursed "Artisanal" item):**
{
  "item": {
    "name": "Deconstructed Denim Jacket",
    "type": "Outerwear",
    "quality": "Artisanal",
    "flavorText": "It's more holes than jacket, which is the point. Probably.",
    "modifiers": { "style": 20, "authenticity": -15, "health": -5 }
  }
}`;

    const result = await callNexixApi('gemma3:12b', prompt, z.object({ item: LootItemSchema }));
    return { item: result.item, dataSource: 'primary' };
  }
);
