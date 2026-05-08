import { z } from 'zod';
import { BaseSectionData, ImageSelectionSchema } from '@olonjs/core';

export const PhilosophySectionSchema = BaseSectionData.extend({
  label: z.string().optional().describe('ui:text'),
  headline: z.string().describe('ui:text'),
  content: z.string().describe('ui:textarea'),
  image: ImageSelectionSchema.optional(),
  imagePosition: z.enum(['left', 'right']).default('right').describe('ui:select'),
});

