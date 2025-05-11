// src/ai/flows/generate-image.ts
'use server';

/**
 * @fileOverview Image generation flow using Google Gemini API.
 *
 * - generateImage - A function that generates an image based on a text prompt, aspect ratio, and style preset.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('Text prompt to generate the image from.'),
  aspectRatio: z.string().optional().describe('Desired aspect ratio (e.g., "square", "landscape", "portrait").'),
  stylePreset: z.string().optional().describe('Artistic style for the image (e.g., "photorealistic", "cartoon").'),
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
      photorealistic: "photorealistic style",
      'digital art': "digital art style",
      cartoon: "cartoon style",
      abstract: "abstract style",
      impressionistic: "impressionistic painting style",
      fantasy: "fantasy art style",
    };

    if (input.aspectRatio && aspectHints[input.aspectRatio]) {
      effectivePrompt += `, ${aspectHints[input.aspectRatio]}`;
    }

    if (input.stylePreset && input.stylePreset !== 'none' && styleHints[input.stylePreset]) {
      effectivePrompt += `, ${styleHints[input.stylePreset]}`;
    }
    
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: effectivePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
        ],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed: The model did not return an image URL.');
    }

    return {imageUrl: media.url};
  }
);
