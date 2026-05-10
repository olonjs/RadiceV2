import { z } from 'zod';
import { BaseSectionData, BaseArrayItem, ImageSelectionSchema, CtaSchema } from '@olonjs/core/runtime';

const AwardItemSchema = BaseArrayItem.extend({
  title: z.string().describe('ui:text'),
  subtitle: z.string().describe('ui:text'),
});

export const FineDiningHeroSchema = BaseSectionData.extend({
  badge: z.string().optional().describe('ui:text'),
  title: z.string().describe('ui:text'),
  titleHighlight: z.string().optional().describe('ui:text'),
  description: z.string().describe('ui:textarea'),
  primaryCta: CtaSchema.describe('ui:cta'),
  secondaryCta: CtaSchema.optional().describe('ui:cta'),
  image: ImageSelectionSchema.optional().describe('ui:image'),
  awards: z.array(AwardItemSchema).optional().describe('ui:list'),
});
