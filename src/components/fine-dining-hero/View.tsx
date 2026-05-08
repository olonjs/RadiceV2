// Layout: Hero=F (MINIMAL HERO), Features=A (BENTO)
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FineDiningHeroData, FineDiningHeroSettings } from './types';

export const FineDiningHero: React.FC<{ data: FineDiningHeroData; settings: FineDiningHeroSettings }> = ({ data }) => {
  return (
    <section
      style={{
        '--local-bg': 'var(--background)',
        '--local-text': 'var(--foreground)',
        '--local-text-muted': 'var(--muted-foreground)',
        '--local-primary': 'var(--primary)',
        '--local-primary-foreground': 'var(--primary-foreground)',
        '--local-accent': 'var(--accent)',
        '--local-border': 'var(--border)',
        '--local-surface': 'var(--elevated)',
        '--local-accent-soft': 'var(--demo-accent-soft)',
      } as React.CSSProperties}
      className="relative z-0 overflow-hidden bg-[var(--local-bg)]"
    >
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 bg-[image:linear-gradient(var(--local-accent-soft)_1px,transparent_1px),linear-gradient(90deg,var(--local-accent-soft)_1px,transparent_1px)] bg-[size:120px_120px] opacity-30 pointer-events-none" />
      
      <div className="relative max-w-[1280px] mx-auto px-12 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center min-h-[85vh]">
          {/* Content Column */}
          <div className="lg:col-span-7 space-y-8 jp-animate-in">
            {data.badge && (
              <Badge 
                className="inline-flex items-center gap-2 bg-[var(--local-accent-soft)] border border-[var(--local-border)] px-4 py-2 text-[var(--local-accent)] technical-label" 
                data-jp-field="badge"
              >
                <span className="w-2 h-2 bg-[var(--local-primary)] jp-pulse-dot" />
                {data.badge}
              </Badge>
            )}

            <div className="space-y-6">
              <h1 className="font-display display-xl text-[var(--local-text)]" data-jp-field="title">
                {data.title}
                {data.titleHighlight && (
                  <em className="not-italic bg-gradient-to-br from-[var(--local-accent)] to-[var(--local-primary)] bg-clip-text text-transparent ml-2">
                    {data.titleHighlight}
                  </em>
                )}
              </h1>
              
              <p className="body-lg text-[var(--local-text-muted)] max-w-2xl" data-jp-field="description">
                {data.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 jp-d2">
              <Button
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--local-primary)] text-[var(--local-primary-foreground)] font-semibold hover:opacity-90 transition-opacity"
                asChild
              >
                <a href={data.primaryCta.href}>{data.primaryCta.label}</a>
              </Button>
              
              {data.secondaryCta && (
                <Button
                  variant="outline"
                  className="inline-flex items-center gap-2 px-8 py-4 border-[var(--local-border)] text-[var(--local-text)] hover:border-[var(--local-accent)] transition"
                  asChild
                >
                  <a href={data.secondaryCta.href}>{data.secondaryCta.label}</a>
                </Button>
              )}
            </div>

            {/* Awards */}
            {data.awards && data.awards.length > 0 && (
              <div className="flex flex-wrap gap-6 pt-8 jp-d3">
                {data.awards.map((award, idx) => (
                  <div 
                    key={award.id || `legacy-${idx}`}
                    className="flex flex-col gap-1"
                    data-jp-item-id={award.id || `legacy-${idx}`}
                    data-jp-item-field="awards"
                  >
                    <span className="font-display headline-md text-[var(--local-text)]">{award.title}</span>
                    <span className="technical-label text-[var(--local-accent)]">{award.subtitle}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Column */}
          <div className="lg:col-span-5 jp-animate-in jp-d1">
            {data.image?.url && (
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[var(--local-primary)]/10 to-[var(--local-accent)]/5 blur-xl" />
                <img
                  src={data.image.url}
                  alt={data.image.alt}
                  className="relative w-full h-[700px] object-cover border border-[var(--local-border)] shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--local-bg)]/20 via-transparent to-transparent pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
