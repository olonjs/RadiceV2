import { z } from 'zod';
import { BaseSectionData, CtaSchema, ImageSelectionSchema } from '@olonjs/core/runtime';

export const EditorialHeroSchema = BaseSectionData.extend({
  label: z.string().optional().describe('ui:text'),
  headline: z.string().describe('ui:textarea'),
  subheadline: z.string().optional().describe('ui:textarea'),
  primaryCta: CtaSchema.optional(),
  backgroundImage: ImageSelectionSchema.optional(),
});

