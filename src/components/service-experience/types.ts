import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core';
import { ServiceExperienceSchema } from './schema';

export type ServiceExperienceData = z.infer<typeof ServiceExperienceSchema>;
export type ServiceExperienceSettings = z.infer<typeof BaseSectionSettingsSchema>;
