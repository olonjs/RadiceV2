import { z } from 'zod';
import { BaseSectionData, ImageSelectionSchema } from '@olonjs/core';

export const ImageBlockSchema = BaseSectionData.extend({
  image: ImageSelectionSchema.describe('ui:image-picker'),
  caption: z.string().optional().describe('ui:text'),
});

