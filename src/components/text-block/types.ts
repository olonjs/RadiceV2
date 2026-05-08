import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core';
import { TextBlockSchema } from './schema';

export type TextBlockData = z.infer<typeof TextBlockSchema>;
export type TextBlockSettings = z.infer<typeof BaseSectionSettingsSchema>;

