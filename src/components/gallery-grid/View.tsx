import React from 'react';
import { resolveAssetUrl, useConfig } from '@olonjs/core/runtime';
import type { GalleryGridData, GalleryGridSettings } from './types';

export const GalleryGrid: React.FC<{ data: GalleryGridData; settings: GalleryGridSettings }> = ({ data }) => {
  const { tenantId } = useConfig();
  const items = data.items.filter((item) => item.id && item.image?.url);

  return (
    <section
      style={{
        '--local-bg': 'var(--background)',
        '--local-text': 'var(--foreground)',
        '--local-text-muted': 'var(--muted-foreground)',
      } as React.CSSProperties}
      className="relative z-0 bg-[var(--local-bg)] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        {data.headline && (
          <div className="mb-16 text-center">
            <h2 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight tracking-tight text-[var(--local-text)]" data-jp-field="headline">
              {data.headline}
            </h2>
          </div>
        )}
        <div className="columns-2 gap-4 md:columns-3 md:gap-6">
          {items.map((item) => (
            <figure key={item.id} className="mb-4 break-inside-avoid md:mb-6" data-jp-item-id={item.id} data-jp-item-field="items">
              <img
                src={resolveAssetUrl(item.image!.url, tenantId)}
                alt={item.image!.alt || item.caption || ''}
                className="w-full"
                data-jp-field="image"
              />
              {item.caption && (
                <figcaption className="mt-2 text-center text-xs text-[var(--local-text-muted)]" data-jp-field="caption">
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
