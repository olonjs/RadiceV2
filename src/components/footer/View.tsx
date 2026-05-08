import React from 'react';
import type { FooterData, FooterSettings } from './types';

export const Footer: React.FC<{ data: FooterData; settings: FooterSettings }> = ({ data }) => {
  const navItems = Array.isArray(data.menu) ? data.menu : [];
  const socialLinks = Array.isArray(data.socialLinks) ? data.socialLinks : [];

  return (
    <footer
      style={{
        '--local-bg': 'var(--background)',
        '--local-text': 'var(--foreground)',
        '--local-text-muted': 'var(--muted-foreground)',
        '--local-border': 'var(--border)',
        '--local-primary': 'var(--primary)',
      } as React.CSSProperties}
      className="relative z-0 border-t border-[var(--local-border)] bg-[var(--local-bg)]"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <a href="/" aria-label="Radice Home">
              <span className="font-display text-3xl font-bold tracking-tight text-[var(--local-text)]" data-jp-field="logoText">
                {data.logoText}
              </span>
            </a>
            {data.tagline && (
              <p className="mt-4 text-sm leading-relaxed text-[var(--local-text-muted)]" data-jp-field="tagline">
                {data.tagline}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--local-text)]">
                Visit Us
              </h3>
              {data.address && (
                <p className="mt-4 whitespace-pre-line text-sm text-[var(--local-text-muted)]" data-jp-field="address">
                  {data.address}
                </p>
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--local-text)]">
                Contact
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                {data.phone && (
                  <li>
                    <a href={`tel:${data.phone}`} className="text-[var(--local-text-muted)] transition hover:text-[var(--local-primary)]" data-jp-field="phone">
                      {data.phone}
                    </a>
                  </li>
                )}
                {data.email && (
                  <li>
                    <a href={`mailto:${data.email}`} className="text-[var(--local-text-muted)] transition hover:text-[var(--local-primary)]" data-jp-field="email">
                      {data.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--local-text)]">
                Sitemap
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                {navItems.map((item, idx) => (
                  <li key={item.id || `fnav-${idx}`} data-jp-item-id={item.id || `fnav-${idx}`} data-jp-item-field="menu">
                    <a href={item.href} className="text-[var(--local-text-muted)] transition hover:text-[var(--local-primary)]">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-[var(--local-border)] pt-8 sm:flex sm:items-center sm:justify-between">
          <div className="flex space-x-4">
            {socialLinks.map((link, idx) => (
              <a 
                key={link.id || `social-${idx}`} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[var(--local-text-muted)] transition hover:text-[var(--local-primary)]"
                data-jp-item-id={link.id || `social-${idx}`} data-jp-item-field="socialLinks"
              >
                <span className="sr-only">{link.platform}</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {/* Basic placeholder icon, should be replaced with platform-specific icons */}
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs text-[var(--local-text-muted)] sm:mt-0" data-jp-field="copyright">
            {data.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

