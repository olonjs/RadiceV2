// Layout: Hero=E (MAGAZINE), Features=C (TIMELINE)
import React from 'react';
import type { CulinaryPhilosophyData, CulinaryPhilosophySettings } from './types';

export const CulinaryPhilosophy: React.FC<{ data: CulinaryPhilosophyData; settings: CulinaryPhilosophySettings }> = ({ data }) => {
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          {/* Text Column */}
          <div className="lg:col-span-7 space-y-10">
            {data.label && (
              <div className="jp-section-label inline-flex items-center gap-2 technical-label text-[var(--local-accent)] mb-4" data-jp-field="label">
                <span className="w-8 h-px bg-[var(--local-primary)]" />
                {data.label}
              </div>
            )}

            <div className="space-y-6 jp-animate-in">
              <h2 className="font-display headline-lg text-[var(--local-text)]" data-jp-field="title">
                {data.title}
              </h2>
              
              {data.subtitle && (
                <h3 className="font-display headline-md text-[var(--local-text-muted)]" data-jp-field="subtitle">
                  {data.subtitle}
                </h3>
              )}
            </div>

            <div className="prose prose-lg max-w-none jp-animate-in jp-d1">
              <p className="body-lg text-[var(--local-text-muted)] leading-relaxed" data-jp-field="description">
                {data.description}
              </p>
            </div>

            {data.quote && (
              <blockquote className="relative pl-8 py-6 jp-animate-in jp-d2">
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[var(--local-primary)] to-[var(--local-accent)]" />
                <p className="font-display headline-md text-[var(--local-text)] italic leading-tight mb-4" data-jp-field="quote">
                  "{data.quote}"
                </p>
                {data.author && (
                  <footer className="space-y-1">
                    <cite className="not-italic font-semibold text-[var(--local-text)]" data-jp-field="author">
                      {data.author}
                    </cite>
                    {data.authorTitle && (
                      <div className="technical-label text-[var(--local-accent)]" data-jp-field="authorTitle">
                        {data.authorTitle}
                      </div>
                    )}
                  </footer>
                )}
              </blockquote>
            )}
          </div>

          {/* Image Column */}
          <div className="lg:col-span-5 jp-animate-in jp-d1">
            {data.image?.url && (
              <div className="relative">
                <img
                  src={data.image.url}
                  alt={data.image.alt}
                  className="w-full h-[600px] object-cover border border-[var(--local-border)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--local-bg)]/40 via-transparent to-transparent pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
