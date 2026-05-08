import { z } from 'zod';
import { BaseSectionSettingsSchema } from '@olonjs/core';
import { CulinaryPhilosophySchema } from './schema';

export type CulinaryPhilosophyData = z.infer<typeof CulinaryPhilosophySchema>;
export type CulinaryPhilosophySettings = z.infer<typeof BaseSectionSettingsSchema>;
