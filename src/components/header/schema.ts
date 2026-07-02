import { z } from 'zod';
import { BaseSectionData, BaseArrayItem } from '@olonjs/core/runtime';

const HeaderMenuItemSchema = BaseArrayItem.extend({
  label: z.string().describe('ui:text'),
  href: z.string().describe('ui:text'),
  isCta: z.boolean().default(false).describe('ui:checkbox'),
});

export const HeaderSchema = BaseSectionData.extend({
  logoText: z.string().describe('ui:text').default('Radice'),
  menu: z.array(HeaderMenuItemSchema).optional().describe('ui:list'),
});

