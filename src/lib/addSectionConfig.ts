import type { AddSectionConfig } from '@olonjs/core';

const addableSectionTypes = [
  'editorial-hero',
  'text-block',
  'image-block',
  'menu-display',
  'philosophy-section',
  'info-grid',
  'chef-profile',
  'cta-banner',
  'gallery-grid',
] as const;

const sectionTypeLabels: Record<string, string> = {
  'editorial-hero': 'Editorial Hero',
  'text-block': 'Text Block',
  'image-block': 'Image Block',
  'menu-display': 'Menu Display',
  'philosophy-section': 'Philosophy Section',
  'info-grid': 'Info Grid',
  'chef-profile': 'Chef Profile',
  'cta-banner': 'CTA Banner',
  'gallery-grid': 'Gallery Grid',
};

function getDefaultSectionData(type: string): Record<string, unknown> {
  switch (type) {
    case 'editorial-hero':
      return { headline: 'A Culinary Narrative', subheadline: 'Experience a menu rooted in seasonality and terroir.' };
    case 'text-block':
      return { content: '<p>Placeholder text about our philosophy and craft.</p>' };
    case 'menu-display':
      return { title: 'Tasting Menu', items: [] };
    case 'philosophy-section':
        return { headline: 'Our Philosophy', content: 'Details about our core beliefs and practices.' };
    case 'info-grid':
        return { items: [{title: "Title", content: "Content"}] };
    case 'chef-profile':
        return { name: 'Chef Name', title: 'Executive Chef', bio: 'Chef biography.' };
    case 'cta-banner':
        return { headline: 'Reserve Your Table', primaryCta: { label: 'Book Now', href: '/reservations' } };
    case 'gallery-grid':
        return { items: [] };
    default:
      return {};
  }
}

export const addSectionConfig: AddSectionConfig = {
  addableSectionTypes: [...addableSectionTypes],
  sectionTypeLabels,
  getDefaultSectionData,
};

