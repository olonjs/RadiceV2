import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core';
import { WineProgramSchema } from './schema';

export type WineProgramData = z.infer<typeof WineProgramSchema>;
export type WineProgramSettings = z.infer<typeof BaseSectionSettingsSchema>;
