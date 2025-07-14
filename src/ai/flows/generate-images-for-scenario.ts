
'use server';
/**
 * @fileOverview A flow for generating images for a game scenario using Stable Diffusion.
 *
 * - generateImagesForScenario - A function that orchestrates the generation of avatar, scene, and badge images.
 * - GenerateImagesInput - The input type for the function.
 * - GenerateImagesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateImage } from '../auto1111-api';
import type { GenerateImagesInput, GenerateImagesOutput } from '@/lib/types';
import { GenerateImagesInputSchema, GenerateImagesOutputSchema } from '@/lib/types';
import { callNexixApi } from '../nexix-api';


export async function generateImagesForScenario(input: GenerateImagesInput): Promise<GenerateImagesOutput> {
  return generateImagesFlow(input);
}

const ImageGenPromptOutputSchema = z.object({
    avatarPrompt: z.string().describe("A detailed DALL-E prompt for the character's avatar portrait."),
    scenePrompt: z.string().describe("A detailed DALL-E prompt for the scene depiction."),
    badgePrompt: z.string().optional().describe("A detailed DALL-E prompt for the badge icon, if a badge was awarded."),
});

const generateImagesFlow = ai.defineFlow(
  {
    name: 'generateImagesFlow',
    inputSchema: GenerateImagesInputSchema,
    outputSchema: GenerateImagesOutputSchema,
  },
  async (input) => {
    console.log('[generateImagesFlow] Started.');

    const badgeSection = input.badge 
        ? `
- Badge Description: ${input.badge.description}
- Badge Emoji: ${input.badge.emoji}` 
        : '';

    const prompt = `You are an expert prompt engineer for a text-to-image model.
Your task is to create three distinct, detailed, and artistic prompts based on a game scenario.
The art style should be consistent: "quirky, indie comic book art, slightly gritty, muted colors, cel-shaded".

**1. Avatar Portrait Prompt:**
- Create a prompt for a head-and-shoulders portrait of the player character.
- The character's current state is represented by a Kaomoji. Interpret this Kaomoji emotionally to influence the portrait.
- Style: Focus on a character portrait.

**2. Scene Depiction Prompt:**
- Create a prompt for a wide-angle shot that captures the entire scenario description.
- Include key elements, mood, and the environment.
- Style: Focus on a full scene.

**3. Badge Icon Prompt (if applicable):**
- If a badge is present, create a prompt for a simple, iconic, circular merit badge.
- The design should be inspired by the badge's description and emoji. It should be a single, clean icon on a simple background.
- Style: Focus on a simple, graphic icon.

**Input Data:**
- Character Name: ${input.character.name}
- Character Job: ${input.character.job}
- Character Vibe: ${input.character.vibe}
- Character Avatar Kaomoji: ${input.character.avatarKaomoji}
- Scenario: ${input.scenarioDescription}
${badgeSection}

You MUST respond with a valid JSON object only, with no other text before or after it. The JSON object should conform to this structure:
{
    "avatarPrompt": "The generated prompt for the avatar.",
    "scenePrompt": "The generated prompt for the scene.",
    "badgePrompt": "The generated prompt for the badge (or null if no badge)."
}`;
    
    let prompts;
    try {
        const apiResponse = await callNexixApi('deepseek-r1:8b', prompt);
        let parsedResult;
        try {
            parsedResult = ImageGenPromptOutputSchema.parse(JSON.parse(apiResponse));
        } catch (e) {
            console.warn("[generateImagesFlow] Failed to parse directly, attempting to unescape and parse again.", { error: e });
            const unescapedResponse = JSON.parse(apiResponse);
            parsedResult = ImageGenPromptOutputSchema.parse(JSON.parse(unescapedResponse));
        }
        prompts = parsedResult;
    } catch(error) {
        console.error("[generateImagesFlow] Failed to generate prompts via API, using fallbacks.", { error });
        // Fallback prompts
        prompts = {
            avatarPrompt: `A portrait of ${input.character.name} the ${input.character.job}`,
            scenePrompt: input.scenarioDescription,
            badgePrompt: input.badge ? `A merit badge representing ${input.badge.description}` : undefined,
        };
    }
    
    console.log('[generateImagesFlow] Generated prompts:', prompts);

    const imagePromises = [];

    // Avatar Image Promise
    imagePromises.push(generateImage(
        `${prompts.avatarPrompt}, quirky, indie comic book art, slightly gritty, muted colors, cel-shaded`,
        'photorealistic, 3d render',
        512, 512
    ));

    // Scene Image Promise
    imagePromises.push(generateImage(
        `${prompts.scenePrompt}, quirky, indie comic book art, slightly gritty, muted colors, cel-shaded`,
        'photorealistic, 3d render',
        768, 512
    ));
    
    // Badge Image Promise (conditional)
    if (prompts.badgePrompt) {
        imagePromises.push(generateImage(
            `${prompts.badgePrompt}, simple graphic icon, on a patch, white background, circular`,
            'photorealistic, 3d render, complex',
            256, 256
        ));
    } else {
        imagePromises.push(Promise.resolve(undefined));
    }

    const [avatarImage, sceneImage, badgeImage] = await Promise.all(imagePromises);

    console.log('[generateImagesFlow] All images generated.');

    return {
      avatarImage,
      sceneImage,
      badgeImage,
      dataSource: 'primary',
    };
  }
);
