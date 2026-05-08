import React from 'react';
import type { ChefProfileData, ChefProfileSettings } from './types';

export const ChefProfile: React.FC<{ data: ChefProfileData; settings: ChefProfileSettings }> = ({ data }) => {
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
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-16 px-6 md:px-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          {data.image?.url && (
            <img src={data.image.url} alt={data.image.alt || data.name} className="aspect-square w-full object-cover" />
          )}
        </div>
        <div className="lg:col-span-3">
          <h2 className="font-display text-4xl font-semibold text-[var(--local-text)]" data-jp-field="name">{data.name}</h2>
          <p className="mt-1 text-sm uppercase tracking-widest text-[var(--local-text-muted)]" data-jp-field="title">{data.title}</p>
          <div className="my-8 h-px w-24 bg-[var(--local-border)]"></div>
          <p className="text-lg leading-relaxed text-[var(--local-text-muted)]" data-jp-field="bio">{data.bio}</p>
          {data.quote && (
            <blockquote className="mt-12 border-l-2 border-[var(--local-border)] pl-6">
              <p className="font-display text-2xl italic text-[var(--local-text)]" data-jp-field="quote">
                {data.quote}
              </p>
            </blockquote>
          )}
        </div>
      </div>
    </section>
  );
};

