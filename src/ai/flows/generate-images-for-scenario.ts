
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

        const prompt = `You are an expert prompt engineer for a text-to-image model. Create three distinct, detailed prompts based on a game scenario, following a "Diablo IV x Hipster x Studio Ghibli" style.

**IMPORTANT: Do not generate an avatar prompt. The avatar is persistent. Set the 'avatarPrompt' field to null.**

**Input Data:**
- Scenario: ${input.scenarioDescription}
${badgeSection}

You MUST respond with a valid JSON object only, with no other text before or after it. Your response should contain 'scenePrompt' (string) and 'badgePrompt' (string or null). 'avatarPrompt' MUST be null.`;

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
