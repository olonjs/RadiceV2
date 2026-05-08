import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core';
import { CtaBannerSchema } from './schema';

export type CtaBannerData = z.infer<typeof CtaBannerSchema>;
export type CtaBannerSettings = z.infer<typeof BaseSectionSettingsSchema>;

