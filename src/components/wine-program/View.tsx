// Layout: Hero=B (BENTO GRID), Features=A (BENTO)
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { WineProgramData, WineProgramSettings } from './types';

export const WineProgram: React.FC<{ data: WineProgramData; settings: WineProgramSettings }> = ({ data }) => {
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
            <p className="body-lg text-[var(--local-text-muted)] mb-8 jp-animate-in jp-d1" data-jp-field="description">
              {data.description}
            </p>
          )}
          
          <div className="jp-animate-in jp-d2">
            <h3 className="font-display headline-md text-[var(--local-text)]" data-jp-field="sommelierName">
              {data.sommelierName}
            </h3>
            <p className="technical-label text-[var(--local-accent)]" data-jp-field="sommelierTitle">
              {data.sommelierTitle}
            </p>
          </div>
        </div>

        {/* Wine Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.categories.map((category, idx) => (
            <Card 
              key={category.id || `legacy-${idx}`}
              className="radice-architectural-border jp-animate-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
              data-jp-item-id={category.id || `legacy-${idx}`}
              data-jp-item-field="categories"
            >
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <h3 className="font-display headline-md text-[var(--local-text)]">
                    {category.name}
                  </h3>
                  
                  <div className="technical-label text-[var(--local-accent)]">
                    {category.bottles} bottles
                  </div>
                </div>
                
                <p className="text-[var(--local-text-muted)] leading-relaxed">
                  {category.description}
                </p>
                
                {category.highlight && (
                  <div className="pt-4 border-t border-[var(--local-border)]">
                    <div className="technical-label text-[var(--local-accent)] mb-2">Featured Selection</div>
                    <p className="font-display text-[var(--local-text)] italic">
                      {category.highlight}
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
