import { z } from 'zod';
import { BaseSectionData, BaseArrayItem } from '@olonjs/core';

const WineCategorySchema = BaseArrayItem.extend({
  name: z.string().describe('ui:text'),
  description: z.string().describe('ui:textarea'),
  highlight: z.string().optional().describe('ui:text'),
  bottles: z.string().describe('ui:text'),
});

export const WineProgramSchema = BaseSectionData.extend({
  label: z.string().optional().describe('ui:text'),
  title: z.string().describe('ui:text'),
  description: z.string().optional().describe('ui:textarea'),
  sommelierName: z.string().describe('ui:text'),
  sommelierTitle: z.string().describe('ui:text'),
  categories: z.array(WineCategorySchema).describe('ui:list'),
});
