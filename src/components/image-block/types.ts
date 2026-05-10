import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core/runtime';
import { ImageBlockSchema } from './schema';

export type ImageBlockData = z.infer<typeof ImageBlockSchema>;
export type ImageBlockSettings = z.infer<typeof BaseSectionSettingsSchema>;

