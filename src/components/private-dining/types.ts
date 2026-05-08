import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core';
import { PrivateDiningSchema } from './schema';

export type PrivateDiningData = z.infer<typeof PrivateDiningSchema>;
export type PrivateDiningSettings = z.infer<typeof BaseSectionSettingsSchema>;
