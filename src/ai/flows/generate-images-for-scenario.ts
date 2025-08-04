
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
    console.log('[generateImagesForScenario] Started.');

    // If the scenario description already seems to be a specific, detailed prompt, use it directly.
    // This handles the special case from the intro screen.
    const isDirectPrompt = input.scenarioDescription.toLowerCase().includes('portrait of a hipster named');

    if (isDirectPrompt) {
        console.log('[generateImagesForScenario] Direct prompt detected. Skipping prompt generation and generating avatar directly.');
        const avatarImage = await generateImage(
            `${input.scenarioDescription}, Diablo IV x Hipster x Studio Ghibli style, high-detail painterly illustration, dark fantasy shadows, soft natural lighting`,
            'photorealistic, 3d render, photo, realism, ugly, deformed',
            512, 512
        );
        return {
            avatarImage,
            sceneImage: '', // No scene for direct avatar prompts
            badgeImage: undefined,
            dataSource: 'primary',
        };
    }
    
    let prompts;
    let dataSource: 'primary' | 'hardcoded' = 'primary'; // Assume success
    try {
        const badgeSection = input.badge 
            ? `
- Badge Description: ${input.badge.description}
- Badge Emoji: ${input.badge.emoji}` 
            : '';

        const prompt = `You are an expert prompt engineer for a text-to-image model.
Your goal is to create three distinct, detailed prompts based on a game scenario, following the "Diablo IV x Hipster x Studio Ghibli" style guide.

**Core Style Formula:**
- **Art Style:** "High-detail painterly illustration with subtle grain, dark fantasy shadows, soft natural lighting, character-focused composition, Ghibli-inspired linework and brush textures."
- **Mood/Tone:** "Moody, melancholic atmosphere with magical realism and ironic modern flair."

**IMPORTANT: Do not generate an avatar prompt. The avatar is persistent and does not change. Set the 'avatarPrompt' field to null.**

**1. Scene Depiction Prompt:**
- **Task:** Create a prompt for a wide-angle shot of the entire scenario.
- **Style:** Blend Ghibli's painterly environments with Diablo's dark, gothic architecture and grit.
- **Content:** Include the key elements from the scenario description, focusing on the environment, mood, and any specific actions.
- **Lighting:** Use dramatic lighting sources like "floating lanterns," "firelight from windows," or "glowing runes."

**2. Badge Icon Prompt (if applicable):**
- **Task:** If a badge is present, create a prompt for a simple, iconic inventory item.
- **Style:** "Hand-drawn magical object on a faded parchment background, high-res fantasy sketch with ink and watercolor."
- **Content:** The icon should be a single, clean object representing the badge's description and emoji.

**Input Data:**
- Scenario: ${input.scenarioDescription}
${badgeSection}

You MUST respond with a valid JSON object only, with no other text before or after it. If no badge is being generated, the 'badgePrompt' key should be null or omitted. The 'avatarPrompt' key MUST be null.`;

        prompts = await callNexixApi('gemma3:12b', prompt, ImageGenPromptOutputSchema);
    } catch(error) {
        console.error("[generateImagesForScenario] AI call failed. Using hardcoded prompts.", { error });
        prompts = {
            avatarPrompt: null,
            scenePrompt: input.scenarioDescription,
            badgePrompt: input.badge ? `A merit badge representing ${input.badge.description}` : null,
        };
        dataSource = 'hardcoded';
    }
    
    console.log('[generateImagesForScenario] Generated prompts:', prompts);

    const imagePromises = [];

    // Avatar is no longer generated here. Push a resolved promise with an empty string.
    imagePromises.push(Promise.resolve(''));

    // Scene Image Promise
    imagePromises.push(generateImage(
        `${prompts.scenePrompt}, Studio Ghibli brushwork, Diablo IV darkness, painterly illustration`,
        'photorealistic, 3d render, photo, realism, ugly, deformed',
        768, 512
    ));
    
    // Badge Image Promise (conditional)
    if (prompts.badgePrompt) {
        imagePromises.push(generateImage(
            `${prompts.badgePrompt}, hand-drawn magical object, inventory icon, ink and watercolor, on faded parchment background`,
            'photorealistic, 3d render, complex, photo, realism',
            256, 256
        ));
    } else {
        imagePromises.push(Promise.resolve(undefined));
    }

    const [avatarImage, sceneImage, badgeImage] = await Promise.all(imagePromises);

    console.log('[generateImagesForScenario] All images generated.');

    return {
      avatarImage,
      sceneImage,
      badgeImage,
      dataSource,
    };
}

const ImageGenPromptOutputSchema = z.object({
    avatarPrompt: z.string().nullable().optional().describe("A detailed text-to-image prompt for the character's avatar portrait."),
    scenePrompt: z.string().describe("A detailed text-to-image prompt for the scene depiction."),
    badgePrompt: z.string().nullable().optional().describe("A detailed text-to-image prompt for the badge icon, if a badge was awarded."),
});

ai.defineFlow(
  {
    name: 'generateImagesFlow',
    inputSchema: GenerateImagesInputSchema,
    outputSchema: GenerateImagesOutputSchema,
  },
  generateImagesForScenario
);
