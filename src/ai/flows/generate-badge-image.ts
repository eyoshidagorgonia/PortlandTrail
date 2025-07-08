'use server';
/**
 * @fileOverview A badge image generator for the Portland Trail game.
 *
 * - generateBadgeImage - A function that generates an image for a game badge.
 * - GenerateBadgeImageInput - The input type for the generateBadgeImage function.
 * - GenerateBadgeImageOutput - The return type for the generateBadgeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBadgeImageInputSchema = z.object({
  prompt: z.string().describe('A short prompt describing the badge to generate.'),
});
export type GenerateBadgeImageInput = z.infer<typeof GenerateBadgeImageInputSchema>;

const GenerateBadgeImageOutputSchema = z.object({
  imageDataUri: z.string().describe("A generated image for the badge, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateBadgeImageOutput = z.infer<typeof GenerateBadgeImageOutputSchema>;

export async function generateBadgeImage(input: GenerateBadgeImageInput): Promise<GenerateBadgeImageOutput> {
  return generateBadgeImageFlow(input);
}

const generateBadgeImageFlow = ai.defineFlow(
  {
    name: 'generateBadgeImageFlow',
    inputSchema: GenerateBadgeImageInputSchema,
    outputSchema: GenerateBadgeImageOutputSchema,
  },
  async ({prompt}) => {
    try {
        const {media} = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `A small, circular, embroidered patch-style merit badge for a video game. The badge depicts: ${prompt}. The style should be slightly quirky and vintage, with a 16-bit pixel art aesthetic.`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        
        return { imageDataUri: media.url };
    } catch (error) {
        console.error("Error generating badge image:", error);
        // Return a placeholder image on error
        return { imageDataUri: 'https://placehold.co/64x64.png' };
    }
  }
);
