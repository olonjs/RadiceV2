import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core/runtime';
import { ChefProfileSchema } from './schema';

export type ChefProfileData = z.infer<typeof ChefProfileSchema>;
export type ChefProfileSettings = z.infer<typeof BaseSectionSettingsSchema>;

