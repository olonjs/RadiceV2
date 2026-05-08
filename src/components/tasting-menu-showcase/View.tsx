// Layout: Hero=D (EDITORIAL), Features=D (ACCORDION)
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { TastingMenuShowcaseData, TastingMenuShowcaseSettings } from './types';

export const TastingMenuShowcase: React.FC<{ data: TastingMenuShowcaseData; settings: TastingMenuShowcaseSettings }> = ({ data }) => {
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
            <p className="body-lg text-[var(--local-text-muted)] jp-animate-in jp-d1" data-jp-field="description">
              {data.description}
            </p>
          )}
        </div>

        {/* Menu Sections */}
        <div className="space-y-16">
          {data.sections.map((section, sectionIdx) => (
            <div 
              key={section.id || `legacy-${sectionIdx}`}
              className="jp-animate-in"
              style={{ animationDelay: `${sectionIdx * 0.2}s` }}
              data-jp-item-id={section.id || `legacy-${sectionIdx}`}
              data-jp-item-field="sections"
            >
              {/* Section Header */}
              <div className="text-center mb-12">
                <h3 className="font-display headline-lg text-[var(--local-text)] mb-4">
                  {section.title}
                </h3>
                {section.subtitle && (
                  <p className="body-lg text-[var(--local-accent)]">
                    {section.subtitle}
                  </p>
                )}
              </div>

              {/* Menu Items */}
              <div className="space-y-8">
                {section.items.map((item, itemIdx) => (
                  <div 
                    key={item.id || `legacy-${itemIdx}`}
                    className="group"
                    data-jp-item-id={item.id || `legacy-${itemIdx}`}
                    data-jp-item-field="items"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Item Image */}
                      {item.image?.url && (
                        <div className="lg:col-span-4">
                          <img
                            src={item.image.url}
                            alt={item.image.alt}
                            className="w-full h-48 object-cover border border-[var(--local-border)] transition group-hover:shadow-lg"
                          />
                        </div>
                      )}
                      
                      {/* Item Content */}
                      <div className={`space-y-4 ${item.image?.url ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-display headline-md text-[var(--local-text)] group-hover:text-[var(--local-accent)] transition">
                            {item.name}
                          </h4>
                          {item.price && (
                            <span className="font-display headline-md text-[var(--local-primary)] whitespace-nowrap">
                              {item.price}
                            </span>
                          )}
                        </div>
                        
                        <div className="radice-leader-line" />
                        
                        <p className="text-[var(--local-text-muted)] leading-relaxed">
                          {item.description}
                        </p>
                        
                        {item.dietary && (
                          <Badge className="bg-[var(--local-surface)] border border-[var(--local-border)] text-[var(--local-accent)] technical-label">
                            {item.dietary}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {itemIdx < section.items.length - 1 && (
                      <Separator className="mt-8 bg-[var(--local-border)]" />
                    )}
                  </div>
                ))}
              </div>
              
              {sectionIdx < data.sections.length - 1 && (
                <div className="mt-16 text-center">
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--local-primary)] to-transparent mx-auto" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
