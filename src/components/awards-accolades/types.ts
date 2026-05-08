import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core';
import { AwardsAccoladesSchema } from './schema';

export type AwardsAccoladesData = z.infer<typeof AwardsAccoladesSchema>;
export type AwardsAccoladesSettings = z.infer<typeof BaseSectionSettingsSchema>;
