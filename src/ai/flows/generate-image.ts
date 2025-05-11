// src/ai/flows/generate-image.ts
'use server';

/**
 * @fileOverview Image generation flow using Google Gemini API.
 *
 * - generateImage - A function that generates an image based on a text prompt and various control parameters.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('Text prompt to generate the image from.'),
  aspectRatio: z.string().optional().describe('Desired aspect ratio (e.g., "square", "landscape", "portrait").'),
  stylePreset: z.string().optional().describe('Artistic style for the image (e.g., "photorealistic", "cartoon", "anime").'),
  quality: z.string().optional().describe('Desired image quality (e.g., "standard", "high", "ultra").'),
  negativePrompt: z.string().optional().describe('Elements to exclude from the image.'),
  seed: z.number().int().positive().optional().describe('Seed for deterministic image generation (experimental).'),
  lighting: z.string().optional().describe('Lighting style for the image (e.g., "cinematic", "natural").'),
  colorScheme: z.string().optional().describe('Color scheme for the image (e.g., "vibrant", "monochrome").'),
  cameraView: z.string().optional().describe('Camera view or angle (e.g., "close_up", "wide_shot").'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The generated image as a data URI.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async input => {
    let effectivePrompt = input.prompt;

    const aspectHints: Record<string, string> = {
      square: "square image, 1:1 aspect ratio",
      landscape: "landscape orientation, 16:9 aspect ratio, wide image",
      portrait: "portrait orientation, 9:16 aspect ratio, tall image",
    };

    const styleHints: Record<string, string> = {
      photorealistic: "photorealistic style, hyperrealistic, 8k",
      'digital art': "digital art, concept art, vibrant colors",
      cartoon: "cartoon style, animated movie style, playful",
      abstract: "abstract art, non-representational, geometric patterns",
      impressionistic: "impressionistic painting, visible brushstrokes, soft light",
      fantasy: "fantasy art, epic, magical, mythical creatures",
      anime: "anime style, Japanese animation, cel shaded",
      isometric: "isometric view, 3D perspective, clean lines",
      pixelart: "pixel art style, retro game graphics, 8-bit",
      watercolor: "watercolor painting, soft washes, blended colors",
      surreal: "surrealistic style, dreamlike, bizarre imagery",
      minimalist: "minimalist style, simple, clean, uncluttered",
      steampunk: "steampunk style, victorian technology, gears and cogs"
    };

    const qualityHints: Record<string, string> = {
      standard: "good quality, clear image",
      high: "high quality, detailed, sharp focus, intricate details",
      ultra: "ultra high quality, extremely detailed, masterpiece, professional lighting, 8k resolution, fine art",
    };

    const lightingHints: Record<string, string> = {
        cinematic: "cinematic lighting, dramatic shadows, high contrast",
        natural: "natural lighting, soft shadows, realistic light",
        studio: "studio lighting, controlled illumination, softbox light",
        ambient: "ambient occlusion, soft indirect lighting, global illumination",
        backlit: "backlit, rim lighting, silhouette effect",
        volumetric: "volumetric lighting, light rays, atmospheric haze",
        moody: "moody lighting, dark, mysterious atmosphere",
    };

    const colorSchemeHints: Record<string, string> = {
        vibrant: "vibrant colors, highly saturated, rich hues",
        monochrome: "monochrome, black and white, grayscale",
        pastel: "pastel colors, soft tones, muted palette",
        warm: "warm color palette, reds, oranges, yellows",
        cool: "cool color palette, blues, greens, purples",
        neon: "neon colors, glowing, fluorescent, cyberpunk aesthetic",
        sepia: "sepia tone, vintage, brownish tint",
    };

    const cameraViewHints: Record<string, string> = {
        eye_level: "eye-level shot, standard perspective",
        close_up: "close-up shot, detailed view",
        medium_shot: "medium shot, waist up",
        full_shot: "full shot, full body in frame",
        wide_shot: "wide shot, landscape, establishing shot",
        macro: "macro shot, extreme close-up, tiny details",
        birds_eye: "bird's eye view, top-down perspective, overhead shot",
        low_angle: "low angle shot, looking up, worm's eye view",
        high_angle: "high angle shot, looking down",
        dutch_angle: "dutch angle, tilted camera, canted angle",
    };

    if (input.aspectRatio && aspectHints[input.aspectRatio]) {
      effectivePrompt += `, ${aspectHints[input.aspectRatio]}`;
    }
    if (input.stylePreset && input.stylePreset !== 'none' && styleHints[input.stylePreset]) {
      effectivePrompt += `, ${styleHints[input.stylePreset]}`;
    }
    if (input.quality && input.quality !== 'standard' && qualityHints[input.quality]) {
      effectivePrompt += `, ${qualityHints[input.quality]}`;
    }
    if (input.lighting && input.lighting !== 'none' && lightingHints[input.lighting]) {
      effectivePrompt += `, ${lightingHints[input.lighting]}`;
    }
    if (input.colorScheme && input.colorScheme !== 'none' && colorSchemeHints[input.colorScheme]) {
      effectivePrompt += `, ${colorSchemeHints[input.colorScheme]}`;
    }
    if (input.cameraView && input.cameraView !== 'none' && cameraViewHints[input.cameraView]) {
      effectivePrompt += `, ${cameraViewHints[input.cameraView]}`;
    }

    if (input.negativePrompt && input.negativePrompt.trim() !== "") {
        effectivePrompt += `. Avoid the following: ${input.negativePrompt.trim()}`;
    }
    
    const generationConfig: Record<string, any> = {
        responseModalities: ['TEXT', 'IMAGE'], 
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
    };
    
    if (input.seed) {
        effectivePrompt += `, generation seed: ${input.seed}`;
    }

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: effectivePrompt,
      config: generationConfig,
    });

    if (!media?.url) {
      throw new Error('Image generation failed: The model did not return an image URL. This could be due to safety filters, a very complex prompt, or an internal issue.');
    }

    return {imageUrl: media.url};
  }
);
