import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core/runtime';
import { InfoGridSchema } from './schema';

export type InfoGridData = z.infer<typeof InfoGridSchema>;
export type InfoGridSettings = z.infer<typeof BaseSectionSettingsSchema>;

