import React from 'react';
import { resolveAssetUrl, useConfig } from '@olonjs/core/runtime';
import type { ImageBlockData, ImageBlockSettings } from './types';

export const ImageBlock: React.FC<{ data: ImageBlockData; settings: ImageBlockSettings }> = ({ data }) => {
  const { tenantId } = useConfig();
  if (!data.image?.url) return null;

  return (
    <section
      style={{
        '--local-bg': 'var(--background)',
        '--local-text-muted': 'var(--muted-foreground)',
      } as React.CSSProperties}
      className="relative z-0 bg-[var(--local-bg)] py-12"
    >
      <figure className="mx-auto max-w-[1280px] px-6 md:px-12">
        <img
          src={resolveAssetUrl(data.image.url, tenantId)}
          alt={data.image.alt || ''}
          className="h-auto w-full object-cover"
          data-jp-field="image"
        />
        {data.caption && (
          <figcaption className="mt-4 text-center text-sm text-[var(--local-text-muted)]" data-jp-field="caption">
            {data.caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
};
