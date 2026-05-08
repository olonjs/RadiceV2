import { HeaderSchema } from '@/components/header';
import { FooterSchema } from '@/components/footer';
import { EditorialHeroSchema } from '@/components/editorial-hero';
import { TextBlockSchema } from '@/components/text-block';
import { ImageBlockSchema } from '@/components/image-block';
import { MenuDisplaySchema } from '@/components/menu-display';
import { PhilosophySectionSchema } from '@/components/philosophy-section';
import { InfoGridSchema } from '@/components/info-grid';
import { ChefProfileSchema } from '@/components/chef-profile';
import { CtaBannerSchema } from '@/components/cta-banner';
import { GalleryGridSchema } from '@/components/gallery-grid';

export const SECTION_SCHEMAS = {
  'header': HeaderSchema,
  'footer': FooterSchema,
  'editorial-hero': EditorialHeroSchema,
  'text-block': TextBlockSchema,
  'image-block': ImageBlockSchema,
  'menu-display': MenuDisplaySchema,
  'philosophy-section': PhilosophySectionSchema,
  'info-grid': InfoGridSchema,
  'chef-profile': ChefProfileSchema,
  'cta-banner': CtaBannerSchema,
  'gallery-grid': GalleryGridSchema,
} as const;

export const SECTION_SUBMISSION_SCHEMAS = {} as const;

export type SectionType = keyof typeof SECTION_SCHEMAS;

export {
  BaseSectionData,
  BaseArrayItem,
  BaseSectionSettingsSchema,
  CtaSchema,
  ImageSelectionSchema,
} from '@olonjs/core';

