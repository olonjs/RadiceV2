import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core/runtime';
import { FineDiningHeroSchema } from './schema';

export type FineDiningHeroData = z.infer<typeof FineDiningHeroSchema>;
export type FineDiningHeroSettings = z.infer<typeof BaseSectionSettingsSchema>;
