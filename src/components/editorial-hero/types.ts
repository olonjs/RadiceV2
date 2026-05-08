import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core';
import { EditorialHeroSchema } from './schema';

export type EditorialHeroData = z.infer<typeof EditorialHeroSchema>;
export type EditorialHeroSettings = z.infer<typeof BaseSectionSettingsSchema>;

