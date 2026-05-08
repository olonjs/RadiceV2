import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core';
import { FineDiningHeroSchema } from './schema';

export type FineDiningHeroData = z.infer<typeof FineDiningHeroSchema>;
export type FineDiningHeroSettings = z.infer<typeof BaseSectionSettingsSchema>;
