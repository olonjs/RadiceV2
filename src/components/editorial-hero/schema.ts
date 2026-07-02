import { z } from 'zod';
import { BaseSectionData, ImageSelectionSchema } from '@olonjs/core/runtime';
export const LocalCtaSchema = z.object({
  id: z.string().optional(),
  label: z.string().describe('ui:text'),
  href: z.string().describe('ui:text'),
  variant: z.enum(['primary', 'secondary', 'outline']).optional().default('primary').describe('ui:select'),
});
export const EditorialHeroSchema = BaseSectionData.extend({
  label: z.string().optional().describe('ui:text'),
  headline: z.string().describe('ui:textarea'),
  subheadline: z.string().optional().describe('ui:textarea'),
  primaryCta: LocalCtaSchema.optional(),
  backgroundImage: ImageSelectionSchema.optional(),
});

