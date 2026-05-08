import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core';
import { ReservationCtaSchema } from './schema';

export type ReservationCtaData = z.infer<typeof ReservationCtaSchema>;
export type ReservationCtaSettings = z.infer<typeof BaseSectionSettingsSchema>;
