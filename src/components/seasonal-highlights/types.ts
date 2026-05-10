import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core/runtime';
import { SeasonalHighlightsSchema } from './schema';

export type SeasonalHighlightsData = z.infer<typeof SeasonalHighlightsSchema>;
export type SeasonalHighlightsSettings = z.infer<typeof BaseSectionSettingsSchema>;
