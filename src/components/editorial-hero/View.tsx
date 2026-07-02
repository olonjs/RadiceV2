import React from 'react';
import { resolveAssetUrl, useConfig } from '@olonjs/core/runtime';
import type { EditorialHeroData, EditorialHeroSettings } from './types';
import { Button } from '@/components/ui/button';

export const EditorialHero: React.FC<{ data: EditorialHeroData; settings: EditorialHeroSettings }> = ({ data }) => {
  const { tenantId } = useConfig();
  const backgroundUrl = data.backgroundImage?.url
    ? resolveAssetUrl(data.backgroundImage.url, tenantId)
    : '';

  return (
    <section
      style={{
        '--local-bg': 'var(--background)',
        '--local-text': 'var(--foreground)',
        '--local-text-muted': 'var(--muted-foreground)',
        '--local-primary': 'var(--primary)',
      } as React.CSSProperties}
      className="relative z-0 flex min-h-screen items-center bg-[var(--local-bg)] py-32"
    >
      {backgroundUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={backgroundUrl}
            alt={data.backgroundImage?.alt || 'Atmospheric background image for Radice'}
            className="h-full w-full object-cover"
            data-jp-field="backgroundImage"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--local-bg)] via-[var(--local-bg)]/80 to-transparent"></div>
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 text-center md:px-12">
        {data.label && (
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--local-text-muted)]" data-jp-field="label">
            {data.label}
          </p>
        )}
        <h1
          className="font-display text-[clamp(2.5rem,8vw,6rem)] font-semibold leading-none tracking-tight text-[var(--local-text)]"
          data-jp-field="headline"
          dangerouslySetInnerHTML={{ __html: data.headline }}
        />
        {data.subheadline && (
          <p className="mx-auto mt-8 max-w-2xl font-primary text-lg leading-relaxed text-[var(--local-text-muted)]" data-jp-field="subheadline">
            {data.subheadline}
          </p>
        )}
        {data.primaryCta?.label && (
          <div className="mt-12">
            <Button
              asChild
              variant={data.primaryCta.variant === 'secondary' ? 'secondary' : data.primaryCta.variant === 'outline' ? 'outline' : 'default'}
              className={
                data.primaryCta.variant === 'secondary'
                  ? 'h-auto rounded-none border border-[var(--secondary)] bg-[var(--secondary)] px-8 py-4 text-xs uppercase tracking-[0.1em] text-[var(--secondary-foreground)] transition-colors hover:opacity-90'
                  : data.primaryCta.variant === 'outline'
                    ? 'h-auto rounded-none border border-[var(--local-text)] bg-transparent px-8 py-4 text-xs uppercase tracking-[0.1em] text-[var(--local-text)] transition-colors hover:border-[var(--local-primary)] hover:bg-[var(--local-primary)] hover:text-[var(--primary-foreground)]'
                    : 'h-auto rounded-none border border-[var(--local-primary)] bg-[var(--local-primary)] px-8 py-4 text-xs uppercase tracking-[0.1em] text-[var(--primary-foreground)] transition-colors hover:opacity-90'
              }
            >
              <a href={data.primaryCta.href} data-jp-field="primaryCta">
                <span data-jp-field="primaryCta">{data.primaryCta.label}</span>
              </a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
