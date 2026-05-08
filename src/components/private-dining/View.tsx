// Layout: Hero=A (SPLIT 60/40), Features=A (BENTO)
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { PrivateDiningData, PrivateDiningSettings } from './types';

export const PrivateDining: React.FC<{ data: PrivateDiningData; settings: PrivateDiningSettings }> = ({ data }) => {
  return (
    <section
      style={{
        '--local-bg': 'var(--elevated)',
        '--local-text': 'var(--foreground)',
        '--local-text-muted': 'var(--muted-foreground)',
        '--local-primary': 'var(--primary)',
        '--local-primary-foreground': 'var(--primary-foreground)',
        '--local-accent': 'var(--accent)',
        '--local-border': 'var(--border)',
        '--local-surface': 'var(--card)',
      } as React.CSSProperties}
      className="relative z-0 bg-[var(--local-bg)] py-32"
    >
      <div className="max-w-[1280px] mx-auto px-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-20">
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
          
          <p className="body-lg text-[var(--local-text-muted)] jp-animate-in jp-d1" data-jp-field="description">
            {data.description}
          </p>
        </div>

        {/* Spaces Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {data.spaces.map((space, idx) => (
            <Card 
              key={space.id || `legacy-${idx}`}
              className="group overflow-hidden radice-architectural-border jp-animate-in"
              style={{ animationDelay: `${idx * 0.15}s` }}
              data-jp-item-id={space.id || `legacy-${idx}`}
              data-jp-item-field="spaces"
            >
              {space.image?.url && (
                <div className="relative overflow-hidden">
                  <img
                    src={space.image.url}
                    alt={space.image.alt}
                    className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--local-bg)]/80 via-transparent to-transparent" />
                </div>
              )}
              
              <CardContent className="p-8 space-y-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display headline-md text-[var(--local-text)]">
                    {space.name}
                  </h3>
                  <span className="technical-label text-[var(--local-accent)]">
                    {space.capacity}
                  </span>
                </div>
                
                <p className="text-[var(--local-text-muted)] leading-relaxed">
                  {space.description}
                </p>
                
                <div className="pt-4 border-t border-[var(--local-border)]">
                  <div className="technical-label text-[var(--local-accent)] mb-3">Features</div>
                  <p className="text-sm text-[var(--local-text-muted)] leading-relaxed">
                    {space.features}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center jp-animate-in jp-d3">
          <Button
            className="inline-flex items-center gap-2 px-10 py-4 bg-[var(--local-primary)] text-[var(--local-primary-foreground)] font-semibold text-lg hover:opacity-90 transition-opacity"
            asChild
          >
            <a href={data.cta.href}>{data.cta.label}</a>
          </Button>
        </div>
      </div>
    </section>
  );
};
