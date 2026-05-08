import { z } from 'zod';
import { BaseSectionData, BaseArrayItem, ImageSelectionSchema, CtaSchema } from '@olonjs/core';

const PrivateSpaceSchema = BaseArrayItem.extend({
  name: z.string().describe('ui:text'),
  capacity: z.string().describe('ui:text'),
  description: z.string().describe('ui:textarea'),
  features: z.string().describe('ui:textarea'),
  image: ImageSelectionSchema.optional().describe('ui:image'),
});

export const PrivateDiningSchema = BaseSectionData.extend({
  label: z.string().optional().describe('ui:text'),
  title: z.string().describe('ui:text'),
  description: z.string().describe('ui:textarea'),
  spaces: z.array(PrivateSpaceSchema).describe('ui:list'),
  cta: CtaSchema.describe('ui:cta'),
});
