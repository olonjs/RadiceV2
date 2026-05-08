import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core';
import { PhilosophySectionSchema } from './schema';

export type PhilosophySectionData = z.infer<typeof PhilosophySectionSchema>;
export type PhilosophySectionSettings = z.infer<typeof BaseSectionSettingsSchema>;

