// Layout: Hero=B (BENTO GRID), Features=B (HORIZONTAL SCROLL)
import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { SeasonalHighlightsData, SeasonalHighlightsSettings } from './types';

export const SeasonalHighlights: React.FC<{ data: SeasonalHighlightsData; settings: SeasonalHighlightsSettings }> = ({ data }) => {
  return (
    <section
      style={{
        '--local-bg': 'var(--background)',
        '--local-text': 'var(--foreground)',
        '--local-text-muted': 'var(--muted-foreground)',
        '--local-primary': 'var(--primary)',
        '--local-accent': 'var(--accent)',
        '--local-border': 'var(--border)',
        '--local-surface': 'var(--card)',
        '--local-accent-soft': 'var(--demo-accent-soft)',
      } as React.CSSProperties}
      className="relative z-0 bg-[var(--local-bg)] py-32"
    >
      <div className="max-w-[1280px] mx-auto px-12">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          {data.label && (
            <div className="jp-section-label inline-flex items-center gap-2 technical-label text-[var(--local-accent)] mb-6" data-jp-field="label">
              <span className="w-8 h-px bg-[var(--local-primary)]" />
              {data.label}
              <span className="w-8 h-px bg-[var(--local-primary)]" />
            </div>
          )}
          
          <h2 className="font-display display-xl text-[var(--local-text)] mb-8 jp-animate-in" data-jp-field="title">
            {data.title}
          </h2>
          
          {data.description && (
            <p className="body-lg text-[var(--local-text-muted)] jp-animate-in jp-d1" data-jp-field="description">
              {data.description}
            </p>
          )}
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.highlights.map((highlight, idx) => (
            <div 
              key={highlight.id || `legacy-${idx}`}
              className={`group radice-architectural-border overflow-hidden jp-animate-in ${
                idx === 0 ? 'md:col-span-2 lg:col-span-2' : ''
              } ${
                idx === 3 ? 'lg:col-span-2' : ''
              }`}
              style={{ animationDelay: `${idx * 0.1}s` }}
              data-jp-item-id={highlight.id || `legacy-${idx}`}
              data-jp-item-field="highlights"
            >
              {highlight.image?.url && (
                <div className="relative overflow-hidden">
                  <img
                    src={highlight.image.url}
                    alt={highlight.image.alt}
                    className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                      idx === 0 ? 'h-80' : 'h-64'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--local-bg)]/60 via-transparent to-transparent" />
                </div>
              )}
              
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-[var(--local-accent-soft)] border border-[var(--local-border)] text-[var(--local-accent)] technical-label">
                    {highlight.season}
                  </Badge>
                  {highlight.ingredient && (
                    <span className="technical-label text-[var(--local-primary)]">
                      {highlight.ingredient}
                    </span>
                  )}
                </div>
                
                <h3 className="font-display headline-md text-[var(--local-text)] group-hover:text-[var(--local-accent)] transition">
                  {highlight.title}
                </h3>
                
                <p className="text-[var(--local-text-muted)] leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
