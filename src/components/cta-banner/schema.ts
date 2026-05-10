import { z } from 'zod';
import { BaseSectionData, CtaSchema } from '@olonjs/core/runtime';

export const CtaBannerSchema = BaseSectionData.extend({
  headline: z.string().describe('ui:text'),
  primaryCta: CtaSchema,
});

