import { z } from 'zod';
import { BaseSectionData, BaseArrayItem, ImageSelectionSchema } from '@olonjs/core/runtime';

const GalleryItemSchema = BaseArrayItem.extend({
  image: ImageSelectionSchema.describe('ui:image-picker'),
  caption: z.string().optional().describe('ui:text'),
});

export const GalleryGridSchema = BaseSectionData.extend({
  headline: z.string().optional().describe('ui:text'),
  items: z.array(GalleryItemSchema).describe('ui:list'),
});

