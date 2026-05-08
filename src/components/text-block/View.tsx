import React from 'react';
import type { TextBlockData, TextBlockSettings } from './types';

export const TextBlock: React.FC<{ data: TextBlockData; settings: TextBlockSettings }> = ({ data }) => {
  const alignmentClass = data.alignment === 'center' ? 'text-center' : 'text-left';
  const marginClass = data.alignment === 'center' ? 'mx-auto' : '';
  
  return (
    <section
      style={{
        '--local-bg': 'var(--background)',
        '--local-text': 'var(--foreground)',
        '--local-text-muted': 'var(--muted-foreground)',
        '--local-primary': 'var(--primary)',
      } as React.CSSProperties}
      className="relative z-0 bg-[var(--local-bg)] py-24 sm:py-32"
    >
      <div className={`mx-auto max-w-[1280px] px-6 md:px-12 ${alignmentClass}`}>
        <div className={`max-w-3xl ${marginClass}`}>
          {data.label && (
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--local-text-muted)]" data-jp-field="label">
              {data.label}
            </p>
          )}
          {data.headline && (
            <h2 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight tracking-tight text-[var(--local-text)]" data-jp-field="headline">
              {data.headline}
            </h2>
          )}
          <div
            className="prose prose-lg mt-8 font-primary text-lg leading-relaxed text-[var(--local-text-muted)] prose-headings:font-display prose-headings:text-[var(--local-text)]"
            data-jp-field="content"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </div>
      </div>
    </section>
  );
};

