import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core';
import { IngredientSourcingSchema } from './schema';

export type IngredientSourcingData = z.infer<typeof IngredientSourcingSchema>;
export type IngredientSourcingSettings = z.infer<typeof BaseSectionSettingsSchema>;
