import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core';
import { MenuDisplaySchema } from './schema';

export type MenuDisplayData = z.infer<typeof MenuDisplaySchema>;
export type MenuDisplaySettings = z.infer<typeof BaseSectionSettingsSchema>;

