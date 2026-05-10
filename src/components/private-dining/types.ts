import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core/runtime';
import { PrivateDiningSchema } from './schema';

export type PrivateDiningData = z.infer<typeof PrivateDiningSchema>;
export type PrivateDiningSettings = z.infer<typeof BaseSectionSettingsSchema>;
