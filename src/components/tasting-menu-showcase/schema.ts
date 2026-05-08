import { z } from 'zod';
import { BaseSectionData, BaseArrayItem, ImageSelectionSchema } from '@olonjs/core';

const MenuItemSchema = BaseArrayItem.extend({
  name: z.string().describe('ui:text'),
  description: z.string().describe('ui:textarea'),
  price: z.string().optional().describe('ui:text'),
  dietary: z.string().optional().describe('ui:text'),
  image: ImageSelectionSchema.optional().describe('ui:image'),
});

const MenuSectionSchema = BaseArrayItem.extend({
  title: z.string().describe('ui:text'),
  subtitle: z.string().optional().describe('ui:text'),
  items: z.array(MenuItemSchema).describe('ui:list'),
});

export const TastingMenuShowcaseSchema = BaseSectionData.extend({
  label: z.string().optional().describe('ui:text'),
  title: z.string().describe('ui:text'),
  description: z.string().optional().describe('ui:textarea'),
  sections: z.array(MenuSectionSchema).describe('ui:list'),
});
