import { z } from 'zod';
import { BaseSectionData, BaseArrayItem, ImageSelectionSchema } from '@olonjs/core';

const SupplierSchema = BaseArrayItem.extend({
  name: z.string().describe('ui:text'),
  location: z.string().describe('ui:text'),
  specialty: z.string().describe('ui:text'),
  description: z.string().describe('ui:textarea'),
  image: ImageSelectionSchema.optional().describe('ui:image'),
});

export const IngredientSourcingSchema = BaseSectionData.extend({
  label: z.string().optional().describe('ui:text'),
  title: z.string().describe('ui:text'),
  description: z.string().describe('ui:textarea'),
  philosophy: z.string().optional().describe('ui:textarea'),
  suppliers: z.array(SupplierSchema).describe('ui:list'),
});
