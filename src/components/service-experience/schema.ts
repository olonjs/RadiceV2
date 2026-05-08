import { z } from 'zod';
import { BaseSectionData, BaseArrayItem } from '@olonjs/core';

const ServiceMomentSchema = BaseArrayItem.extend({
  title: z.string().describe('ui:text'),
  description: z.string().describe('ui:textarea'),
  time: z.string().optional().describe('ui:text'),
});

export const ServiceExperienceSchema = BaseSectionData.extend({
  label: z.string().optional().describe('ui:text'),
  title: z.string().describe('ui:text'),
  subtitle: z.string().optional().describe('ui:text'),
  description: z.string().optional().describe('ui:textarea'),
  moments: z.array(ServiceMomentSchema).describe('ui:list'),
});
