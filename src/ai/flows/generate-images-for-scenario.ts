
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


export async function generateImagesForScenario(input: GenerateImagesInput): Promise<GenerateImagesOutput> {
  return generateImagesFlow(input);
}

const ImageGenPromptOutputSchema = z.object({
    avatarPrompt: z.string().describe("A detailed DALL-E prompt for the character's avatar portrait."),
    scenePrompt: z.string().describe("A detailed DALL-E prompt for the scene depiction."),
    badgePrompt: z.string().optional().describe("A detailed DALL-E prompt for the badge icon, if a badge was awarded."),
});

const imageGenPrompt = ai.definePrompt({
    name: 'imageGenPrompt',
    input: { schema: GenerateImagesInputSchema },
    output: { schema: ImageGenPromptOutputSchema },
    prompt: `You are an expert prompt engineer for a text-to-image model.
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
- Character Name: {{character.name}}
- Character Job: {{character.job}}
- Character Vibe: {{character.vibe}}
- Character Avatar Kaomoji: {{{character.avatarKaomoji}}}
- Scenario: {{{scenarioDescription}}}
{{#if badge}}
- Badge Description: {{badge.description}}
- Badge Emoji: {{badge.emoji}}
{{/if}}

Please generate the prompts now.
`,
});

const generateImagesFlow = ai.defineFlow(
  {
    name: 'generateImagesFlow',
    inputSchema: GenerateImagesInputSchema,
    outputSchema: GenerateImagesOutputSchema,
  },
  async (input) => {
    console.log('[generateImagesFlow] Started.');
    const { output } = await imageGenPrompt(input);
    const prompts = output!;
    
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
