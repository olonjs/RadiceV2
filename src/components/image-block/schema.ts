import { z } from 'zod';
import { BaseSectionData, ImageSelectionSchema } from '@olonjs/core/runtime';

export const ImageBlockSchema = BaseSectionData.extend({
  image: ImageSelectionSchema,
  caption: z.string().optional().describe('ui:text'),
});

