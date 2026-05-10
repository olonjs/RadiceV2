import { z } from 'zod';
import { BaseSectionData, BaseArrayItem } from '@olonjs/core/runtime';

const MenuItemSchema = BaseArrayItem.extend({
  name: z.string().describe('ui:text'),
  description: z.string().optional().describe('ui:textarea'),
  price: z.string().optional().describe('ui:text'),
});

export const MenuDisplaySchema = BaseSectionData.extend({
  title: z.string().describe('ui:text'),
  description: z.string().optional().describe('ui:textarea'),
  items: z.array(MenuItemSchema).describe('ui:list'),
  footnote: z.string().optional().describe('ui:text'),
});

