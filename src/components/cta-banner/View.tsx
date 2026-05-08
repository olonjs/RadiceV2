import React from 'react';
import type { CtaBannerData, CtaBannerSettings } from './types';
import { Button } from '@/components/ui/button';

export const CtaBanner: React.FC<{ data: CtaBannerData; settings: CtaBannerSettings }> = ({ data }) => {
  return (
    <section
      style={{
        '--local-bg': 'var(--muted)',
        '--local-text': 'var(--muted-foreground)',
        '--local-primary': 'var(--primary)',
        '--local-primary-foreground': 'var(--primary-foreground)',
      } as React.CSSProperties}
      className="relative z-0 bg-[var(--local-bg)]"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-32 md:px-12">
        <div className="flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
          <h2 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight tracking-tight text-[var(--local-text)]" data-jp-field="headline">
            {data.headline}
          </h2>
          {data.primaryCta.label && (
             <Button asChild variant="default" className="h-auto shrink-0 rounded-none border border-[var(--local-text)] bg-[var(--local-text)] px-8 py-4 text-xs uppercase tracking-[0.1em] text-[var(--background)] transition-colors hover:border-[var(--local-primary)] hover:bg-[var(--local-primary)] hover:text-[var(--local-primary-foreground)]">
               <a href={data.primaryCta.href}>{data.primaryCta.label}</a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

