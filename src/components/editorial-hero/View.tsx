import React from 'react';
import type { EditorialHeroData, EditorialHeroSettings } from './types';
import { Button } from '@/components/ui/button';

export const EditorialHero: React.FC<{ data: EditorialHeroData; settings: EditorialHeroSettings }> = ({ data }) => {
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
      {data.backgroundImage?.url && (
        <div className="absolute inset-0 z-0">
          <img
            src={data.backgroundImage.url}
            alt={data.backgroundImage.alt || 'Atmospheric background image for Radice'}
            className="h-full w-full object-cover"
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
            <Button asChild variant="outline" className="h-auto rounded-none border border-[var(--local-text)] bg-transparent px-8 py-4 text-xs uppercase tracking-[0.1em] text-[var(--local-text)] transition-colors hover:border-[var(--local-primary)] hover:bg-[var(--local-primary)] hover:text-[var(--primary-foreground)]">
              <a href={data.primaryCta.href}>{data.primaryCta.label}</a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

