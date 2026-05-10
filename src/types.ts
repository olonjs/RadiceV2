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

// MTRP module augmentation. TypeScript treats `@olonjs/core` and
// `@olonjs/core/runtime` as separate module identifiers (different
// import specifiers). After ADR-0009 the tenant imports JsonPagesConfig
// from `/runtime` for the visitor path, so the section registries must
// be augmented for *both* identifiers, otherwise PageConfig.sections
// resolves to a generic FallbackSection on the runtime side.
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

declare module '@olonjs/core/runtime' {
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

// ADR-0009 D7: tenant types re-export from the runtime subpath, NOT the
// full @olonjs/core. Even though every consumer here only does
// `import type`, Vite's static graph treats `export *` as a runtime
// dependency edge. Pointing it at '@olonjs/core' would pull the full
// Studio bundle (AdminSidebar, FormFactory, StudioStage) into the
// visitor critical path.
export * from '@olonjs/core/runtime';

