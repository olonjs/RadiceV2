import React from 'react';
import type { InfoGridData, InfoGridSettings } from './types';

export const InfoGrid: React.FC<{ data: InfoGridData; settings: InfoGridSettings }> = ({ data }) => {
  return (
    <section
      style={{
        '--local-bg': 'var(--background)',
        '--local-text': 'var(--foreground)',
        '--local-text-muted': 'var(--muted-foreground)',
        '--local-border': 'var(--border)',
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
        <div className="grid grid-cols-1 gap-12 border-t border-[var(--local-border)] pt-12 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item, idx) => (
            <div key={item.id || `info-item-${idx}`} data-jp-item-id={item.id || `info-item-${idx}`} data-jp-item-field="items">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--local-text)]" data-jp-item-field-path="title">
                {item.title}
              </h3>
              <p className="mt-4 whitespace-pre-line text-base text-[var(--local-text-muted)]" data-jp-item-field-path="content">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
