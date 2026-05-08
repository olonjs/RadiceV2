import React from 'react';
import type { PhilosophySectionData, PhilosophySectionSettings } from './types';

export const PhilosophySection: React.FC<{ data: PhilosophySectionData; settings: PhilosophySectionSettings }> = ({ data }) => {
  const imageOrderClass = data.imagePosition === 'left' ? 'lg:order-first' : 'lg:order-last';
  
  return (
    <section
      style={{
        '--local-bg': 'var(--background)',
        '--local-text': 'var(--foreground)',
        '--local-text-muted': 'var(--muted-foreground)',
      } as React.CSSProperties}
      className="relative z-0 overflow-hidden bg-[var(--local-bg)] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-center gap-x-16 gap-y-12 lg:grid-cols-2">
          <div className={`flex flex-col justify-center ${data.imagePosition === 'left' ? 'lg:items-start' : 'lg:items-start'}`}>
            {data.label && (
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--local-text-muted)]" data-jp-field="label">
                {data.label}
              </p>
            )}
            <h2 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight tracking-tight text-[var(--local-text)]" data-jp-field="headline">
              {data.headline}
            </h2>
            <p className="mt-8 font-primary text-lg leading-relaxed text-[var(--local-text-muted)]" data-jp-field="content">
              {data.content}
            </p>
          </div>
          {data.image?.url && (
            <div className={`relative ${imageOrderClass}`}>
              <img
                src={data.image.url}
                alt={data.image.alt || ''}
                className="relative z-10 aspect-[3/4] w-full max-w-md object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

