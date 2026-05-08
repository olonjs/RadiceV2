// Layout: Hero=F (MINIMAL HERO), Features=A (BENTO)
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { AwardsAccoladesData, AwardsAccoladesSettings } from './types';

export const AwardsAccolades: React.FC<{ data: AwardsAccoladesData; settings: AwardsAccoladesSettings }> = ({ data }) => {
  return (
    <section
      style={{
        '--local-bg': 'var(--elevated)',
        '--local-text': 'var(--foreground)',
        '--local-text-muted': 'var(--muted-foreground)',
        '--local-primary': 'var(--primary)',
        '--local-accent': 'var(--accent)',
        '--local-border': 'var(--border)',
        '--local-surface': 'var(--card)',
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

        {/* Awards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.awards.map((award, idx) => (
            <Card 
              key={award.id || `legacy-${idx}`}
              className={`group radice-architectural-border jp-animate-in ${
                idx === 0 || idx === 3 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
              style={{ animationDelay: `${idx * 0.1}s` }}
              data-jp-item-id={award.id || `legacy-${idx}`}
              data-jp-item-field="awards"
            >
              <CardContent className="p-8 space-y-6 text-center">
                <div className="space-y-3">
                  <span className="technical-label text-[var(--local-accent)]">
                    {award.year}
                  </span>
                  
                  <h3 className="font-display headline-md text-[var(--local-text)] group-hover:text-[var(--local-primary)] transition">
                    {award.title}
                  </h3>
                  
                  <p className="technical-label text-[var(--local-primary)]">
                    {award.organization}
                  </p>
                </div>
                
                {award.description && (
                  <div className="pt-4 border-t border-[var(--local-border)]">
                    <p className="text-[var(--local-text-muted)] leading-relaxed text-sm">
                      {award.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
