
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
 * @returns A Base64 encoded PNG image data URI, or a placeholder URL on failure.
 * @throws {Error} If the API key is not set.
 */
export async function generateImage(
  prompt: string,
  negative_prompt: string = 'blurry, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, bad anatomy, watermark, signature, cut off, low contrast, underexposed, overexposed, bad art, beginner, amateur, distorted face',
  width: number = 512,
  height: number = 512,
): Promise<string> {
  const url = 'https://modelapi.nexix.ai/api/v1/sd/txt2img';
  const apiKey = process.env.NEXIX_API_KEY;

  if (!apiKey) {
    throw new Error('NEXIX_API_KEY environment variable is not set for image generation.');
  }

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
        "sd_model_checkpoint": "sd_xl_base_1.0.safetensors",
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[generateImage] API Error: ${response.status}`, { errorText });
      // Do not throw here, instead return a placeholder.
      return `https://placehold.co/${width}x${height}.png`;
    }

    const result = await response.json();
    const parsed = Auto1111ResponseSchema.safeParse(result);

    if (!parsed.success) {
      console.error('[generateImage] Invalid response structure from API.', { result });
      return `https://placehold.co/${width}x${height}.png`;
    }
    
    console.log('[generateImage] Successfully generated image.');
    return `data:image/png;base64,${parsed.data.images[0]}`;
  } catch (error) {
    // This could be a fetch error (e.g., server not running) or a JSON parsing error.
    console.error('[generateImage] A call to the image generation API failed.', { error: error instanceof Error ? error.message : String(error) });
    // Return a placeholder if generation fails for any reason inside the try block.
    return `https://placehold.co/${width}x${height}.png`;
  }
}
