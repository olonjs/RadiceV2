import { z } from 'zod';
import { BaseSectionData, ImageSelectionSchema } from '@olonjs/core';

export const ChefProfileSchema = BaseSectionData.extend({
  name: z.string().describe('ui:text'),
  title: z.string().describe('ui:text'),
  bio: z.string().describe('ui:textarea'),
  quote: z.string().optional().describe('ui:textarea'),
  image: ImageSelectionSchema.optional(),
});

