import { z } from 'zod';
import { BaseSectionData } from '@olonjs/core/runtime';

const FooterMenuItemSchema = z.object({
  id: z.string().optional(),
  label: z.string().describe('ui:text'),
  href: z.string().describe('ui:text'),
});

const SocialLinkSchema = z.object({
    id: z.string().optional(),
    platform: z.string().describe('ui:text'),
    url: z.string().describe('ui:text'),
});

export const FooterSchema = BaseSectionData.extend({
  logoText: z.string().describe('ui:text').default('Radice'),
  tagline: z.string().optional().describe('ui:text'),
  address: z.string().optional().describe('ui:textarea'),
  phone: z.string().optional().describe('ui:text'),
  email: z.string().optional().describe('ui:text'),
  copyright: z.string().describe('ui:text').default('© 2024 Radice. All rights reserved.'),
  menu: z.array(FooterMenuItemSchema).optional().describe('ui:list'),
  socialLinks: z.array(SocialLinkSchema).optional().describe('ui:list'),
});

