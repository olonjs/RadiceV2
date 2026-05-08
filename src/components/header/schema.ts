import { z } from 'zod';
import { BaseSectionData } from '@olonjs/core';

const HeaderMenuItemSchema = z.object({
  id: z.string().optional(),
  label: z.string().describe('ui:text'),
  href: z.string().describe('ui:text'),
  isCta: z.boolean().optional().describe('ui:checkbox'),
});

export const HeaderSchema = BaseSectionData.extend({
  logoText: z.string().describe('ui:text').default('Radice'),
  menu: z.array(HeaderMenuItemSchema).optional().describe('ui:list'),
});

