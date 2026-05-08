import { z } from 'zod';
import { TiptapSchema, TiptapSettingsSchema } from './schema';

export type TiptapData     = z.infer<typeof TiptapSchema>;
export type TiptapSettings = z.infer<typeof TiptapSettingsSchema>;

