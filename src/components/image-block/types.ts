import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core';
import { ImageBlockSchema } from './schema';

export type ImageBlockData = z.infer<typeof ImageBlockSchema>;
export type ImageBlockSettings = z.infer<typeof BaseSectionSettingsSchema>;

