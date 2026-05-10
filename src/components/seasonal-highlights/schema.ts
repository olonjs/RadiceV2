import { z } from 'zod';
import { BaseSectionData, BaseArrayItem, ImageSelectionSchema } from '@olonjs/core/runtime';

const SeasonalItemSchema = BaseArrayItem.extend({
  title: z.string().describe('ui:text'),
  season: z.string().describe('ui:text'),
  description: z.string().describe('ui:textarea'),
  ingredient: z.string().optional().describe('ui:text'),
  image: ImageSelectionSchema.optional().describe('ui:image'),
});

export const SeasonalHighlightsSchema = BaseSectionData.extend({
  label: z.string().optional().describe('ui:text'),
  title: z.string().describe('ui:text'),
  description: z.string().optional().describe('ui:textarea'),
  highlights: z.array(SeasonalItemSchema).describe('ui:list'),
});
