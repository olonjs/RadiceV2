import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core/runtime';
import { TextBlockSchema } from './schema';

export type TextBlockData = z.infer<typeof TextBlockSchema>;
export type TextBlockSettings = z.infer<typeof BaseSectionSettingsSchema>;

