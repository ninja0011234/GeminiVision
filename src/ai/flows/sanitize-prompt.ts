// This is an AI-generated file. Do not edit directly.
'use server';

/**
 * @fileOverview Sanitizes user prompts before sending them to the Google Gemini API.
 *
 * - sanitizePrompt - A function that sanitizes the prompt.
 * - SanitizePromptInput - The input type for the sanitizePrompt function.
 * - SanitizePromptOutput - The return type for the sanitizePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SanitizePromptInputSchema = z.object({
  prompt: z.string().describe('The user-provided prompt to sanitize.'),
});
export type SanitizePromptInput = z.infer<typeof SanitizePromptInputSchema>;

const SanitizePromptOutputSchema = z.object({
  sanitizedPrompt: z
    .string()
    .describe('The sanitized prompt, safe for use with the Gemini API.'),
});
export type SanitizePromptOutput = z.infer<typeof SanitizePromptOutputSchema>;

export async function sanitizePrompt(input: SanitizePromptInput): Promise<SanitizePromptOutput> {
  return sanitizePromptFlow(input);
}

const sanitizePromptPrompt = ai.definePrompt({
  name: 'sanitizePromptPrompt',
  input: {schema: SanitizePromptInputSchema},
  output: {schema: SanitizePromptOutputSchema},
  prompt: `You are an AI assistant that sanitizes user prompts to ensure they are safe and appropriate for image generation.

  Your goal is to prevent the generation of harmful, unethical, or inappropriate content.

  Rewrite the following prompt to remove any potentially problematic elements while preserving the user's intent as much as possible.

  Original Prompt: {{{prompt}}}

  Sanitized Prompt:`,
  config: {
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
      {
        category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const sanitizePromptFlow = ai.defineFlow(
  {
    name: 'sanitizePromptFlow',
    inputSchema: SanitizePromptInputSchema,
    outputSchema: SanitizePromptOutputSchema,
  },
  async input => {
    const {output} = await sanitizePromptPrompt(input);
    return output!;
  }
);
