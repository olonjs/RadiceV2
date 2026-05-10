import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core/runtime';
import { GalleryGridSchema } from './schema';

export type GalleryGridData = z.infer<typeof GalleryGridSchema>;
export type GalleryGridSettings = z.infer<typeof BaseSectionSettingsSchema>;

