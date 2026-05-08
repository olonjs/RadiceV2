import React from 'react';
import type { MenuDisplayData, MenuDisplaySettings } from './types';

export const MenuDisplay: React.FC<{ data: MenuDisplayData; settings: MenuDisplaySettings }> = ({ data }) => {
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
      <div className="mx-auto max-w-4xl px-6 text-center md:px-12">
        <h2 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight tracking-tight text-[var(--local-text)]" data-jp-field="title">
          {data.title}
        </h2>
        {data.description && (
          <p className="mt-4 text-lg leading-relaxed text-[var(--local-text-muted)]" data-jp-field="description">
            {data.description}
          </p>
        )}
      </div>

      <div className="mx-auto mt-16 max-w-4xl px-6 md:px-12">
        <div className="space-y-12">
          {data.items.map((item, idx) => (
            <div key={item.id || `menu-item-${idx}`} data-jp-item-id={item.id || `menu-item-${idx}`} data-jp-item-field="items">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-xl font-medium text-[var(--local-text)]" data-jp-item-field-path="name">
                  {item.name}
                </h3>
                <div className="flex-grow border-b border-dotted border-[var(--local-border)]"></div>
                {item.price && (
                  <span className="font-primary text-base text-[var(--local-text)]" data-jp-item-field-path="price">
                    {item.price}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="mt-2 text-base text-[var(--local-text-muted)]" data-jp-item-field-path="description">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
        {data.footnote && (
          <p className="mt-16 text-center text-sm text-[var(--local-text-muted)]" data-jp-field="footnote">
            {data.footnote}
          </p>
        )}
      </div>
    </section>
  );
};

