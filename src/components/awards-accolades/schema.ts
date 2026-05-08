import { z } from 'zod';
import { BaseSectionData, BaseArrayItem } from '@olonjs/core';

const AwardSchema = BaseArrayItem.extend({
  title: z.string().describe('ui:text'),
  organization: z.string().describe('ui:text'),
  year: z.string().describe('ui:text'),
  description: z.string().optional().describe('ui:textarea'),
});

export const AwardsAccoladesSchema = BaseSectionData.extend({
  label: z.string().optional().describe('ui:text'),
  title: z.string().describe('ui:text'),
  description: z.string().optional().describe('ui:textarea'),
  awards: z.array(AwardSchema).describe('ui:list'),
});
