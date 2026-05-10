import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core/runtime';
import { TastingMenuShowcaseSchema } from './schema';

export type TastingMenuShowcaseData = z.infer<typeof TastingMenuShowcaseSchema>;
export type TastingMenuShowcaseSettings = z.infer<typeof BaseSectionSettingsSchema>;
