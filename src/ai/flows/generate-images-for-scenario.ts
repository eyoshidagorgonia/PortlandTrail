
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
    badgePrompt: z.string().nullable().optional().describe("A detailed DALL-E prompt for the badge icon, if a badge was awarded."),
});

const generateImagesFlow = ai.defineFlow(
  {
    name: 'generateImagesFlow',
    inputSchema: GenerateImagesInputSchema,
    outputSchema: GenerateImagesOutputSchema,
  },
  async (input) => {
    console.log('[generateImagesFlow] Started.');

    // If the scenario description already seems to be a specific, detailed prompt, use it directly.
    // This handles the special case from the intro screen.
    const isDirectPrompt = input.scenarioDescription.toLowerCase().includes('portrait of a hipster named');

    if (isDirectPrompt) {
        console.log('[generateImagesFlow] Direct prompt detected. Skipping prompt generation and generating avatar directly.');
        const avatarImage = await generateImage(
            input.scenarioDescription, // Use the description as the full prompt
            'photorealistic, 3d render, photo',
            512, 512
        );
        return {
            avatarImage,
            sceneImage: '', // No scene for direct avatar prompts
            badgeImage: undefined,
            dataSource: 'primary',
        };
    }

    const badgeSection = input.badge 
        ? `
- Badge Description: ${input.badge.description}
- Badge Emoji: ${input.badge.emoji}` 
        : '';

    const prompt = `You are an expert prompt engineer for a text-to-image model.
Your task is to create three distinct, detailed, and artistic prompts based on a game scenario.
The overall art style should be consistent: "Studio Ghibli anime style, beautiful, painterly, nostalgic, soft lighting".

**1. Avatar Portrait Prompt (Style: "Ghibli Noir")**
- Create a prompt for a head-to-chest portrait of the player character.
- **Mood**: Brooding, mysterious, indie introspective.
- **Lighting**: Dramatic chiaroscuro with soft candlelight or ambient glows.
- **Colors**: Use a desaturated earth-tone palette, like Grave Moss, Blood Plum, and Espresso Charcoal.
- **Features & Style**: Give the character expressive but shadowed eyes, perhaps with a single glint of light. Hair should be tousled or styled (e.g., messy bun, undercut). You must incorporate a strong, unmistakable hipster fashion sense. Think layered flannel, turtlenecks under denim jackets, wool coats, chunky-knit beanies, round glasses, enamel pins, or visible tattoos.
- **Job Relevance**: The character is a '${input.character.job}'. It is crucial that you incorporate specific, visible elements of this job into their clothing, accessories, or immediate surroundings, blending it with the hipster aesthetic.
- **Background**: A simple, moody background like a stone wall, foggy forest, or dark wood.

**2. Scene Depiction Prompt:**
- Create a prompt for a wide-angle shot that captures the entire scenario description.
- Include key elements, mood, and the environment.
- The style must match the "Studio Ghibli anime style, beautiful, painterly, nostalgic, soft lighting" direction.

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

You MUST respond with a valid JSON object only, with no other text before or after it. If no badge is being generated, the 'badgePrompt' key should be null or omitted. The JSON object should conform to this structure:
{
    "avatarPrompt": "The generated prompt for the avatar.",
    "scenePrompt": "The generated prompt for the scene.",
    "badgePrompt": "The generated prompt for the badge (or null if no badge)."
}`;
    
    let prompts;
    try {
        prompts = await callNexixApi('gemma3:12b', prompt, ImageGenPromptOutputSchema);
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
        `${prompts.avatarPrompt}, Ghibli Noir, Studio Ghibli anime style, beautiful, painterly, nostalgic, soft lighting`,
        'photorealistic, 3d render, photo, realism',
        512, 512
    ));

    // Scene Image Promise
    imagePromises.push(generateImage(
        `${prompts.scenePrompt}, Studio Ghibli anime style, beautiful, painterly, nostalgic, soft lighting`,
        'photorealistic, 3d render, photo, realism',
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
