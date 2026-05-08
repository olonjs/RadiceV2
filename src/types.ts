import type { HeaderData, HeaderSettings } from '@/components/header';
import type { FooterData, FooterSettings } from '@/components/footer';
import type { EditorialHeroData, EditorialHeroSettings } from '@/components/editorial-hero';
import type { TextBlockData, TextBlockSettings } from '@/components/text-block';
import type { ImageBlockData, ImageBlockSettings } from '@/components/image-block';
import type { MenuDisplayData, MenuDisplaySettings } from '@/components/menu-display';
import type { PhilosophySectionData, PhilosophySectionSettings } from '@/components/philosophy-section';
import type { InfoGridData, InfoGridSettings } from '@/components/info-grid';
import type { ChefProfileData, ChefProfileSettings } from '@/components/chef-profile';
import type { CtaBannerData, CtaBannerSettings } from '@/components/cta-banner';
import type { GalleryGridData, GalleryGridSettings } from '@/components/gallery-grid';

export type SectionComponentPropsMap = {
  'header': { data: HeaderData; settings: HeaderSettings };
  'footer': { data: FooterData; settings: FooterSettings };
  'editorial-hero': { data: EditorialHeroData; settings: EditorialHeroSettings };
  'text-block': { data: TextBlockData; settings: TextBlockSettings };
  'image-block': { data: ImageBlockData; settings: ImageBlockSettings };
  'menu-display': { data: MenuDisplayData; settings: MenuDisplaySettings };
  'philosophy-section': { data: PhilosophySectionData; settings: PhilosophySectionSettings };
  'info-grid': { data: InfoGridData; settings: InfoGridSettings };
  'chef-profile': { data: ChefProfileData; settings: ChefProfileSettings };
  'cta-banner': { data: CtaBannerData; settings: CtaBannerSettings };
  'gallery-grid': { data: GalleryGridData; settings: GalleryGridSettings };
};

declare module '@olonjs/core' {
  export interface SectionDataRegistry {
    'header': HeaderData;
    'footer': FooterData;
    'editorial-hero': EditorialHeroData;
    'text-block': TextBlockData;
    'image-block': ImageBlockData;
    'menu-display': MenuDisplayData;
    'philosophy-section': PhilosophySectionData;
    'info-grid': InfoGridData;
    'chef-profile': ChefProfileData;
    'cta-banner': CtaBannerData;
    'gallery-grid': GalleryGridData;
  }
  export interface SectionSettingsRegistry {
    'header': HeaderSettings;
    'footer': FooterSettings;
    'editorial-hero': EditorialHeroSettings;
    'text-block': TextBlockSettings;
    'image-block': ImageBlockSettings;
    'menu-display': MenuDisplaySettings;
    'philosophy-section': PhilosophySectionSettings;
    'info-grid': InfoGridSettings;
    'chef-profile': ChefProfileSettings;
    'cta-banner': CtaBannerSettings;
    'gallery-grid': GalleryGridSettings;
  }
}

export * from '@olonjs/core';

