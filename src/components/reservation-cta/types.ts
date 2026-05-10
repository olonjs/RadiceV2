import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core/runtime';
import { ReservationCtaSchema } from './schema';

export type ReservationCtaData = z.infer<typeof ReservationCtaSchema>;
export type ReservationCtaSettings = z.infer<typeof BaseSectionSettingsSchema>;
