import { z } from 'zod';
import { BaseSectionData } from '@olonjs/core/runtime';

export const TextBlockSchema = BaseSectionData.extend({
  label: z.string().optional().describe('ui:text'),
  headline: z.string().optional().describe('ui:text'),
  content: z.string().describe('ui:textarea'),
  alignment: z.enum(['left', 'center']).default('center').describe('ui:select'),
});

