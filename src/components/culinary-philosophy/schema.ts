import { z } from 'zod';
import { BaseSectionData, ImageSelectionSchema } from '@olonjs/core/runtime';

export const CulinaryPhilosophySchema = BaseSectionData.extend({
  label: z.string().optional().describe('ui:text'),
  title: z.string().describe('ui:text'),
  subtitle: z.string().optional().describe('ui:text'),
  description: z.string().describe('ui:textarea'),
  quote: z.string().optional().describe('ui:textarea'),
  author: z.string().optional().describe('ui:text'),
  authorTitle: z.string().optional().describe('ui:text'),
  image: ImageSelectionSchema.optional().describe('ui:image'),
});
