import { z } from 'zod';
import { BaseSectionData } from '@olonjs/core/runtime';

export const LocalCtaSchema = z.object({
  id: z.string().optional(),
  label: z.string().describe('ui:text'),
  href: z.string().describe('ui:text'),
  variant: z.enum(['primary', 'secondary', 'outline']).optional().default('primary').describe('ui:select'),
});

export const CtaBannerSchema = BaseSectionData.extend({
  headline: z.string().describe('ui:text'),
  primaryCta: LocalCtaSchema.optional(),
});

