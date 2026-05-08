import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { EditorialHero } from '@/components/editorial-hero';
import { TextBlock } from '@/components/text-block';
import { ImageBlock } from '@/components/image-block';
import { MenuDisplay } from '@/components/menu-display';
import { PhilosophySection } from '@/components/philosophy-section';
import { InfoGrid } from '@/components/info-grid';
import { ChefProfile } from '@/components/chef-profile';
import { CtaBanner } from '@/components/cta-banner';
import { GalleryGrid } from '@/components/gallery-grid';

import type { SectionType } from '@olonjs/core';
import type { SectionComponentPropsMap } from '@/types';

export const ComponentRegistry: {
  [K in SectionType]: React.FC<SectionComponentPropsMap[K]>;
} = {
  'header': Header,
  'footer': Footer,
  'editorial-hero': EditorialHero,
  'text-block': TextBlock,
  'image-block': ImageBlock,
  'menu-display': MenuDisplay,
  'philosophy-section': PhilosophySection,
  'info-grid': InfoGrid,
  'chef-profile': ChefProfile,
  'cta-banner': CtaBanner,
  'gallery-grid': GalleryGrid,
};

