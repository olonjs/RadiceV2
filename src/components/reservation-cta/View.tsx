// Layout: Hero=F (MINIMAL HERO), Features=F (MINIMAL)
import React from 'react';
import { Button } from '@/components/ui/button';
import type { ReservationCtaData, ReservationCtaSettings } from './types';

export const ReservationCta: React.FC<{ data: ReservationCtaData; settings: ReservationCtaSettings }> = ({ data }) => {
  return (
    <section
      style={{
        '--local-bg': 'var(--primary)',
        '--local-text': 'var(--primary-foreground)',
        '--local-text-muted': 'color-mix(in oklch, var(--primary-foreground) 80%, transparent)',
        '--local-primary': 'var(--primary-foreground)',
        '--local-primary-foreground': 'var(--primary)',
        '--local-accent': 'var(--accent)',
        '--local-border': 'color-mix(in oklch, var(--primary-foreground) 20%, transparent)',
        '--local-surface': 'color-mix(in oklch, var(--primary-foreground) 10%, transparent)',
      } as React.CSSProperties}
      className="relative z-0 bg-[var(--local-bg)] py-32"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[image:linear-gradient(var(--local-border)_1px,transparent_1px),linear-gradient(90deg,var(--local-border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
      
      <div className="relative max-w-4xl mx-auto px-12 text-center">
        <div className="space-y-8 jp-animate-in">
          <div className="space-y-4">
            <h2 className="font-display display-xl text-[var(--local-text)]" data-jp-field="title">
              {data.title}
            </h2>
            
            {data.subtitle && (
              <h3 className="font-display headline-lg text-[var(--local-text-muted)]" data-jp-field="subtitle">
                {data.subtitle}
              </h3>
            )}
          </div>
          
          {data.description && (
            <p className="body-lg text-[var(--local-text-muted)] max-w-2xl mx-auto jp-d1" data-jp-field="description">
              {data.description}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center jp-d2">
            <Button
              className="inline-flex items-center gap-2 px-10 py-4 bg-[var(--local-primary)] text-[var(--local-primary-foreground)] font-semibold text-lg hover:opacity-90 transition-opacity"
              asChild
            >
              <a href={data.primaryCta.href}>{data.primaryCta.label}</a>
            </Button>
            
            {data.secondaryCta && (
              <Button
                variant="outline"
                className="inline-flex items-center gap-2 px-10 py-4 border-[var(--local-border)] text-[var(--local-text)] hover:bg-[var(--local-surface)] transition"
                asChild
              >
                <a href={data.secondaryCta.href}>{data.secondaryCta.label}</a>
              </Button>
            )}
          </div>
          
          {data.note && (
            <p className="technical-label text-[var(--local-text-muted)] jp-d3" data-jp-field="note">
              {data.note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
