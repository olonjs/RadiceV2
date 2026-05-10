import { z } from 'zod';
import { BaseSectionData, CtaSchema } from '@olonjs/core/runtime';

export const ReservationCtaSchema = BaseSectionData.extend({
  title: z.string().describe('ui:text'),
  subtitle: z.string().optional().describe('ui:text'),
  description: z.string().optional().describe('ui:textarea'),
  primaryCta: CtaSchema.describe('ui:cta'),
  secondaryCta: CtaSchema.optional().describe('ui:cta'),
  note: z.string().optional().describe('ui:text'),
});
