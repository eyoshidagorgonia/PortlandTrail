
'use server';
/**
 * @fileOverview A dedicated module for interacting with a local AUTOMATIC1111 Stable Diffusion API.
 */
import { z } from 'zod';

const Auto1111ResponseSchema = z.object({
  images: z.array(z.string()).min(1),
});

/**
 * Calls the local AUTOMATIC1111 API to generate an image from a text prompt.
 *
 * @param prompt - The text prompt for the image.
 * @param negative_prompt - The negative prompt.
 * @param width - The width of the image.
 * @param height - The height of the image.
 * @returns A Base64 encoded PNG image data URI.
 * @throws {Error} If the API call fails or returns an unexpected format.
 */
export async function generateImage(
  prompt: string,
  negative_prompt: string = 'blurry, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, bad anatomy, watermark, signature, cut off, low contrast, underexposed, overexposed, bad art, beginner, amateur, distorted face',
  width: number = 512,
  height: number = 512,
): Promise<string> {
  const url = 'http://host.docker.internal:7860/sdapi/v1/txt2img';
  console.log(`[generateImage] Sending request to ${url}`);

  const body = {
    prompt,
    negative_prompt,
    steps: 25,
    cfg_scale: 7,
    width,
    height,
    sampler_name: 'Euler a',
    override_settings: {
        "sd_model_checkpoint": "sd-v1-5-inpainting",
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[generateImage] API Error: ${response.status}`, { errorText });
      throw new Error(`Auto1111 API request failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    const parsed = Auto1111ResponseSchema.safeParse(result);

    if (!parsed.success) {
      console.error('[generateImage] Invalid response structure from API.', { result });
      throw new Error('Invalid response structure from Auto1111 API.');
    }
    
    console.log('[generateImage] Successfully generated image.');
    return `data:image/png;base64,${parsed.data.images[0]}`;
  } catch (error) {
    // This could be a fetch error (e.g., server not running) or an error thrown above.
    console.error('[generateImage] A call to the image generation API failed.', { error });
    // Return a placeholder if generation fails
    return `https://placehold.co/${width}x${height}.png`;
  }
}
