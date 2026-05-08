// Layout: Hero=C (FULLSCREEN CINEMATIC), Features=C (TIMELINE)
import React from 'react';
import type { ServiceExperienceData, ServiceExperienceSettings } from './types';

export const ServiceExperience: React.FC<{ data: ServiceExperienceData; settings: ServiceExperienceSettings }> = ({ data }) => {
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
          
          {data.subtitle && (
            <h3 className="font-display headline-lg text-[var(--local-accent)] mb-8 jp-animate-in jp-d1" data-jp-field="subtitle">
              {data.subtitle}
            </h3>
          )}
          
          {data.description && (
            <p className="body-lg text-[var(--local-text-muted)] jp-animate-in jp-d2" data-jp-field="description">
              {data.description}
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--local-primary)] via-[var(--local-accent)] to-[var(--local-primary)]" />
          
          <div className="space-y-16">
            {data.moments.map((moment, idx) => (
              <div 
                key={moment.id || `legacy-${idx}`}
                className="relative pl-20 jp-animate-in"
                style={{ animationDelay: `${idx * 0.2}s` }}
                data-jp-item-id={moment.id || `legacy-${idx}`}
                data-jp-item-field="moments"
              >
                {/* Timeline Dot */}
                <div className="absolute left-6 w-4 h-4 bg-[var(--local-primary)] border-2 border-[var(--local-bg)] transform -translate-x-1/2 jp-pulse-dot" />
                
                {/* Content */}
                <div className="space-y-4">
                  <div className="flex items-baseline gap-4">
                    <h3 className="font-display headline-md text-[var(--local-text)]">
                      {moment.title}
                    </h3>
                    {moment.time && (
                      <span className="technical-label text-[var(--local-accent)]">
                        {moment.time}
                      </span>
                    )}
                  </div>
                  
                  <p className="body-lg text-[var(--local-text-muted)] leading-relaxed max-w-2xl">
                    {moment.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
