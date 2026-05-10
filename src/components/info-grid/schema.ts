import { z } from 'zod';
import { BaseSectionData, BaseArrayItem } from '@olonjs/core/runtime';

const InfoItemSchema = BaseArrayItem.extend({
  title: z.string().describe('ui:text'),
  content: z.string().describe('ui:textarea'),
});

export const InfoGridSchema = BaseSectionData.extend({
  headline: z.string().optional().describe('ui:text'),
  items: z.array(InfoItemSchema).describe('ui:list'),
});

