// Layout: Hero=D (EDITORIAL), Features=B (HORIZONTAL SCROLL)
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { IngredientSourcingData, IngredientSourcingSettings } from './types';

export const IngredientSourcing: React.FC<{ data: IngredientSourcingData; settings: IngredientSourcingSettings }> = ({ data }) => {
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-20">
          <div className="lg:col-span-7">
            {data.label && (
              <div className="jp-section-label inline-flex items-center gap-2 technical-label text-[var(--local-accent)] mb-6" data-jp-field="label">
                <span className="w-8 h-px bg-[var(--local-primary)]" />
                {data.label}
              </div>
            )}
            
            <h2 className="font-display display-xl text-[var(--local-text)] mb-8 jp-animate-in" data-jp-field="title">
              {data.title}
            </h2>
            
            <p className="body-lg text-[var(--local-text-muted)] leading-relaxed jp-animate-in jp-d1" data-jp-field="description">
              {data.description}
            </p>
          </div>
          
          {data.philosophy && (
            <div className="lg:col-span-5 jp-animate-in jp-d2">
              <div className="radice-architectural-border p-8">
                <h3 className="technical-label text-[var(--local-accent)] mb-4">Our Philosophy</h3>
                <p className="text-[var(--local-text-muted)] leading-relaxed" data-jp-field="philosophy">
                  {data.philosophy}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Suppliers Horizontal Scroll */}
        <div className="overflow-x-auto pb-8">
          <div className="flex gap-8 min-w-max">
            {data.suppliers.map((supplier, idx) => (
              <Card 
                key={supplier.id || `legacy-${idx}`}
                className="w-80 flex-shrink-0 overflow-hidden radice-architectural-border jp-animate-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
                data-jp-item-id={supplier.id || `legacy-${idx}`}
                data-jp-item-field="suppliers"
              >
                {supplier.image?.url && (
                  <div className="relative overflow-hidden">
                    <img
                      src={supplier.image.url}
                      alt={supplier.image.alt}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--local-bg)]/60 via-transparent to-transparent" />
                  </div>
                )}
                
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display headline-md text-[var(--local-text)]">
                        {supplier.name}
                      </h3>
                      <Badge className="bg-[var(--local-surface)] border border-[var(--local-border)] text-[var(--local-accent)] technical-label">
                        {supplier.location}
                      </Badge>
                    </div>
                    
                    <p className="technical-label text-[var(--local-primary)]">
                      {supplier.specialty}
                    </p>
                  </div>
                  
                  <p className="text-[var(--local-text-muted)] leading-relaxed text-sm">
                    {supplier.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
