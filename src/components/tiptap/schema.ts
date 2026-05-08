import { z } from 'zod';
import { BaseSectionData } from '@olonjs/core';

export const TiptapSchema = BaseSectionData.extend({
  content: z.string().default('').describe('ui:editorial-markdown'),
});

export const TiptapSettingsSchema = z.object({});

